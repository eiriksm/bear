test-cov:
	./node_modules/istanbul/lib/cli.js cover -- ./node_modules/mocha/bin/_mocha -R spec
	- cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js > /dev/null 2>&1

.PHONY: test-cov
