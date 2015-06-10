var placeholders = {
    'name': function() {
        return __('pages-modal-create-details-form-name-placeholder');
    },
    'description': function() {
        return __('pages-modal-create-details-form-description-placeholder');
    },
    'tags_input': function() {
        return __('pages-modal-create-details-form-tags_input-placeholder');
    },
    'budget_money': function() {
        return __('pages-modal-create-details-form-budget_money-placeholder');
    },
    'budget_hours': function() {
        return __('pages-modal-create-details-form-budget_hours-placeholder');
    },
    'end_date': function() {
        return __('pages-modal-create-details-form-end_date-placeholder');
    },
    'location_input': function() {
        return __('pages-modal-create-details-form-location_input-placeholder');
    }
};

/*************************************************************/
/* Widget image system */
/*************************************************************/
var ImageSystem = function ImageSystemConstructor (template) {
    var self = this;

    this.currentImageId = new ReactiveVar(false);
    this.uploaded = new ReactiveVar(false);
    this.availableSuggestions = new ReactiveVar([]);
    this.focuspoint = new ReactiveDict();

    this.getSuggestions = function(tags) {
        if (!tags || !tags.length) {
            this.availableSuggestions.set([]);
            return;
        }

        var newSuggestionsArray = [];

        var addSuggestions = function(suggestions) {
            if (!suggestions) return;
            newSuggestionsArray = newSuggestionsArray.concat(lodash.map(suggestions, 'imageUrl'));
        };

        var setAvailableSuggestions = function() {
            template.loading.set('suggesting-images', false);

            if (!newSuggestionsArray.length) {
                Partup.client.notify.warning('Could not find any images suggestions.');
                return;
            }

            self.availableSuggestions.set(newSuggestionsArray.slice(0, 5));
            Session.set('partials.create-partup.current-suggestion', 0);
        };

        template.loading.set('suggesting-images', true);
        Meteor.call('partups.services.splashbase.search', tags, function(error, result) {
            if (!error) addSuggestions(result);

            if (newSuggestionsArray.length >= 5) {
                setAvailableSuggestions();
            } else {
                Meteor.call('partups.services.flickr.search', tags, function(error, result) {
                    if (!error) addSuggestions(result);
                    setAvailableSuggestions();
                });
            }
        });
    };

    this.unsetUploadedPicture = function(tags) {
        self.getSuggestions(tags);
        self.currentImageId.set(false);
        self.uploaded.set(false);
    };

    this.storeFocuspoint = function(x, y) {
        self.focuspoint.set('x', x);
        self.focuspoint.set('y', y);
    };

    // Set suggestion
    var setSuggestionByIndex = function(index) {

        var suggestions = self.availableSuggestions.get();
        if (!mout.lang.isArray(suggestions)) return;

        var url = suggestions[index];
        if (!mout.lang.isString(url)) return;

        template.loading.set('setting-suggestion', true);
        Partup.client.uploader.uploadImageByUrl(url, function(error, image) {
            template.loading.set('setting-suggestion', false);

            if (error) {
                Partup.client.notify.error('Some error occured');
                return;
            }
            self.currentImageId.set(image._id);
        });
    };

    template.autorun(function() {
        var suggestionIndex = Session.get('partials.create-partup.current-suggestion');

        if (mout.lang.isNumber(suggestionIndex) && !mout.lang.isNaN(suggestionIndex) && !self.uploaded.get()) {
            self.currentImageId.set(false);
            self.uploaded.set(false);
            setSuggestionByIndex(suggestionIndex);

            var focuspoint = self.focuspoint.get();
            if (focuspoint) focuspoint.reset();
        }
    });
};


