'use strict';

// FROM and CMD are handled separately
var commandsRegex = /^(MAINTAINER|RUN|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD)/i;

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

  if (!linesArr.length) {
    return false;
  }

  // First line should be FROM command
  if (linesArr[0].toUpperCase().indexOf('FROM') !== 0) {
    return false;
  }

  for (var i = 1; i < linesArr.length; i++) {
    var currentLine = linesArr[i].trim().toUpperCase();

    if (currentLine.indexOf('CMD') === 0) {
      hasCmd = true;
      continue;
    }

    if (commandsRegex.test(currentLine)) {
      // Starts with a valid command
      continue;
    }

    return false;
  }

  return hasCmd;
};

module.exports = validate;