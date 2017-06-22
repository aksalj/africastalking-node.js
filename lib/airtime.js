const unirest = require('unirest');
const validate = require('validate.js');
const _ = require('lodash');

const Common = require('./common');

const DEFAULT_CURRENCY = 'KES';

function Airtime(options) {
    this.options = options;
}

Airtime.prototype.send = function send(params) {
    const self = this;
    const options = _.cloneDeep(params);
    const recipients = [];
    let validationError;

    // Validate params
    const validateParams = () => {
        const constraints = {
            recipients: (value) => {
                if (validate.isEmpty(value)) {
                    return {
                        presence: {
                            message: 'is required',
                        },
                    };
                }

                if (!validate.isArray(value)) {
                    return {
                        format: 'must be an array',
                    };
                }

                for (const i in value) { // eslint-disable-line
                    const recipient = value[i];
                    const phone = recipient.phoneNumber;
                    const amount = recipient.amount;

                    if (validate.isEmpty(phone) || validate.isEmpty(amount)) {
                        return {
                            format: 'must all specify phoneNumber and amount',
                        };
                    }

                    if (!(/^\+?\d+$/).test(phone)) {
                        return {
                            format: 'must not contain invalid phone numbers',
                        };
                    }

                    if (!(amount >= 10 && amount <= 10000)) {
                        return {
                            format: 'must only contain amount between 10 and 10000',
                        };
                    }

                    // format amount with currency
                    const currency = DEFAULT_CURRENCY;
                    recipient.amount = validate.format('%{currency} %{amount}', { currency, amount });
                    recipients.push({
                        phoneNumber: phone,
                        amount: recipient.amount,
                    });
                }

                return null;
            },
        };

        validationError = validate(options, constraints);
    };

    validateParams();

    return new Promise((resolve, reject) => {
        if (validationError) {
            reject(validationError);
            return;
        }

        const body = {
            username: self.options.username,
            recipients: JSON.stringify(recipients),
        };

        const rq = unirest.post(Common.AIRTIME_URL);
        rq.headers({
            apikey: self.options.apiKey,
            Accept: self.options.format,
        });

        rq.send(body);

        rq.end((resp) => {
            if (resp.status === 201) {
                // API returns CREATED on success
                resolve(resp.body);
            } else {
                reject(resp.error || resp.body);
            }
        });
    });
};

module.exports = Airtime;
