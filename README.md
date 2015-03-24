#validate-dockerfile

NodeJS validator for dockerfiles.  

[![Build Status](https://travis-ci.org/Runnable/validate-dockerfile.svg?branch=master)](https://travis-ci.org/Runnable/validate-dockerfile)
[![Dependency Status](https://david-dm.org/runnable/validate-dockerfile.svg)](https://david-dm.org/runnable/validate-dockerfile)
[![devDependency Status](https://david-dm.org/runnable/validate-dockerfile/dev-status.svg)](https://david-dm.org/runnable/validate-dockerfile#info=devDependencies)
  
[![NPM](https://nodei.co/npm/validate-dockerfile.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/validate-dockerfile)

##Installation

    npm install --save validate-dockerfile

##Usage:

    var validateDockerfile = require('validate-dockerfile');

    var dockerfile = 'FROM ubuntu/nodejs';

    var isValid = validateDockerfile(dockerfile);

##Returned value

If the dockerfile is valid, the object returned will be simply:

    {
      valid: true
    }

If something went wrong somewhere, the object will detail what and where:

    {
      valid: false,
      line: 4,
      message: 'Invalid instruction'
    }

The error messages that can be returned are:

  - `Invalid instruction`
    - There's a instruction that isn't valid for a dockerfile.
    - i.e. `CONJURE stolen_data_tapes`
  - `Bad parameters`
    - An instruction's parameters did not satisfy our regexes.
    - i.e. `FROM Incom/Z-95 Headhunter`
  - `Missing or misplaced FROM`
    - `FROM` is not the first instruction in the dockerfile.
    - For more: https://docs.docker.com/reference/builder/#from
  - `Missing CMD`
    - The dockerfile does not contain a `CMD` instruction
    - For more: https://docs.docker.com/reference/builder/#cmd
  - `Invalid type`
    - You gave us something other than a string

Line numbers will be returned on `Missing FROM`, `Bad parameters` and `Invalid instruction` errors.


##CLI

Install validate-dockerfile globally (`npm install -g validate-dockerfile`) to gain access to `docklint`, the CLI wrapper for validate-dockerfile.

`docklint` takes one parameter, the path to a Dockerfile.  If no path is given, it looks for a Dockerfile in the current directory.  It will exit with a code of `0` if the Dockerfile is legit, `1` otherwise.


##TODO

Non-mission-critical stuff that'd be nice to have:

 - Stream support

Examples used in testing borrowed from https://github.com/kstaken/dockerfile-examples/tree/master/salt-minion.  Thanks!
