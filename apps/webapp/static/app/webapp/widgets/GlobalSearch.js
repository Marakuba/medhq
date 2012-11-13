Ext.ns('App.webapp');


App.webapp.GlobalSearchField = Ext.extend(App.SearchField, {
    emptyText:'№ заказа или фамилия'
});


Ext.reg('globalsearchfield', App.webapp.GlobalSearchField);