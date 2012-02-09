Ext.ns('App');
Ext.ns('App.payment');

App.regBackend('payment', new App.Backend({
		store:new Ext.data.Store({
			//autoLoad:true,
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
			    url: get_api_url('payment')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, [
    		    {name: 'id'},
    		    {name: 'doc_date', allowBlank: true, type:'date', format: 'd.m.Y'}, 
	    	    {name: 'client_account', allowBlank: true}, 
	    	    {name: 'client_name', allowBlank: true}, 
	    	    {name: 'client', allowBlank: true}, 
	    	    {name: 'amount', allowBlank: true},
	    	    {name: 'account_id', allowBlank: true},
	    	    {name: 'direction', allowBlank: true},
	    	    {name: 'payment_type', allowBlank: true},
	    	    {name: 'content_type', allowBlank: true}
			]),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		console.log('Payment Grid Exception!');
		    		console.log(proxy);
		    		console.log(type);
		    		console.log(action);
		    		console.log(options);
		    		console.log(response);
		    		console.log(arg);
		    	},
		    	write:function(store, action, result, res, rs){
		    		console.log('Payment created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
		    		if(action=='create') {
			    		App.eventManager.fireEvent('paymentcreate', rs);
		    		}
		    		//var clientBackend = App.getBackend('client');
		    		//clientBackend.store.load();
		    	},
		    	scope:this
		    }
		})
}));
