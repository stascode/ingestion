var log = require('winston')
  , Loggly = require('winston-loggly').Loggly
  , localProviders = require('nitrogen-local-providers');

var config = null;

if (process.env.NODE_ENV === "production") {
    config = {
        internal_port: process.env.PORT,
    };

    if (!process.env.ACCESS_TOKEN_SIGNING_KEY) {
        console.log('FATAL ERROR: you must provide an ACCESS_TOKEN_SIGNING_KEY as an environmental variable.');
        process.exit(0);
    }
} else if (process.env.NODE_ENV === "test") {
    config = {
        external_port: 3052,
        internal_port: 3052,
        protocol: 'http',
        mongodb_connection_string: "mongodb://localhost/nitrogen_test",
        web_admin_uri: "http://localhost:9000"
    };
} else {
    config = {
        external_port: 3032,
        protocol: 'http',
        mongodb_connection_string: "mongodb://localhost/nitrogen_dev",
        web_admin_uri: "http://localhost:9000"
    };
}

config.internal_port = config.internal_port || 3040;
config.external_port = config.external_port || 443;

config.access_token_signing_key = process.env.ACCESS_TOKEN_SIGNING_KEY || '12345678901234567890123456789012';

// Endpoint URI configuration

config.api_path = "/api/";
config.v1_api_path = config.api_path + "v1";

config.host = process.env.HOST_NAME || config.host || "localhost";

config.base_endpoint = config.protocol + "://" + config.host + ":" + config.external_port;
config.api_endpoint = config.base_endpoint + config.v1_api_path;

config.messages_path = config.v1_api_path + "/messages";
config.messages_endpoint = config.base_endpoint + config.messages_path;

config.ops_path = config.v1_api_path + "/ops";
config.ops_endpoint = config.base_endpoint + config.ops_path;

config.request_log_format = ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent"';

// You can use Loggly's log service by specifying these 4 environmental variables
if (process.env.LOGGLY_SUBDOMAIN && process.env.LOGGLY_INPUT_TOKEN &&
    process.env.LOGGLY_USERNAME && process.env.LOGGLY_PASSWORD) {

    log.add(Loggly, {
        "subdomain": process.env.LOGGLY_SUBDOMAIN,
        "inputToken": process.env.LOGGLY_INPUT_TOKEN,
        "auth": {
            "username": process.env.LOGGLY_USERNAME,
            "password": process.env.LOGGLY_PASSWORD
        }
    });
}

log.remove(log.transports.Console);
log.add(log.transports.Console, { colorize: true, timestamp: true, level: 'info' });

// Validate all message schemas to conform to all core and installed schemas.
config.validate_schemas = true;

// Configure the Message Hub provider to use to push messages to.
config.message_hub = new localProviders.ProxyMessageHub({
    messages_endpoint: process.env.PROXY_MESSAGES_ENDPOINT || 'http://localhost:3053/api/v1/messages'
});

module.exports = config;
