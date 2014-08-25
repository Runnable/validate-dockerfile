#validate-dockerfile

NodeJS validator for dockerfiles.

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
  - `Missing FROM`
    - `FROM` is not the first instruction in the dockerfile.
    - For more: https://docs.docker.com/reference/builder/#from
  - `Missing CMD`
    - The dockerfile does not contain a `CMD` instruction
    - For more: https://docs.docker.com/reference/builder/#cmd
  - `Empty dockerfile`
    - The dockerfile does not contain any instructions
    - More than likely, you're passing the wrong parameter
  - `Invalid type`
    - You gave us something other than a string

Line numbers will be returned on `Missing FROM` and `Invalid instruction` errors.  Line numbers are zero-based.

##TODO

Non-mission-critical stuff that'd be nice to have:

 - Stream support
 - Set up binary for CLI use

Examples used in testing borrowed from https://github.com/kstaken/dockerfile-examples/tree/master/salt-minion.  Thanks!