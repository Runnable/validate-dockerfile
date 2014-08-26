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
    find.eachfile(/.[0-9]/, path.join(__dirname, 'Dockerfiles'), function (file) {
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
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(2);
    result.errors[0].should.have.property('message', 'Invalid instruction');
    result.errors[0].should.have.property('line', 2);
    result.errors[1].should.have.property('message', 'Missing CMD');
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
    result.errors[0].should.have.property('line', 1);
    result.errors[1].should.have.property('message', 'Missing CMD');
    result.errors[1].should.not.have.property('line');
  });

  it('should flunk a file with no FROM', function () {
    var dockerfile = 'Hi mom!';

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(3);
    result.errors[0].should.have.property('message', 'Missing FROM');
    result.errors[0].should.have.property('line', 1);
    result.errors[1].should.have.property('message', 'Invalid instruction');
    result.errors[1].should.have.property('line', 1);
    result.errors[2].should.have.property('message', 'Missing CMD');
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
    result.errors[0].should.not.have.property('line');
  });

  describe('empty', function () {
    it('rejects an empty string', function () {
      var dockerfile = '';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Empty dockerfile');
      result.errors[0].should.not.have.property('line');
    });

    it('rejects a dockerfile with only comments', function () {
      var dockerfile = '#Witness the power of this\n#Fully documented battlestation';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Empty dockerfile');
      result.errors[0].should.not.have.property('line');
    });

    it('rejects a dockerfile with only newlines', function () {
      var dockerfile = '\n\n\n\n\n';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Empty dockerfile');
      result.errors[0].should.not.have.property('line');
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
    result.errors[0].should.not.have.property('line');
  });
});

describe('params', function () {
  describe('from', function () {
    it('Should take a standard FROM', function () {
      var dockerfile = 'FROM vader/death-star\nCMD ["destroy", "Yavin IV"]';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should reject with capital letters', function () {
      var dockerfile = 'FROM Vader/Death-Star\nCMD ["destroy", "Yavin IV"]';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 1);
    });
  });

  describe('maintainer', function () {
    it('Should take a standard MAINTAINER', function () {
      var dockerfile = ['FROM vader/death-star',
      'MAINTAINER Grand Moff Tarkin <wtarkin@empire.com>',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should reject with no parameters', function () {
      var dockerfile = ['FROM vader/death-star',
      'MAINTAINER',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  describe('expose', function () {
    it('Should take a standard EXPOSE', function () {
      var dockerfile = ['FROM vader/death-star',
      'EXPOSE 80',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('allows multiple ports', function () {
      var dockerfile = ['FROM vader/death-star',
      'EXPOSE 80 443',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should reject with letters', function () {
      // See, if the Imperials had used unit testing, they'd be much better off
      var dockerfile = ['FROM vader/death-star',
      'EXPOSE exhaust port',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  describe('env', function () {
    it('Should take a standard ENV', function () {
      var dockerfile = ['FROM vader/death-star',
      'ENV battlestation fully_armed',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('allows multiple characters', function () {
      var dockerfile = ['FROM vader/death-star',
      'ENV tk_421 absent',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should reject with no second parameter', function () {
      var dockerfile = ['FROM vader/death-star',
      'ENV stand_by',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  describe('user', function () {
    it('Should take a standard USER', function () {
      var dockerfile = ['FROM vader/death-star',
      'USER not_r2',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Rejects a username starting with a number', function () {
      var dockerfile = ['FROM vader/death-star',
      'USER 1138',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });

    it('Should reject a username with > 31 characters', function () {
      var dockerfile = ['FROM vader/death-star',
      'USER RUARRRRRRRRRRRRRRRRRRRRRRRRRRRRRGH',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  // Skipping these until we have actual regexes
  describe.skip('run', function() {});
  describe.skip('cmd', function() {});
  describe.skip('onbuild', function() {});
  describe.skip('entrypoint', function() {});

  describe('add', function () {
    it('Should take a standard filepath ADD', function () {
      var dockerfile = ['FROM vader/death-star',
      'ADD ./tie-fighter /hangar',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should take a standard url ADD', function () {
      var dockerfile = ['FROM vader/death-star',
      'ADD http://superlaser.com /Alderaan',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Rejects a malformed URL', function () {
      var dockerfile = ['FROM vader/death-star',
      'ADD htp://superlaser.com /Alderaan',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });

    it('Rejects a ADD with one parameter', function () {
      var dockerfile = ['FROM vader/death-star',
      'ADD ./tie-fighter',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  describe('volume', function () {
    it('Should take a standard VOLUME', function () {
      var dockerfile = ['FROM vader/death-star',
      'VOLUME ./1.72x10tothe7thpower',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should take a JSON array VOLUME', function () {
      var dockerfile = ['FROM vader/death-star',
      'VOLUME ["./1.72x10tothe7thpower"]',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Rejects improper JSON', function () {
      var dockerfile = ['FROM vader/death-star',
      'VOLUME ["1.72',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', false);
      result.should.have.property('errors');
      result.errors.should.be.an.Array;
      result.errors.length.should.eql(1);
      result.errors[0].should.have.property('message', 'Bad parameters');
      result.errors[0].should.have.property('line', 2);
    });
  });

  describe('workdir', function () {
    it('Should take a standard WORKDIR', function () {
      var dockerfile = ['FROM vader/death-star',
      'WORKDIR ./Despayre',
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });
  });
});