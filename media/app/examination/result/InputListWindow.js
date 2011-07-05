Ext.ns('App.result');

App.result.InputListWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
	    this.store = new Ext.data.ArrayStore({
	        fields: ['name']
	    });
	    this.store.loadData(this.analysis);
	
	    this.listView = new Ext.list.ListView({
	        store: this.store,
	        reserveScrollOffset: true,
	        hideHeaders:true,
	        columns: [{
	            dataIndex: 'name'
	        }],
	        listeners:{
	        	click:function(dv,index,node,e) {
	        		var rec = this.store.getAt(index);
	        		this.fireEvent('inputlist',rec.data.name);
	        		this.hide();
	        	},
	        	scope:this
	        }
	    });
    	config = {
			title:'Дополнительно',
			width:300,
			autoHeight:true,
			items: [this.listView]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.InputListWindow.superclass.initComponent.apply(this, arguments);
	}

});