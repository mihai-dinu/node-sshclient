var SSH = require('../lib/ssh')
	, ProcResult = require('../lib/procresult')
	, should = require('should');


describe('SSH tests', function() {
	var hostname = 'sph3rISIS';

	describe('SSH basic commands', function() {
		var ssh
			, expected = {
				hostname: 'sph3r'
			};

		before(function(done) {
			ssh = new SSH({
				hostname: hostname
				, debug: 0
			});

			done();
		});

		it('Should print hostname', function(done) {
			ssh.command('hostname', function(procResult) {
				procResult.should.be.an.instanceof(ProcResult, 'ProcResult');
				procResult.stderr.should.be.empty;

				var out = procResult.stdout.replace('\n', '');
				out.should.equal(expected.hostname);
				procResult.exitCode.should.equal(0);

				done();
			});
		});

		it('Should print the parameter', function(done) {
			ssh.command('echo', 'test', function(procResult) {
				procResult.should.be.an.instanceof(ProcResult, 'ProcResult');
				procResult.stderr.should.be.empty;

				var out = procResult.stdout.replace('\n', '');
				out.should.equal('test');
				procResult.exitCode.should.equal(0);

				done();
			});
		});

		it('Should print error message', function(done) {
			ssh.command('asdasdasdasd', 'asdasdasdasd', function(procResult) {
				procResult.should.be.an.instanceof(ProcResult, 'ProcResult');
				procResult.stderr.should.not.be.empty;
				procResult.stderr.indexOf('not found').should.not.equal(-1);
				procResult.stdout.should.be.empty;
				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(127);

				done();
			});
		});
	});

	describe('SSH hostname/connect test', function() {
		it('Should fail to initialize without a hostname parameter', function(done) {
			(function() {
				var ssh = new SSH({});
			}).should.throw('Hostname required!');

			done();
		});

		it('Should fail to connect to dummy host', function(done) {
			var ssh = new SSH({
				hostname: 'dummy' // if not having a 'dummy' entry in your hosts file
			});
			ssh.command('echo', 'test', function(procResult) {
				procResult.stdout.should.be.empty;
				procResult.stderr.should.not.be.empty;
				procResult.stderr.indexOf('Could not resolve hostname').should.not.be.equal(-1);
				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(255);

				done();
			});
		});

		it('Should fail to connect to dummy port', function(done) {
			var ssh = new SSH({
				hostname: hostname
				, port: 12345
				, option: {
					ConnectTimeout: 2
				}
			});
			ssh.command('echo', 'test', function(procResult) {
				procResult.stdout.should.be.empty;
				procResult.stderr.should.not.be.empty;
				procResult.stderr.indexOf('Operation timed out').should.not.be.equal(-1);
				procResult.exitCode.should.not.equal(0);
				procResult.exitCode.should.equal(255);

				done();
			});
		});
	});

	describe('SSH \'stress\' test', function() {
		var ssh;

		before(function() {
			ssh = new SSH({
				hostname: hostname
			});
		});

		it('Should start multiple long-running commands', function(done) {

			function startLong() {
				console.log('Starting long-running command...');
				ssh.command('sleep 4 && echo done', function(procResult) {
					console.log('Long-running command with pid ' + procResult.pid + ' finished');

					procResult.stderr.should.be.empty;
					var out = procResult.stdout.replace('\n', '');
					out.should.equal('done');
					procResult.exitCode.should.equal(0);

					lazyDone();
				});
			};

			var n = 0;
			function lazyDone() {
				n++;
				if(n === 5) {
					done();
				}
			};

			startLong();
			startLong();
			startLong();
			startLong();
			startLong();
		});
	});

});