Ext.ns('App.visit');

App.visit.VisitApp = Ext.extend(Ext.Panel, {
    initComponent:function(){
        
        this.visitGrid = new App.visit.VisitGrid({
            region:'center'
        });

        this.origTitle = 'Приемы';
        
        config = {
            id:'visits-grid',
            title:this.origTitle,
            closable:true,
            layout:'border',
            defaults: {
                border:false
            },
            items:[this.visitGrid]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.VisitApp.superclass.initComponent.apply(this, arguments);

        WebApp.on('globalsearch', this.onGlobalSearch, this);
        this.visitGrid.getStore().on('load',this.onVisitLoad,this);
        this.on('beforedestroy', function(){
            this.visitGrid.getStore().un('load',this.onVisitLoad,this);
        },this);
        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);

    },

    onGlobalSearch : function(v) {
        this.changeTitle = v!==undefined;
        if(!v){
            this.setTitle(this.origTitle);
        }
    },
    
    onVisitLoad : function(store,r,options){
        if(this.changeTitle){
            this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
        }
    }
    

});

Ext.reg('visitapp', App.visit.VisitApp);


App.webapp.actions.add('visitapp', new Ext.Action({
    text: 'Приемы',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','visitapp');
    }
}));