/*************************************************************/
/* Widget on created */
/*************************************************************/
Template.modal_create_details.onCreated(function() {
    var template = this;

    template.currentPartup = new ReactiveVar();
    template.loading = new ReactiveDict();
    template.nameCharactersLeft = new ReactiveVar(Partup.schemas.entities.partup._schema.name.max);
    template.descriptionCharactersLeft = new ReactiveVar(Partup.schemas.entities.partup._schema.description.max);
    template.imageSystem = new ImageSystem(template);
    template.budgetType = new ReactiveVar();
    template.budgetTypeChanged = new ReactiveVar();
    template.draggingFocuspoint = new ReactiveVar(false);

    template.autorun(function() {
        var pId = Session.get('partials.create-partup.current-partup');
        var p = Partups.findOne({_id: pId});

        if (!p) return;

        if (p.image) {
            template.imageSystem.currentImageId.set(p.image);
            template.imageSystem.uploaded.set(true);
        } else {
            template.imageSystem.getSuggestions(p.tags);
        }

        template.currentPartup.set(p);
    });

    /*************************************************************/
    /* AutoForm on rendered */
    /*************************************************************/
    Template.autoForm.onCreated(function() {
        if (mout.object.get(this, 'data.id') !== 'partupForm') return;

        // Oh. My. God. Look at that hack.
        // Don't change any of these rules!
        this.autorun(function() {
            AutoForm.getFieldValue('budget_type');

            Meteor.setTimeout(function() {
                try {
                    var budget_type = AutoForm.getFieldValue('budget_type', 'partupForm');
                    template.budgetType.set(budget_type);
                } catch (e) {
                    return;
                }
            });
        });
    });

    template.setFocuspoint = function(focuspoint) {
        focuspoint.on('drag:start', function() {
            template.draggingFocuspoint.set(true);
        });
        focuspoint.on('drag:end', function(x, y) {
            template.draggingFocuspoint.set(false);
            template.imageSystem.storeFocuspoint(x, y);
        });
        template.focuspoint = focuspoint;
    };

    template.unsetFocuspoint = function() {
        template.focuspoint = undefined;
    };

    template.autorun(function() {
        var imageId = template.imageSystem.currentImageId.get();

        if (imageId && template.focuspoint) {
            template.focuspoint.reset();
        }
    });

});

/*************************************************************/
/* Widget helpers */
/*************************************************************/
Template.modal_create_details.helpers({
    Partup: Partup,
    placeholders: placeholders,
    currentPartup: function() {
        return Template.instance().currentPartup.get();
    },
    fieldsFromPartup: function() {
        var p = Template.instance().currentPartup.get();
        if (!p) return;
        return Partup.transformers.partup.toFormStartPartup(p);
    },
    nameCharactersLeft: function() {
        return Template.instance().nameCharactersLeft.get();
    },
    descriptionCharactersLeft: function() {
        return Template.instance().descriptionCharactersLeft.get();
    },
    partupImage: function() {
        return Template.instance().imageSystem;
    },
    suggestionSetter: function() {
        return function(index) {
            Session.set('partials.create-partup.current-suggestion', index);
        }
    },
    currentSuggestion: function() {
        return Session.get('partials.create-partup.current-suggestion');
    },
    budgetOptions: function() {
        return [
            {
                label: 'Geen budget',
                value: ''
            },
            {
                label: 'Ja, in geld',
                value: 'money'
            },
            {
                label: 'Ja, in uren',
                value: 'hours'
            }
        ];
    },
    galleryIsLoading: function() {
        var template = Template.instance();
        return template.loading
            && (    template.loading.get('suggesting-images')
                 || template.loading.get('image-uploading')
                 || template.loading.get('setting-suggestion')
                );
    },
    imagepreviewIsLoading: function() {
        var template = Template.instance();
        return template.loading
            && (    template.loading.get('image-uploading')
                 || template.loading.get('setting-suggestion')
                );
    },
    uploadingPicture: function() {
        var template = Template.instance();
        return template.loading && template.loading.get('image-uploading');
    },
    budgetType: function() {
        return Template.instance().budgetType.get();
    },
    budgetTypeChanged: function() {
        return Template.instance().budgetTypeChanged.get();
    },
    setFocuspoint: function() {
        return Template.instance().setFocuspoint;
    },
    unsetFocuspoint: function() {
        return Template.instance().unsetFocuspoint;
    },
    focuspointView: function() {
        return {
            template: Template.instance(),
            selector: '[data-focuspoint-view]'
        };
    },
    onFocuspointUpdate: function() {
        return Template.instance().imageSystem.storeFocuspoint;
    },
    draggingFocuspoint: function() {
        return Template.instance().draggingFocuspoint.get();
    }
});

