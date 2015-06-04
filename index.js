'use strict';

var path = require('path');
var EOL = require('os').EOL;

var instructionsRegex = /^(CMD|FROM|MAINTAINER|RUN|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD|COPY)(\s*)/i;

// Some regexes sourced from:
//   http://stackoverflow.com/a/2821201/1216976
//   http://stackoverflow.com/a/3809435/1216976
//   http://stackoverflow.com/a/6949914/1216976
var paramsRegexes = {
  from: /^[a-z0-9.\/_-]+(:[a-z0-9._-]+)?$/,
  maintainer: /.+/,
  expose: /^[0-9]+([0-9\s]+)?$/,
  env: /^[a-zA-Z_]+[a-zA-Z0-9_]* .+$/,
  user: /^[a-z_][a-z0-9_]{0,30}$/,
  run: /.+/,
  cmd: /.+/,
  onbuild: /.+/,
  entrypoint: /.+/,
  add: /^(~?[A-z0-9\/_.-]+|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))\s~?[A-z0-9\/_.-]+$/,
  copy: /^(~?[A-z0-9\/_.-]+|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))\s~?[A-z0-9\/_.-]+$/,
  volume: /^~?([A-z0-9\/_.-]+|\[(\s*)?("[A-z0-9\/_. -]+"(,\s*)?)+(\s*)?\])$/,
  workdir: /^~?[A-z0-9\/_.-]+$/
};

function isDirValid (dir) {
  return path.normalize(dir).indexOf('..') !== 0;
}

function addCopy (params) {
  if (params.indexOf('http') === 0) {
    // No need to normalize a url
    return true;
  }
  return isDirValid(params.split(' ')[0]);
}

var paramValidators = {
  add: addCopy,
  copy: addCopy
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
      message: 'Invalid type',
      priority: 0
    }]);
  }

  dockerfile = dockerfile.trim();

  var fromCheck = false;
  var hasCmd = false;
  var escapedNewline = false;
  var currentLine = 0;
  var errors = [];

  var linesArr = dockerfile.split(EOL);

  function validateLine(line) {
    currentLine++;
    if (!line.trim() || line[0] === '#') {
      return;
    }

    var thisLineEscaped = escapedNewline;
    escapedNewline = line.slice(-1) === '\\';

    if (thisLineEscaped) {
      return;
    }

    // Whitespace on the ends will not break Dockerfile (see #13)
    line = line.trim();

    // First instruction must be FROM
    if (!fromCheck) {
      fromCheck = true;
      if (line.toUpperCase().indexOf('FROM') !== 0) {
        errors.push({
          message: 'Missing or misplaced FROM',
          line: currentLine,
          priority: 0
        });
      }
    }

    var instruction = instructionsRegex.exec(line);
    if (!instruction) {
      errors.push({
        message: 'Invalid instruction',
        line: currentLine,
        priority: 0
      });
      return false;
    }
    instruction = instruction[0].trim().toLowerCase();

    var params = line.replace(instructionsRegex, '');
    var validParams = paramsRegexes[instruction].test(params)
      && (paramValidators[instruction] ? paramValidators[instruction](params) : true);

    if (!validParams) {
      errors.push({
        message: 'Bad parameters',
        line: currentLine,
        priority: 1
      });
      return false;
    }
    if (instruction === 'cmd') {
      hasCmd = true;
    }
    return true;
  }

  linesArr.forEach(validateLine);

  if (!fromCheck) {
    errors.push({
      message: 'Missing or misplaced FROM',
      line: 1,
      priority: 0
    });
  }

  if (!hasCmd) {
    errors.push({
      message: 'Missing CMD',
      priority: 1
    });
  }

  return finish(errors);
}

module.exports = validate;
