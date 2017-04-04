Template.Start_Header.onCreated(function() {
    var template = this;
    template.maxTags = 5;
});

Template.Start_Header.helpers({
    data: function() {
        var template = Template.instance();
        var self = this;
        var network = Networks.findOne({slug: self.networkSlug});
        if (!network) return;

        Partup.client.windowTitle.setContextName(network.name);

        return {
            network: function() {
                return network;
            },
            partups: function() {
                return Partups.findForNetwork(network);
            },
            activeUppers: function() {
                return {
                    uppers: network.most_active_uppers,
                    totalUppers: network.stats.upper_count,
                    networkSlug: self.networkSlug,
                    networkId: network._id
                };
            },
            activePartups: function() {
                return {
                    partups: network.most_active_partups,
                    totalPartups: network.stats.partup_count,
                    networkSlug: self.networkSlug,
                    networkId: network._id
                };
            }
        };
    },
});
Template.Start_Header.events({
    'click [data-open-networksettings]': function(event, template) {
        event.preventDefault();
        var networkSlug = template.data.networkSlug;
        Intent.go({
            route: 'network-settings',
            params: {
                slug: networkSlug
            }
        });
    }
});
