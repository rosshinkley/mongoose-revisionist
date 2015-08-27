var logger = require('winston'),
    util = require('util'),
    mongoose = require('mongoose'),
    models = require('./models');

module.exports = exports = function(test) {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        level: 'silly',
        colorize: true
    });
    process.on('uncaughtException', function(x) {
        logger.error(util.inspect(x));
        logger.error(x.stack);
    });
    test.connection = mongoose.createConnection('mongodb://localhost/mongoose-revisionist-test');
    test.Simple = test.connection.model('Simple', models.Simple);
    test.Composite = test.connection.model('Composite', models.Composite);
    test.CompositeWithArray = test.connection.model('CompositeWithArray', models.CompositeWithArray);
    test.Reference = test.connection.model('Reference', models.Reference);
    return test;
};
