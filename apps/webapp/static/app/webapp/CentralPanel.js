Ext.ns('App.webapp');

App.webapp.CentralPanel = Ext.extend(Ext.Panel, {
    
    initComponent: function(){
        this.mainPanel = new App.webapp.MainPanel({});

        config = {
            region:'center',
            border:false,
            layout:'border',
            tbar:[],
            items:[this.mainPanel]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.webapp.CentralPanel.superclass.initComponent.apply(this, arguments);

        WebApp.on('launchapp', this.launchApp, this);
        WebApp.on('closeapp', this.closeApp, this);

        this.on('destroy', function(){
            WebApp.un('launchapp', this.launchApp, this);
            WebApp.un('closeapp', this.closeApp, this);
        },this);
    },
    
    getActiveApp: function(){
        return this.mainPanel.getActiveTab();
    },
    
    launchApp: function(appId,config,setActive) {
        var app_config = {
            xtype:appId
        };
        config = config || {};
        Ext.apply(app_config, config);
        var new_app = this.mainPanel.add(app_config);
        setActive = setActive===undefined ? true : setActive;
        if(setActive){
            this.mainPanel.setActiveTab(new_app);
        }
    },

    closeApp: function(appId) {
        this.mainPanel.remove(appId);
    }

});

Ext.reg('centralpanel', App.webapp.CentralPanel);
