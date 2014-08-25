'use strict';

var instructionsRegex = /^(CMD|FROM|MAINTAINER|RUN|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD)\s/i;

// Some regexes sourced from:
//   http://stackoverflow.com/a/2821201/1216976
//   http://stackoverflow.com/a/3809435/1216976
var validParams = {
  from: /^[A-z0-9.\/]*(:[A-z0-9.]*)?$/,
  maintainer: /.*/,
  expose: /^[0-9\s]*$/,
  env: /^[a-zA-Z_]+[a-zA-Z0-9_]* .*$/,
  user: /^[A-z0-9]$/,
  run: /.*/,
  cmd: /.*/,
  onbuild: /.*/,
  entrypoint: /.*/,
  add: /^[A-z0-9\/_.-]*|[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*) [A-z0-9\/_.-]*$/,
  volume: /^(\[")?[A-z0-9\/_.-]*("\])?/,
  workdir: /^[A-z0-9\/_.-]*$/
};

var validate = function (dockerfile) {
  if (typeof dockerfile !== 'string') {
    return false;
  }

  dockerfile = dockerfile.trim();

  var hasFrom = false
    , hasCmd = false;

  var linesArr = dockerfile.split('\n').filter(function (line) {
    var tLine = line.trim();
    return tLine && tLine[0] !== '#';
  });

  var validateLine = function (line) {
    line = line.trim();
    var instruction = instructionsRegex.exec(line)[0].trim().toLowerCase();
    var params = line.replace(instructionsRegex, '');
    var validCommand = validParams[instruction].test(params);
    if (validCommand && instruction === 'cmd') {
      hasCmd = true;
    }
    return validCommand;
  };

  if (!linesArr.length) {
    return false;
  }

  // First line should be FROM instruction
  if (linesArr[0].toUpperCase().indexOf('FROM') !== 0) {
    return false;
  }

  var validLines = linesArr.every(validateLine);

  return validLines && hasCmd;
};

module.exports = validate;