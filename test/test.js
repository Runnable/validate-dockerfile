'use strict';

require('should');

var validateDockerfile = require('../')
  , find = require('find')
  , fs = require('fs')
  , path = require('path')
  , callbackCount = require('callback-count');

describe('valid dockerfiles', function () {
  it('should approve all valid dockerfiles', function (done) {
    var counter = callbackCount(done);
    find.eachfile(/./, path.join(__dirname, 'Dockerfiles'), function (file) {
      counter.inc();

      fs.readFile(file, 'UTF-8', function (err, data) {
        if (err) {
          throw err;
        }
        var isValid = validateDockerfile(data);
        if (!isValid.valid) {
          counter.next(new Error(isValid.message));
        }
        counter.next();
      });
    });
  });
});

describe('invalid dockerfiles', function () {
  it('should complain about an invalid instruction', function () {
    var dockerfile = 'FROM vader/force-powers\nCONJURE stolen_data_tapes';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('message', 'Invalid instruction');
    result.should.have.property('line', 1);
  });

  it('should complain about bad parameters', function () {
    var dockerfile = 'FROM Incom/Z-95 Headhunter';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('message', 'Bad parameters');
    result.should.have.property('line', 0);
  });

  it('should flunk a file with no FROM', function () {
    var dockerfile = 'Hi mom!';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('message', 'Missing FROM');
    result.should.have.property('line', 0);
  });

  it('should flunk a file with no CMD', function () {
    var dockerfile = 'FROM wedge/rogue-squadron';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('message', 'Missing CMD');
    result.should.not.have.property('line');
  });

  describe('empty', function () {
    it('rejects an empty string', function () {
      var dockerfile = '';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('message', 'Empty dockerfile');
      result.should.not.have.property('line');
    });

    it('rejects a dockerfile with only comments', function () {
      var dockerfile = '#Witness the power of this\n#Fully documented battlestation';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('message', 'Empty dockerfile');
      result.should.not.have.property('line');
    });

    it('rejects a dockerfile with only newlines', function () {
      var dockerfile = '\n\n\n\n\n';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('message', 'Empty dockerfile');
      result.should.not.have.property('line');
    });
  });

  it('rejects non-string dockerfiles', function () {
    var dockerfile = ['a long time ago', 'in a galaxy far far away'];

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('message', 'Invalid type');
    result.should.not.have.property('line');
  })
});