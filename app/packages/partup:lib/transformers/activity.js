/**
 @namespace Activity transformer service
 @name partup.transformers.activity
 @memberOf partup.transformers
 */
Partup.transformers.activity = {

    /**
     * Transform activity to optional details form
     *
     * @memberOf partup.transformers.activity
     * @param {object} activity
     */
    'toFormActivity':function(activity) {
        return {

        };
    },

    /**
     * Transform form to activity fields
     *
     * @memberOf partup.transformers.activity
     * @param {mixed[]} fields
     */
    'fromFormActivity': function(fields) {
        return {

        }
    }
};

/**
 @namespace Contribution transformer service
 @name partup.transformers.activity.contribution
 @memberOf partup.transformers
 */
Partup.transformers.activity.contribution = {

    /**
     * Transform contribution to form
     *
     * @memberOf partup.transformers.activity.contribution
     * @param {object} contribution
     */
    'toFormActivityContribution':function(contribution) {
        return {
            _id: contribution._id,
            type_want: contribution.types.$.type_want,
            type_can_amount: contribution.types.$.type_can_amount,
            type_have_amount: contribution.types.$.type_have_amount,
            type_have_description: contribution.types.$.type_have_description
        };
    },

    /**
     * Transform form to contribution fields
     *
     * @memberOf partup.transformers.activity.contribution
     * @param {mixed[]} fields
     */
    'fromFormActivityContribution': function(fields) {
        var contribution = {};

        if (fields.type_want) {
            contribution.types = [
                {
                    'type': 'want'
                }
            ];
        }

        if (fields.type_can_amount) {
            contribution.types = [
                {
                    'type': 'can',
                    'type_data': {
                        'amount': fields.type_can_amount
                    }
                }
            ];
        }

        if (fields.type_have_amount) {
            contribution.types = [
                {
                    'type': 'have',
                    'type_data': {
                        'amount': fields.type_have_amount,
                    }
                }
            ];
        }

        if (fields.type_have_description) {
            contribution.types = [
                {
                    'type': 'have',
                    'type_data': {
                        'description': fields.type_have_description,
                    }
                }
            ];
        }

        return contribution;
    }
};

