Ext.ns('App.webapp');


App.webapp.WebApp = Ext.extend(Ext.util.Observable, {

    constructor: function(config){
        Ext.apply(this, config);

        this.addEvents(
            'launchapp',
            'closeapp',
            'globalsearch'
        );
    },

    init: function(config){
        Ext.apply(this, config);

        this.centralPanel = new App.webapp.CentralPanel({
        });

        if(this.apps){
            var tb = this.centralPanel.getTopToolbar();
            var groups = [];
            var groups_cmp = {};
            Ext.each(this.apps, function(app){
                var gr = app.tbar_group || 'default';
                if(groups.indexOf(gr)==-1) {
                    groups.push(gr);
                }
                if(!groups_cmp[gr]){
                    groups_cmp[gr] = [];
                }

                if(app.cmp_type=='action'){
                    var action = App.webapp.actions.get(app.xtype);
                    if(action){
                        groups_cmp[gr].push(action);
                    }
                }
                else if(app.cmp_type=='widget') {
                    var cfg = {
                        xtype:app.xtype
                    };
                    Ext.apply(cfg, app.config);
                    groups_cmp[gr].push(cfg);
                }
                if(app.splitter) {
                    switch (app.splitter) {
                        case '-':
                            groups_cmp[gr].push(new Ext.Toolbar.Separator());
                            break;
                        case '->':
                            groups.push(app.splitter);
                            break;
                    }
                }
                if(app.is_default){
                    this.centralPanel.launchApp(app.xtype, {}, false);
                }
            }, this);

            Ext.each(groups, function(group){
                if(groups_cmp[group] && groups_cmp[group].length){
                    var bg = new Ext.ButtonGroup({
                        id:String.format('top-tb-{0}-btn-group', group)
                    });
                    Ext.each(groups_cmp[group], function(cmp){
                        // console.info(cmp);
                        bg.add(cmp);
                    });
                    tb.add(bg);
                } else if(group=='->'){
                    tb.add(new Ext.Toolbar.Fill());
                }
            }, this);
            tb.doLayout();
            this.centralPanel.mainPanel.setActiveTab(0);
        }

        new Ext.Viewport({
            layout:'border',
            items:[this.centralPanel]
        });
    }

});

App.webapp.actions = new Ext.util.MixedCollection();

var WebApp = new App.webapp.WebApp();