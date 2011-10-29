Ext.ns('App.cards');

App.cards.BaseCard = Ext.extend(Ext.Window,{
	
	initComponent: function(){
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('result')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'order'},
		    {name: 'barcode'},
		    {name: 'patient'},
		    {name: 'service'},
		    {name: 'service_name'},
		    {name: 'analysis'},
		    {name: 'analysis_name'},
		    {name: 'analysis_code'},
		    {name: 'laboratory'},
		    {name: 'previous_value'},
		    {name: 'value'},
		    {name: 'modified_by_name'},
		    {name: 'inputlist'},
		    {name: 'measurement'},
		    {name: 'validation', type:'int'},
		    {name: 'sample'},
		    {name: 'is_validated', type:'bool'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		this.store = new Ext.data.Store({
			autoSave:false,
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
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer
		});		
		
		config = {
			width:900,
			height:550,
			modal:true,
			buttons:[{
				text:'Сохранить',
				handler:this.onSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.BaseCard.superclass.initComponent.apply(this, arguments);
		
	},
	
	onSave: function(){
		
	},
	
	onClose: function(){
		this.close();
	}
	
});