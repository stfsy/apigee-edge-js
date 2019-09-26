#! /usr/local/bin/node
/*jslint node:true */
// addAppCredential.js
// ------------------------------------------------------------------
// add a new credential, generated or explicitly specified, to a developer app in Apigee Edge.
//
// Copyright 2017-2019 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// last saved: <2019-September-25 17:20:49>

const edgejs     = require('apigee-edge-js'),
      common     = edgejs.utility,
      apigeeEdge = edgejs.edge,
      sprintf    = require('sprintf-js').sprintf,
      Getopt     = require('node-getopt'),
      util       = require('util'),
      version    = '20190925-1708',
      getopt     = new Getopt(common.commonOptions.concat([
      ['p' , 'product=ARG', 'required. name of the API product to enable on this app'],
      ['E' , 'email=ARG', 'required. email address of the developer for which to create the app'],
      ['A' , 'appname=ARG', 'required. name for the app'],
      ['I' , 'clientId=ARG', 'optional. the client id for this credential. Default: auto-generated.'],
      ['S' , 'secret=ARG', 'optional. the client secret for this credential. Default: auto-generated.'],
      ['x' , 'expiry=ARG', 'optional. expiry for the credential']
    ])).bindHelp();

// ========================================================

console.log(
  'Apigee Edge App Credential tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');

// process.argv array starts with 'node' and 'scriptname.js'
var opt = getopt.parse(process.argv.slice(2));

if ( !opt.options.appname ) {
  console.log('You must specify a name of an app');
  getopt.showHelp();
  process.exit(1);
}

if ( !opt.options.product ) {
  console.log('You must specify an API Product');
  getopt.showHelp();
  process.exit(1);
}

if ( !opt.options.email ) {
  console.log('You must specify an email address');
  getopt.showHelp();
  process.exit(1);
}

common.verifyCommonRequiredParameters(opt.options, getopt);
apigeeEdge.connect(common.optToOptions(opt))
  .then ( org => {
    common.logWrite('connected');
    let options = {
          developerEmail : opt.options.email,
          appName : opt.options.appname,
          apiProducts : opt.options.product.split(','),
          expiry : opt.options.expiry
        };

    if (opt.options.clientId) {
      options.clientId = opt.options.clientId;
      options.clientSecret = opt.options.secret;
      if (opt.options.expiry) {
        common.logWrite('WARNING: expiry is not supported with an explicitly-supplied client id and secret');
      }
    }

    return org.appcredentials.add(options)
      .then (result => {
        if (opt.options.clientId) {
          common.logWrite(sprintf('new apikey %s', result.consumerKey));
          common.logWrite(sprintf('secret %s', result.consumerSecret));
        }
        else {
          common.logWrite(sprintf('new apikey %s', result.credentials[0].consumerKey));
          common.logWrite(sprintf('secret %s', result.credentials[0].consumerSecret));
        }
      });
  })
  .catch( e => console.error('error: ' + util.format(e) ) );
