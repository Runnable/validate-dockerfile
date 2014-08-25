'use strict';

var commandsRegex = /^(FROM|MAINTAINER|RUN|CMD|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD)/i;

var validate = function (dockerfile) {
  if (typeof dockerfile !== 'string') {
    return false;
  }
  var linesArr = dockerfile.split('\n');

  for (var i = 0; i < linesArr.length; i++) {
    var currentLine = linesArr[i];
    if (!currentLine) {
      // blank lines are valid
      continue;
    }

    if (currentLine[0] === '#') {
      // Comments are valid
      continue;
    }

    if (commandsRegex.test(currentLine)) {
      // Starts with a valid command
      continue;
    }

    return false;
  }

  return true;
};

module.exports = validate;