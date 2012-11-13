Ext.ns('App');
Ext.ns('App.clientaccount');

App.clientaccount.Backend = Ext.extend(App.Backend, {


		store:new Ext.data.Store({
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
			    url: App.getApiUrl('billing','clientaccount')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, [
    		    {name: 'id'},
    		    {name: 'resource_uri'},
                {name: 'client_item', allowBlank: true},
                {name: 'client_name', allowBlank: true},
                {name: 'account_id', allowBlank: true},
                {name: 'account', allowBlank: true},
                {name: 'amount', allowBlank: true}
			]),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		console.log('ClientAccount Grid Exception!');
		    		console.log(proxy);
		    		console.log(type);
		    		console.log(action);
		    		console.log(options);
		    		console.log(response);
		    		console.log(arg);
		    	},
		    	write:function(store, action, result, res, rs){
		    		console.log('ClietnAccount created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
		    		if(action=='create') {
			    		App.eventManager.fireEvent('clientaccountcreate', rs);
		    		}
		    	},
		    	scope:this
		    }
		})

});

App.regBackend('clientaccount', new App.clientaccount.Backend({}));
