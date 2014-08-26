'use strict';

var instructionsRegex = /^(CMD|FROM|MAINTAINER|RUN|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD)(\s)?/i;

// Some regexes sourced from:
//   http://stackoverflow.com/a/2821201/1216976
//   http://stackoverflow.com/a/3809435/1216976
//   http://stackoverflow.com/a/6949914/1216976
var paramsRegexes = {
  from: /^[a-z0-9.\/-]+(:[a-z0-9.]+)?$/,
  maintainer: /.+/,
  expose: /^[0-9]+([0-9\s]+)?$/,
  env: /^[a-zA-Z_]+[a-zA-Z0-9_]* .+$/,
  user: /^[a-z_][a-z0-9_]{0,30}$/,
  run: /.+/,
  cmd: /.+/,
  onbuild: /.+/,
  entrypoint: /.+/,
  add: /^([A-z0-9\/_.-]+|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))\s[A-z0-9\/_.-]+$/,
  volume: /^([A-z0-9\/_.-]+|\["[A-z0-9\/_.-]+"\])$/,
  workdir: /^[A-z0-9\/_.-]+$/
};

function finish (errors) {
  if (!errors.length) {
    return {
      valid: true
    };
  }
  return {
    valid: false,
    errors: errors
  };
}

function validate(dockerfile) {
  if (typeof dockerfile !== 'string') {
    return finish([{
      message: 'Invalid type'
    }]);
  }

  dockerfile = dockerfile.trim();

  var hasFrom = false;
  var hasCmd = false;
  var currentLine = 0;
  var errors = [];

  var linesArr = dockerfile.split('\n').filter(function (line) {
    var tLine = line.trim();
    return tLine && tLine[0] !== '#';
  });

  function validateLine(line) {
    currentLine++;
    line = line.trim();

    var instruction = instructionsRegex.exec(line);
    if (!instruction) {
      errors.push({
        message: 'Invalid instruction',
        line: currentLine
      });
      return false;
    }
    instruction = instruction[0].trim().toLowerCase();

    var params = line.replace(instructionsRegex, '');
    var validParams = paramsRegexes[instruction].test(params);

    if (!validParams) {
      errors.push({
        message: 'Bad parameters',
        line: currentLine
      });
      return false;
    }
    if (instruction === 'cmd') {
      hasCmd = true;
    }
    return true;
  };

  if (!linesArr.length) {
    errors.push({
      message: 'Empty dockerfile'
    });
    return finish(errors);
  }

  // First line should be FROM instruction
  if (linesArr[0].toUpperCase().indexOf('FROM') !== 0) {
    errors.push({
      message: 'Missing FROM',
      line: 1
    });
  }

  linesArr.forEach(validateLine);

  if (!hasCmd) {
    errors.push({
      message: 'Missing CMD'
    });
  }

  return finish(errors);
};

module.exports = validate;