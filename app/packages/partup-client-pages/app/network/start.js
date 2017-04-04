Template.app_network_start.onCreated(function() {
    var template = this;
    var networkSlug = template.data.networkSlug;
    template.loaded = new ReactiveVar(false);
    template.subscribe('networks.one', networkSlug, {
        onReady: function() {
            var network = Networks.findOne({slug: networkSlug});
            if (!network) Router.pageNotFound('network');
            template.loaded.set(true);
        }
    });
    template.subscribe('networks.one.partups', {slug: networkSlug});
});

Template.app_network_start.helpers({
    state: function() {
        var template = Template.instance();
        return {
            loaded: function() {
                return template.loaded.get();
            }
        };
    }
});
