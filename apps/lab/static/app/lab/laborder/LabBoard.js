Ext.ns('App.laboratory');


App.laboratory.LabBoard = Ext.extend(Ext.Panel, {
    
    initComponent: function() {
        
        this.origTitle = 'Заказы';
        
        this.LabOrderGrid = new App.laboratory.LabOrderGrid({
            id:'lab-order-grid',
            region:'west',
            split:true,
            width:510,
            listeners:{
                scope:this,
                orderselect: function(rec){
                    this.ResultCard.enable();
                    this.ResultCard.setActiveRecord(rec);
                }
            }
        });

        this.ResultCard = new App.result.ResultCard({
            region:'center'
        });
        
        config = {
            id:'lab-board-app',
            title:this.origTitle,
            layout:'border',
            items:[this.LabOrderGrid,this.ResultCard]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.LabBoard.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);
        
        this.LabOrderGrid.getStore().on('load',this.onLabOrderLoad,this);
        this.on('beforedestroy', function(){
            this.LabOrderGrid.getStore().un('load',this.onLabOrderLoad,this);
        },this);
        
        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);
        
        this.LabOrderGrid.on('updatefilters', function(){
            this.ResultCard.disable();
        }, this);

        this.LabOrderGrid.store.on('write', function(store, action, result, res, rs){
            if(action=='update'){
                this.ResultCard.updateLabOrder(result);
            }
        }, this);
    },

    onGlobalSearch: function(v) {
        this.changeTitle = v!==undefined;
        if(!v){
            this.setTitle(this.origTitle);
        }
        this.ResultCard.disable();
    },
    
    onLabOrderLoad : function(store,r,options){
        if(this.changeTitle){
            this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
        }
    }

    
});


Ext.reg('labboard', App.laboratory.LabBoard);


App.webapp.actions.add('labboard', new Ext.Action({
    text: 'Заказы',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','labboard');
    }
}));