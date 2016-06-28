test-cov:
	npm run coverage
	- cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js > /dev/null 2>&1

.PHONY: test-cov
