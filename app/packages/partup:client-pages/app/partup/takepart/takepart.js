Template.app_partup_takepart.events({
    'click [data-newmessage]': function() {
        Partup.client.popup.close(true); // here, true is used for open_new_message_popup
    }
});
