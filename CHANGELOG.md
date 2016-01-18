##0.2.0
- Removes `created`, `createdBy`, `modified` and `modifiedBy`.  Those are not required for this library to function and should be details left to the user.
- Adds `diff` for versions and dates.
- Condenses the unit tests considerably by breaking out model creation.

##0.1.2
- Changes out nodeunit for mocha to get a little more control over when connections and models are created for testing.  This also prevents connection thrashing.
- The move to mocha fixes #2 - the global error handler was being added for every test, causing the EventEmitter memory leak warning to be tripped.  Moving the event handler addition to the root hooks ensures the listener is only added once.

##0.1.1
- fixes #1 - poor naming conventions led to the wrong name being used in index.

##0.1.0
Initial release.
