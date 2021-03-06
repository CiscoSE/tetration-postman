/*
Copyright (c) 2018 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.0 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.

__author__ = "Chris McHenry"
__copyright__ = "Copyright (c) 2018 Cisco and/or its affiliates."
__license__ = "Cisco Sample Code License, Version 1.0
*/

//Generate a UTC Timestamp with the Tetration expected format that can be used in the request header
function pad(n) {
     return (n < 10) ? '0' + n : n;
}

var now = new Date();
var month = now.getUTCMonth() + 1
var timestamp = now.getUTCFullYear()+'-'+pad(month)+'-'+pad(now.getUTCDate())+'T'+pad(now.getUTCHours())+':'+pad(now.getUTCMinutes())+':'+pad(now.getUTCSeconds())+'+0000';

//Calculate the body checksum if it is a POST or PUT request
var checksum = '';
if (request.method == 'POST' || request.method == 'PUT') {
    checksum = CryptoJS.SHA256(request.data)
    checksum = CryptoJS.enc.Hex.stringify(checksum)
}

//Calculate the Digest which is generated based on the timestamp, checksum, additional header parameters, and the secret key
var signer = request.method + '\n/openapi/v1/' + request.url.split('/openapi/v1/')[1] + '\n' + checksum + '\napplication/json\n' + timestamp + '\n';

var digestauth = CryptoJS.HmacSHA256(signer, pm.environment.get('API_SECRET'));
digestauth = CryptoJS.enc.Base64.stringify(digestauth);

//Add headers to request
pm.request.headers.add( { key: 'Id', value: pm.environment.get('API_KEY') } );
pm.request.headers.add( { key: 'Authorization', value: digestauth } );
pm.request.headers.add( { key: 'Timestamp', value: timestamp } );
if (request.method == 'POST' || request.method == 'PUT') {
    pm.request.headers.add( { key: 'X-Tetration-Cksum', value: checksum } );
}