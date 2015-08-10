'use strict';

require('should');

var EOL = require('os').EOL;
var callbackCount = require('callback-count');
var find = require('find')
var fs = require('fs');
var path = require('path');
var validateDockerfile = require('../');

// dockerfiles tested here from https://github.com/kstaken/dockerfile-examples/tree/master/salt-minion
describe('valid dockerfiles', function () {
  it('should approve all valid dockerfiles', function (done) {
    var counter = callbackCount(done);
    find.eachfile(/.*[0-9]$/, path.join(__dirname, 'Dockerfiles'), function (file) {
      counter.inc();
      fs.readFile(file, 'UTF-8', function (err, data) {
        if (err) {
          throw err;
        }
        var isValid = validateDockerfile(data);
        if (!isValid.valid) {
          counter.next(new Error(isValid.errors[0].message + ' ' + isValid.errors[0].line + ' ' + file));
        }
        counter.next();
      });
    });
  });

  it('Should take a missing CMD w/ quiet enabled', function () {
    var dockerfile = 'FROM Vader/Death-Star' + EOL;

    var result = validateDockerfile(dockerfile, { quiet: true });

    result.should.be.an.Object;
    result.should.have.property('valid', true);
  });
});

describe('invalid dockerfiles', function () {
  it('should complain about an invalid instruction', function () {
    var dockerfile = 'FROM vader/force-powers' + EOL + 'CONJURE stolen_data_tapes';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(2);
    result.errors[0].should.have.property('message', 'Invalid instruction');
    result.errors[0].should.have.property('line', 2);
    result.errors[0].should.have.property('priority', 0);
    result.errors[1].should.have.property('message', 'Missing CMD');
    result.errors[1].should.have.property('priority', 1);
    result.errors[1].should.not.have.property('line');
  });

  it('should complain about bad parameters', function () {
    var dockerfile = 'FROM Incom/Z-95 Headhunter';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(2);
    result.errors[0].should.have.property('message', 'Bad parameters');
    result.errors[0].should.have.property('priority', 1);
    result.errors[0].should.have.property('line', 1);
    result.errors[1].should.have.property('message', 'Missing CMD');
    result.errors[1].should.have.property('priority', 1);
    result.errors[1].should.not.have.property('line');
  });

  it('should complain about bad format of an array', function () {
    var dockerfile = ['FROM thyferra/bacta',
      'CMD ["heal, "paitent"]'
    ].join(EOL);

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Malformed parameters');
    result.errors[0].should.have.property('line', 2);
    result.errors[0].should.have.property('priority', 1);
  });

  it('should complain about bad input in an array', function () {
    var dockerfile = ['FROM thyferra/bacta',
      'CMD ["asdfasdf", ""]'
    ].join(EOL);

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Malformed parameters');
    result.errors[0].should.have.property('line', 2);
    result.errors[0].should.have.property('priority', 1);
  });


  it('should flunk a file with no FROM', function () {
    var dockerfile = 'Hi mom!';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(3);
    result.errors[0].should.have.property('message', 'Missing or misplaced FROM');
    result.errors[0].should.have.property('priority', 0);
    result.errors[0].should.have.property('line', 1);
    result.errors[1].should.have.property('message', 'Invalid instruction');
    result.errors[1].should.have.property('line', 1);
    result.errors[1].should.have.property('priority', 0);
    result.errors[2].should.have.property('message', 'Missing CMD');
    result.errors[2].should.have.property('priority', 1);
    result.errors[2].should.not.have.property('line');
  });

  it('should flunk a file with no CMD', function () {
    var dockerfile = 'FROM wedge/rogue-squadron';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Missing CMD');
    result.errors[0].should.have.property('priority', 1);
    result.errors[0].should.not.have.property('line');
  });

  it('gives the correct line when there are comments', function () {
    var dockerfile = ['FROM thyferra/bacta',
      '# Heal them up',
      'RN ./fill-bacta-tank',
      'CMD heal paitent'
    ].join(EOL);

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Invalid instruction');
    result.errors[0].should.have.property('line', 3);
    result.errors[0].should.have.property('priority', 0);
  });

  it('gives the correct line when there are blank lines', function () {
    var dockerfile = ['FROM thyferra/bacta',
      '',
      'RN ./fill-bacta-tank',
      'CMD heal paitent'
    ].join(EOL);

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Invalid instruction');
    result.errors[0].should.have.property('line', 3);
    result.errors[0].should.have.property('priority', 0);
  });

  describe('empty', function () {
    it('rejects an empty string', function () {
      var dockerfile = '';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(2);
      result.errors[0].should.have.property('message', 'Missing or misplaced FROM');
      result.errors[0].should.have.property('priority', 0);
      result.errors[0].should.have.property('line', 1);
      result.errors[1].should.have.property('message', 'Missing CMD');
      result.errors[1].should.have.property('priority', 1);
      result.errors[1].should.not.have.property('line');
    });

    it('rejects a dockerfile with only comments', function () {
      var dockerfile = '#Witness the power of this' + EOL + '#Fully documented battlestation';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(2);
      result.errors[0].should.have.property('message', 'Missing or misplaced FROM');
      result.errors[0].should.have.property('priority', 0);
      result.errors[0].should.have.property('line', 1);
      result.errors[1].should.have.property('message', 'Missing CMD');
      result.errors[1].should.have.property('priority', 1);
      result.errors[1].should.not.have.property('line');
    });

    it('rejects a dockerfile with only newlines', function () {
      var dockerfile = EOL + EOL + EOL + EOL + EOL;

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(2);
      result.errors[0].should.have.property('message', 'Missing or misplaced FROM');
      result.errors[0].should.have.property('priority', 0);
      result.errors[0].should.have.property('line', 1);
      result.errors[1].should.have.property('message', 'Missing CMD');
      result.errors[1].should.have.property('priority', 1);
      result.errors[1].should.not.have.property('line');
    });
  });

  it('rejects non-string dockerfiles', function () {
    var dockerfile = ['a long time ago', 'in a galaxy far far away'];

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Invalid type');
    result.errors[0].should.have.property('priority', 0);
    result.errors[0].should.not.have.property('line');
  });
});
