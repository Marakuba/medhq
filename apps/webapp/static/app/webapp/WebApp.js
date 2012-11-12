Ext.ns('App.webapp');


App.webapp.WebApp = Ext.extend(Ext.util.Observable, {

    constructor: function(config){
        Ext.apply(this, config);

        this.addEvents(
            'launchapp',
            'closeapp'
        );
    },

    init: function(){
        this.centralPanel = new App.webapp.CentralPanel({
        });

        if(this.apps){
            var tb = this.centralPanel.getTopToolbar();
            Ext.each(this.apps, function(app){
                if(app.is_default){
                    this.centralPanel.launchApp(app.xtype);
                }
                if(app.cmp_type=='action'){
                    var action = App.webapp.actions.get(app.xtype);
                    if(action){
                        tb.add(action);
                    }
                }
                else if(app.cmp_type=='widget') {
                    tb.add({
                        xtype:app.xtype
                    });
                }
                if(app.splitter) {
                    tb.add(app.splitter);
                }
            }, this);
        }
        
        new Ext.Viewport({
            layout:'border',
            items:[this.centralPanel]
        });
    }

});

App.webapp.actions = new Ext.util.MixedCollection();