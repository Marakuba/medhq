Ext.ns('App.laboratory');


App.laboratory.AnalysisEditor = Ext.extend(Ext.Panel, {
    
    origTitle : 'Редактор тестов',

    initComponent: function() {

        this.baseServiceId = 3709;

        this.analysisStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab','analysis'),
            model: App.models.Analysis,
            sortInfo: {
                field: 'order',
                direction: 'ASC'
            },
            listeners:{
                write:function(store,action){
                    if(action!='create'){
                        store.sort('order','ASC');
                    }
                },
                scope:this
            }
        });

        this.profileStore = new Ext.data.RESTStore({
            autoLoad : true,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab','analysis_profile'),
            model: App.models.AnalysisProfile,
            listeners:{
                scope:this
            }
        });

        this.profileStore.on('write', function(store, action, result, res, rs){
            if(action=='create'){
                var r = result[0];
                this.profiles[r.name] = r.resource_uri;
                var tab = this.makeTab.call(this, r.name, r.resource_uri);
                this.profileTab.add(tab);
                this.profileTab.setActiveTab(tab);
                tab.initProfileMenu();
            }
        }, this);

        this.measurementStore = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : true,
            apiUrl : App.utils.getApiUrl('lab','measurement'),
            model: ['id','name','resource_uri']
        });

        this.profileTab = new Ext.TabPanel({
            region: 'center'
        });

        config = {
            id:'analysis-editor-app',
            title:this.origTitle,
            layout:'border',
            border:false,
            defaults:{
                border:false
            },
            items:[this.profileTab]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.AnalysisEditor.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            this.profileTab.on('tabchange', this.onProfileTabChange, this);
            this.analysisStore.load({
                params:{
                    service: this.baseServiceId
                },
                callback:function(res, opts){
                    this.processResp(res);
                },
                scope:this
            });
        }, this);
        
    },

    processResp : function(res) {
        this.getProfiles(res);
        this.initTabs();
    },

    getProfiles : function(res) {
        this.profiles = {};
        Ext.each(res, function(r){
            var profile = r.data.profile_name || 'Основной профиль';
            this.profiles[profile] = r.data.profile;
        }, this);
    },

    initTabs : function(){
        var self = this;
        _.map(_.pairs(this.profiles), function(pair){
            self.profileTab.add(self.makeTab.call(self, pair[0], pair[1]));
        });
        this.profileTab.setActiveTab(0);
    },

    makeTab : function(title, profile){
        return new App.laboratory.AnalysisProfileGrid({
            id:'profile-tab-'+title,
            title: title,
            profile: profile,
            baseServiceId: this.baseServiceId,
            analysisStore: this.analysisStore,
            profileStore: this.profileStore,
            measurementStore: this.measurementStore,
            profiles: this.profiles,
            listeners:{
                addprofile:this.onAddProfile.createDelegate(this),
                scope:this
            }
        });
    },

    onAddProfile : function(title, profile, active) {
        this.profiles[title]=profile;
        var tab = this.makeTab.call(this, title, profile);
        this.profileTab.add(tab);
        if(active===undefined){
            active = true;
        }
        if(active){
            this.profileTab.setActiveTab(tab);
        }
        tab.initProfileMenu();
    },

    onProfileTabChange : function(tp, p) {
        p.setProfileFilter();
    }

});


Ext.reg('analysiseditorapp', App.laboratory.AnalysisEditor);


App.webapp.actions.add('analysiseditorapp', new Ext.Action({
    text: App.laboratory.AnalysisEditor.prototype.origTitle,
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','analysiseditorapp');
    }
}));