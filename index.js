'use strict';

// FROM and CMD are handled differently
var commandsRegex = /^(MAINTAINER|RUN|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD)/i;

var validate = function (dockerfile) {
  if (typeof dockerfile !== 'string') {
    return false;
  }
  var linesArr = dockerfile.split('\n')
    , hasFrom = false
    , hasCmd = false;

  for (var i = 0; i < linesArr.length; i++) {
    var currentLine = linesArr[i].trim().toUpperCase();
    if (!currentLine) {
      // blank lines are valid
      continue;
    }

    if (currentLine[0] === '#') {
      // Comments are valid
      continue;
    }

    if (currentLine.indexOf('FROM') === 0) {
      hasFrom = true;
      continue;
    }

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

  return hasFrom && hasCmd;
};

module.exports = validate;