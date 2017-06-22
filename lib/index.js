const unirest = require('unirest');
const validate = require('validate.js');
const _ = require('lodash');

const Common = require('./common');

const SMS = require('./sms');
const USSD = require('./ussd');
const Airtime = require('./airtime');
const Voice = require('./voice');
const Payment = require('./payments');


function AfricasTalking(options) {
    this.options = _.cloneDeep(options);

    validate.validators.isString = (value) => {
        if (validate.isEmpty(value) || validate.isString(value)) { // String or null & undefined
            return null;
        }
        return 'must be a string';
    };

    const constraints = {
        format: {
            inclusion: ['json', 'xml'],
        },
        username: {
            presence: true,
            isString: true,
        },
        apiKey: {
            presence: true,
            isString: true,
        },
    };

    const error = validate(this.options, constraints);
    if (error) {
        throw error;
    }

    switch (this.options.format) {
    case 'xml':
        this.options.format = 'application/xml';
        break;
    case 'json': // Get json by default
    default:
        this.options.format = 'application/json';
    }

    if (this.options.sandbox === true || this.options.debug === true) {
        Common.enableSandbox();
    }

    this.SMS = new SMS(this.options);
    this.VOICE = new Voice(this.options);
    this.PAYMENTS = new Payment(this.options);
    this.PAYMENT = this.PAYMENTS; /* So we don't break apps using old version */
    this.AIRTIME = new Airtime(this.options);
    this.USSD = USSD;
}

// Account
AfricasTalking.prototype.fetchAccount = function fx() {
    const self = this;

    return new Promise(((resolve, reject) => {
        const rq = unirest.get(Common.USER_URL);
        rq.headers({
            apiKey: self.options.apiKey,
            Accept: self.options.format,
        });
        rq.query({ username: self.options.username });
        rq.end((resp) => {
            if (resp.status === 200) {
                resolve(resp.body);
            } else {
                reject(resp.error);
            }
        });
    }));
};

module.exports = options => new AfricasTalking(options);
