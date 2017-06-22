const unirest = require('unirest');
const validate = require('validate.js');
const _ = require('lodash');

const Common = require('./common');

function SMS(options) {
    const self = this;

    this.options = options;

    this.sendImpl = function (params, isBulk, isPremium) {
        let validationError;

        // Validate params
        const validateParams = function () {
            const constraints = {
                to(value) {
                    if (validate.isEmpty(value)) {
                        return {
                            presence: { message: 'is required' },
                        };
                    }

                    if (!validate.isArray(value) && !validate.isString(value)) {
                        return {
                            format: 'must be a string or an array strings (phone numbers)',
                        };
                    }

                    if (validate.isString(value)) {
                        // TODO: Validate number format
                        const isInvalid = false;
                        if (isInvalid) {
                            return {
                                format: 'must be a valid phone number',
                            };
                        }
                    }

                    if (validate.isArray(value)) {
                        const foundInvalid = false;
                        value.forEach((phone) => { // eslint-disable-line
                            // TODO: Validate number format
                        });
                        if (foundInvalid) {
                            return { format: 'must NOT contain invalid phone number' };
                        }
                    }

                    return null;
                },

                from: {
                    isString: true,
                },
                message: {
                    presence: true,
                },
            };

            if (isBulk) {
                constraints.enqueue = {
                    inclusion: [true],
                };
            }

            if (isPremium) {
                constraints.keyword = {
                    presence: true,
                    isString: true,
                };
                constraints.linkId = {
                    presence: true,
                    isString: true,
                };
                constraints.retryDurationInHours = {
                    numericality: true,
                };
            }

            const error = validate(params, constraints);
            if (error) {
                let msg = '';
                Object.keys(error).forEach((k) => {
                    msg += `${error[k]}`;
                });
                validationError = new Error(msg);
            }
        };

        validateParams();

        // Multiple recipients?
        if (validate.isArray(params.to)) {
            if (params.to.length === 1) {
                params.to = params.to[0]; // eslint-disable-line
            } else {
                params.to = params.to.join(); // eslint-disable-line
            }
        }

        return new Promise(((resolve, reject) => {
            if (validationError) {
                reject(validationError);
                return;
            }

            const body = {
                username: self.options.username,
                to: params.to,
                message: params.message,
            };

            if (params.from) {
                body.from = params.from;
            }

            if (isBulk) {
                body.bulkSMSMode = 1;
                if (params.enqueue) {
                    body.enqueue = 1;
                }
            }

            if (isPremium) {
                body.keyword = params.keyword;
                body.linkId = params.linkId;
                if (params.retryDurationInHours) {
                    body.retryDurationInHours = params.retryDurationInHours;
                }
            }

            const rq = unirest.post(Common.SMS_URL);
            rq.headers({
                apikey: self.options.apiKey,
                Accept: self.options.format,
            });
            rq.send(body);
            rq.end((resp) => {
                if (resp.status === 201) { // API returns CREATED on success!?
                    resolve(resp.body);
                } else {
                    reject(resp.error || resp.body);
                }
            });
        }));
    };
}

SMS.prototype.send = function (params) {
    const opts = _.cloneDeep(params);
    return this.sendImpl(opts, false, false);
};

SMS.prototype.sendBulk = function (params) {
    const opts = _.cloneDeep(params);
    return this.sendImpl(opts, true, false);
};


SMS.prototype.sendPremium = function (params) {
    const opts = _.cloneDeep(params);
    return this.sendImpl(opts, false, true);
};

SMS.prototype.fetchMessages = function (params) {
    const self = this;

    const opts = _.cloneDeep(params) || {};
    opts.lastReceivedId = opts.lastReceivedId || 0;

    return new Promise(((resolve, reject) => {
        const rq = unirest.get(Common.SMS_URL);
        rq.headers({
            apikey: self.options.apiKey,
            Accept: self.options.format,
        });
        rq.query({
            username: self.options.username,
            lastReceivedId: opts.lastReceivedId,
        });
        rq.end((resp) => {
            if (resp.status === 200) {
                resolve(resp.body);
            } else {
                reject(resp.error);
            }
        });
    }));
};

SMS.prototype.createSubscription = function (params) {
    const self = this;
    const opts = _.cloneDeep(params) || {};

    const constraints = {
        shortCode: {
            presence: true,
            isString: true,
        },
        keyword: {
            presence: true,
            isString: true,
        },
        phoneNumber: {
            presence: true,
            isString: true,
        },
    };

    const validationError = validate(opts, constraints);

    const body = {
        username: self.options.username,
        shortCode: opts.shortCode,
        keyword: opts.keyword,
        phoneNumber: opts.phoneNumber,
    };

    return new Promise(((resolve, reject) => {
        if (validationError) {
            reject(validationError);
            return;
        }

        const rq = unirest.post(`${Common.BASE_URL}/subscription/create`);
        rq.headers({
            apikey: self.options.apiKey,
            Accept: self.options.format,
        });
        rq.send(body);
        rq.end((resp) => {
            if (resp.status === 201) { // API returns CREATED on success!?
                resolve(resp.body);
            } else {
                reject(resp.error || resp.body);
            }
        });
    }));
};

SMS.prototype.fetchSubscription = function (params) {
    const self = this;
    const opts = _.cloneDeep(params) || {};

    const constraints = {
        shortCode: {
            presence: true,
            isString: true,
        },
        keyword: {
            presence: true,
            isString: true,
        },
        lastReceivedId: {
            numericality: true,
        },
    };

    const validationError = validate(opts, constraints);

    opts.lastReceivedId = opts.lastReceivedId || 0;

    return new Promise(((resolve, reject) => {
        if (validationError) {
            reject(validationError);
            return;
        }

        const rq = unirest.get(`${Common.BASE_URL}/subscription`);
        rq.headers({
            apikey: self.options.apiKey,
            Accept: self.options.format,
        });
        rq.query({
            username: self.options.username,
            lastReceivedId: opts.lastReceivedId,
            keyword: opts.keyword,
            shortCode: opts.shortCode,
        });
        rq.end((resp) => {
            if (resp.status === 200) {
                resolve(resp.body);
            } else {
                reject(resp.error);
            }
        });
    }));
};

module.exports = SMS;
