'use strict';

require('should');

var exec = require('child_process').exec;

describe('docklint', function () {
  it('should allow a valid Dockerfile', function (done) {
    exec('./bin/docklint ./test/Dockerfiles/dockerfile-0',
      function (err, stdout, stderr) {
        if (err) { return done(err); }

        stdout.should.eql('Dockerfile looks good!\n');
        stderr.should.eql('');
        done();
    });
  });

  it.skip('should allow a valid Dockerfile in the same dir', function (done) {
    exec('./bin/docklint ./test/Dockerfiles/dockerfile-0',
      function (err, stdout, stderr) {
        if (err) { return done(err); }

        stdout.should.eql('Dockerfile looks good!\n');
        stderr.should.eql('');
        done();
    });
  });

  it('should fail an invalid Dockerfile', function (done) {
    exec('./bin/docklint ./test/Dockerfiles/dockerfile-bad',
      function (err, stdout, stderr) {
        stdout.should.eql('');
        stderr.should.eql(['VALIDATION FAILED', 
          'Missing FROM',
          'Invalid instruction',
          'Missing CMD',
          ''].join('\n'));
        err.code.should.eql(1);
        done();
    });
  });

  it('should complain when pointed to a non-existant file', function (done) {
    exec('./bin/docklint ./test/Dockerfiles/data-tapes',
      function (err, stdout, stderr) {
        stdout.should.eql('');
        stderr.should.eql('ERROR: Dockerfile not found\n');
        err.code.should.eql(1);
        done();
    });
  });
});