#validate-dockerfile

NodeJS validator for dockerfiles.

##Warning!

This is not production-ready.  Yet to do:

 - Per-command validation
 - Further testing (say, actual unit tests and such)

##Installation

    npm install --save validate-dockerfile

##Usage:

    var validateDockerfile = require('validate-dockerfile');

    var dockerfile = 'FROM ubuntu/nodejs';

    var isValid = validateDockerfile(dockerfile);


##TODO

Non-mission-critical stuff that'd be nice to have:

 - Stream support

Examples used in testing borrowed from https://github.com/kstaken/dockerfile-examples/tree/master/salt-minion.  Thanks!