/*************************************************************/
/* Widget events */
/*************************************************************/
Template.modal_create_details.events({
    'keyup [data-max]': function updateMax(event, template) {
        var max = eval($(event.target).data('max'));
        var charactersLeftVar = $(event.target).data('characters-left-var');
        template[charactersLeftVar].set(max - $(event.target).val().length);
    },
    'change [data-imageupload]': function eventChangeFile(event, template) {
        $('[data-imageupload]').replaceWith($('[data-imageupload]').clone(true));
        FS.Utility.eachFile(event, function(file) {
            template.loading.set('image-uploading', true);
            Partup.client.uploader.uploadImage(file, function(error, image) {
                template.loading.set('image-uploading', false);
                template.imageSystem.currentImageId.set(image._id);
                template.imageSystem.uploaded.set(true);
                var focuspoint = template.imageSystem.focuspoint.get();
                if (focuspoint) focuspoint.reset();
            });
        });
    },
    'change [name=budget_type]': function eventChangeBudgetType(event, template) {
        template.budgetTypeChanged.set(true);
    },
    'click [data-imageremove]': function eventChangeFile(event, template) {
        var tags = Partup.client.strings.tagsStringToArray($(event.currentTarget.form).find('[name=tags_input]').val());
        template.imageSystem.unsetUploadedPicture(tags);
    },
    'blur [name=tags_input]': function searchFlickerByTags(event, template) {
        var tags = Partup.client.strings.tagsStringToArray($(event.currentTarget).val());
        Template.instance().imageSystem.getSuggestions(tags);
    },
    'click [data-submission-type]': function eventClickSetSubmissionType (event, template) {
        var button = event.currentTarget;
        var submissionType = button.getAttribute('data-submission-type');
        Session.set('partials.create-partup.submission-type', submissionType);

        if (button.type !== 'submit') {
            var form = template.find('#partupForm');
            $(form).submit();
        }
    },
    'click [data-removedate]': function eventsClickRemoveDate (event, template) {
        event.preventDefault();
        template.find('[name=end_date]').value = '';
    }
});

/*************************************************************/
/* Widget create partup */
/*************************************************************/
var createOrUpdatePartup = function createOrUpdatePartup (partupId, insertDoc, callback) {
    if (partupId) {

        // Partup already exists. Update.
        Meteor.call('partups.update', partupId, insertDoc, function(error, res) {
            if (error && error.message) {
                switch (error.message) {
                    // case 'User not found [403]':
                    //     Partup.client.forms.addStickyFieldError(self, 'email', 'emailNotFound');
                    //     break;
                    default:
                        Partup.client.notify.error(error.reason);
                }
                AutoForm.validateForm(self.formId);
                self.done(new Error(error.message));
                return;
            }

            callback(partupId);
        });

    } else {

        // Partup does not exists yet. Insert.
        Meteor.call('partups.insert', insertDoc, function(error, res) {
            if (error && error.message) {
                switch (error.message) {
                    // case 'User not found [403]':
                    //     Partup.client.forms.addStickyFieldError(self, 'email', 'emailNotFound');
                    //     break;
                    default:
                        Partup.client.notify.error(error.reason);
                }
                AutoForm.validateForm(self.formId);
                self.done(new Error(error.message));
                return;
            }

            Session.set('partials.create-partup.current-partup', res._id);
            callback(res._id);
        });

    }
};

/*************************************************************/
/* Widget form hooks */
/*************************************************************/
AutoForm.hooks({
    partupForm: {
        onSubmit: function(insertDoc) {
            var self = this;
            var partupId = Session.get('partials.create-partup.current-partup');
            var submissionType = Session.get('partials.create-partup.submission-type') || 'next';

            createOrUpdatePartup(partupId, insertDoc, function(id) {

                if (submissionType === 'next') {
                    Router.go('create-activities', {_id: id});
                } else if (submissionType === 'skip') {
                    Partup.client.intent.executeIntentCallback('create', [id], function(id) {
                        Router.go('partup', {_id: id});
                    });
                }
            });

            this.event.preventDefault();
            return false;
        }
    }
});
