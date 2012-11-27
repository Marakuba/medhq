Ext.ns('App.webapp');


App.webapp.GlobalSearchField = Ext.extend(App.SearchField, {
    emptyText:'№ заказа или фамилия',
    initComponent:function(){
        App.webapp.GlobalSearchField.superclass.initComponent.apply(this, arguments);
        WebApp.gsf = this;
    },
    listeners:{
        render:function(cmp){
            if(cmp.margin){
                cmp.wrap.applyStyles({
                    margin:cmp.margin
                });
            }
        }
    }
});


Ext.reg('globalsearchfield', App.webapp.GlobalSearchField);