Ext.ns('App','App.registry');


App.registry.RefundBackend = Ext.extend(App.Backend, {
	store: new Ext.data.GroupingStore({
		autoLoad:false,
	    baseParams: {
	    	format:'json'
	    },
	    paramNames: {
		    start : 'offset',
		    limit : 'limit',
		    sort : 'sort',
		    dir : 'dir'
		},
	    restful: true,
	    proxy: new Ext.data.HttpProxy({
		    url: App.getApiUrl('refund')
		}),
	    reader: new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, App.models.Refund),
	    writer: new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		})
	})
});

App.regBackend('refund', new App.registry.RefundBackend({}));
