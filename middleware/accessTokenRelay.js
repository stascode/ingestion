var config = require('../config')
  , log = require('winston')
  , passport = require('passport')
  , utils = require('../utils');

module.exports = function(req, res, next) {
    var auth = passport.authenticate(['bearer'], { session: false });
    req.pause();

    auth(req, res, function(err, failed) {
        if (err) {
            req.resume();
            return utils.handleError(res, utils.authenticationError(err));
        }

        next();
    });
};