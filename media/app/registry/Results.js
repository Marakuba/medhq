Ext.ns('App');

App.Results = Ext.extend(Ext.Panel, {
	initComponent:function(){

		this.resultGrid = new App.results.Grid({
			region:'center',
			xtype:'resultsgrid'
		});

		this.origTitle = 'Результаты';

		config = {
			id:'results-grid',
			title:this.origTitle,
			closable:true,
			layout:'border',
            defaults: {
				border:false
			},
			items:[this.resultGrid]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Results.superclass.initComponent.apply(this, arguments);

		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.resultGrid.getStore().on('load',this.onResultLoad,this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
			this.resultGrid.getStore().un('load',this.onResultLoad,this);
		},this);

	},
	
	onGlobalSearch : function(v) {
		this.changeTitle = v!==undefined;
		if(!v){
			this.setTitle(this.origTitle);
		}
	},
	
	onResultLoad : function(store,r,options){
		if(this.changeTitle){
			this.setTitle(String.format('{0} ({1})', this.origTitle, r.length));
		}
	}
	
});

Ext.reg('results', App.Results);