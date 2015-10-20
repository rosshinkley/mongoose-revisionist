##0.1.2
- Changes out nodeunit for mocha to get a little more control over when connections and models are created for testing.
- The move to mocha fixes #2 - the memory leak at test-time when connections and models are being created and destroyed in rapid succession.

##0.1.1
- fixes #1 - poor naming conventions led to the wrong name being used in index.

##0.1.0
Initial release.
