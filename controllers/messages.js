var config = require('../config')
  , utils = require('../utils');

exports.create = function(req, res) {
    config.message_hub.send(req.user, req.body, function(err, messages) {
        if (err) return utils.handleError(res, err);

        res.send({ "messages": messages });
    });
};
