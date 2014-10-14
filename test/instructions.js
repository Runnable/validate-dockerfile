'use strict';

/**
 * Tests for specific Dockerfile instructions
 */

var validateDockerfile = require('../');

function expectsSuccess (line) {
  return function () {
    var dockerfile = ['FROM vader/death-star',
      line,
      'CMD ["destroy", "Yavin IV"]'].join('\n');

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
  };
}

function expectsFailure (line) {
  return function () {
    var dockerfile = ['FROM vader/death-star',
    line,
    'CMD ["destroy", "Yavin IV"]'].join('\n');

    var result = validateDockerfile(dockerfile);

    result.should.be.an.Object;
    result.should.have.property('valid', false);
    result.should.have.property('errors');
    result.errors.should.be.an.Array;
    result.errors.length.should.eql(1);
    result.errors[0].should.have.property('message', 'Bad parameters');
    result.errors[0].should.have.property('line', 2);
  };
}

describe('required instructions', function () {
  describe('from', function () {
    it('Should take a standard FROM', expectsSuccess(''));

    it('should allow versions', function () {
      var dockerfile = 'FROM vader/deathstar:2\nCMD ["destroy", "Yavin IV"]';

      var result = validateDockerfile(dockerfile);

      result.should.be.an.Object;
      result.should.have.property('valid', true);
      result.should.not.have.property('message');
      result.should.not.have.property('line');
    });

    it('Should allow underscores', function() {
      var dockerfile = 'FROM vader/death_star:2\nCMD ["destroy", "Yavin IV"]';

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

  describe('cmd', function () {
    it('Should take a standard CMD', expectsSuccess(''));

    it.skip('Should reject with invalid parameters');
  });
});

describe('generic instructions', function() {
  describe('formatting', function() {
    it('should allow multiple spaces between command and params', expectsSuccess(
      'RUN     kessel'
    ));
  });
});

describe('optional instructions', function () {
  describe('maintainer', function () {
    it('Should take a standard MAINTAINER', expectsSuccess(
      'MAINTAINER Grand Moff Tarkin <wtarkin@empire.com>'
    ));

    it('Should reject with no parameters', expectsFailure(
      'MAINTAINER'
    ));

    it('Should reject with just a space', expectsFailure(
      'MAINTAINER '
    ));
  });

  describe('expose', function () {
    it('Should take a standard EXPOSE', expectsSuccess(
      'EXPOSE 80'
    ));

    it('allows multiple ports', expectsSuccess(
      'EXPOSE 80 443'
    ));

    // See, if the Imperials had used unit testing, they'd be much better off
    it('Should reject with letters', expectsFailure(
      'EXPOSE exhaust port'
    ));
  });

  describe('env', function () {
    it('Should take a standard ENV', expectsSuccess(
      'ENV battlestation fully_armed'
    ));

    it('allows multiple characters', expectsSuccess(
      'ENV tk_421 absent'
    ));

    it('Should reject with no second parameter',  expectsFailure(
      'ENV stand_by'
    ));
  });

  describe('user', function () {
    it('Should take a standard USER', expectsSuccess(
      'USER not_r2'
    ));

    it('Rejects a username starting with a number', expectsFailure(
      'USER 1138'
    ));

    it('Should reject a username with > 31 characters', expectsFailure(
      'USER RUARRRRRRRRRRRRRRRRRRRRRRRRRRRRRGH'
    ));
  });

  // Skipping these until we have actual regexes
  describe.skip('run', function() {});
  describe.skip('onbuild', function() {});
  describe.skip('entrypoint', function() {});

  describe('add', function () {
    it('Should take a standard filepath ADD', expectsSuccess(
      'ADD ./tie-fighter /hangar'
    ));

    it('Should take a standard url ADD', expectsSuccess(
      'ADD http://superlaser.com /Alderaan'
    ));

    it('Allows ADD commands that reference homedir', expectsSuccess(
      'ADD ~/tie-fighter ~/hangar'
    ));

    it('Rejects a malformed URL', expectsFailure(
      'ADD htp://superlaser.com /Alderaan'
    ));

    it('Rejects a ADD with one parameter', expectsFailure(
      'ADD ./tie-fighter'
    ));

    it('Rejects an ADD that goes above the current dir', expectsFailure(
      'ADD ../superior-firepower/superlaser /superlaser'
    ));

    it('Rejects an ADD that goes above the current dir even when ../ is hidden', expectsFailure(
      'ADD ./grand-moff/../../superior-firepower/superlaser /superlaser'
    ));
  });

  describe('volume', function () {
    it('Should take a standard VOLUME', expectsSuccess(
      'VOLUME ./1.72x10tothe7thpower'
    ));

    it('Should take a JSON array VOLUME', expectsSuccess(
      'VOLUME ["./1.72x10tothe7thpower"]'
    ));

    it('Should take a JSON array VOLUME with multiple items', expectsSuccess(
      'VOLUME ["./1.72x10tothe7thpower", "./4/3pi_r_square"]'
    ));

    it('Should take a VOLUME that references homedir', expectsSuccess(
      'VOLUME ~/1.72x10tothe7thpower'
    ));

    it('Rejects improper JSON', expectsFailure(
      'VOLUME ["1.72'
    ));
  });

  describe('workdir', function () {
    it('Should take a standard WORKDIR', expectsSuccess(
      'WORKDIR ./Despayre'
    ));

    it('Should take a WORKDIR that references homedir', expectsSuccess(
      'WORKDIR ~/Despayre'
    ));
  });
});
