Ext.ns('App','App.models');

App.models.ExamCard = new Ext.data.Record.create([
	{name: 'id'},
	{name: 'ordered_service'},
	{name: 'print_date', allowBlank: true},
	{name: 'objective_data', allowBlank: true},
	{name: 'psycho_status', allowBlank: true},
	{name: 'gen_diag', allowBlank: true},
	{name: 'complication', allowBlank: true},
	{name: 'concomitant_diag', allowBlank: true},
	{name: 'clinical_diag', allowBlank: true},
	{name: 'treatment', allowBlank: true},
	{name: 'referral', allowBlank: true},
	{name: 'disease', allowBlank: true},
	{name: 'complaints', allowBlank: true},
	{name: 'history', allowBlank: true},
	{name: 'anamnesis', allowBlank: true},
	{name: 'mbk_diag', allowBlank: true},
	{name: 'extra_service', allowBlank: true}
]);

App.ExamBackend =  Ext.extend(App.Backend({

	constructor: function(config){
		this.store = new Ext.data.GroupingStore({
			autoLoad:true,
			autoSave:true,
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
		    remoteSort: true,
		    groupField:'key',
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('examcard')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, App.models.ExamCard),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		App.eventManager.fireEvent('examcardcreate', rs);
		    		}
		    	},
		    	scope:this
		    }
		});
		
		Ext.apply(this, config);
        App.ExamBackend.superclass.constructor.call(this, config);
	}
	
}));

Ext.reg('exambackend',App.ExamBackend);
App.regBackend('examcard',new App.ExamBackend);
