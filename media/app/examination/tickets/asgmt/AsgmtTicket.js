Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.AsgmtTicket = Ext.extend(App.examination.Ticket,{
	data : {},
	initComponent: function(){
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('extpreorder')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, App.models.preorderModel);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		
		this.store = new Ext.data.Store({
			autoSave:false,
			autoLoad:false,
		    baseParams: {
		    	format:'json',
		    	patient:this.data.patientId,
		    	card:this.data.cardId
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
		    writer: this.writer,
		    listeners:{
		    	exception: function(){
		    		this.fireEvent('basketexception')
		    	},
		    	scope:this
		    },
		    doTransaction : function(action, rs, batch) {
		        function transaction(records) {
		            try{
		                this.execute(action, records, undefined, batch);
		            }catch (e){
		                this.handleException(e);
		            }
		        }
		        this.batch=true;
		        transaction.call(this, rs);
		    }
		});
		
		config = {
			editor:'asgmtticketeditor'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.AsgmtTicket.superclass.initComponent.apply(this, arguments);
		
	},
	
	afterEdit: function(records,panel){
		panel.records = records;
//		panel.data.value = '';
		panel.updateData();
//		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	setData : function(data) {
		Ext.apply(this.data,data);
		this.data.value = '';
		if (this.cardId){
			this.store.setBaseParam('card',this.cardId); //если номер карты передался не при инициализации тикета
			this.store.load({callback:function(records){
				this.records = records;
				this.updateData();
			},scope:this})
		}
	},
	
	setCardId: function(cardId){
		if (this.data.cardId) return false
		this.data.cardId = cardId;
		this.store.setBaseParam('card',cardId);
		this.store.load({callback:function(records){
			this.records = records;
			this.updateData();
		},scope:this})
	},
	
	getEditorConfig : function(panel){
		var editorConfig = {
			store:this.store,
			title:panel.data.title,
			data:panel.data,
			fn: panel.editComplete,
			panel:panel,
			listeners:{
				scope:this,
				cancel:function(){
					this.store.load();
				}
			}
		}
		return editorConfig
	},
	
	dataTpl : new Ext.XTemplate(
		'<table width="100%" cellpadding="0" cellspacing="0" border="0">',
			'<tpl for=".">',
			'<tr>',
				'<td>{#}.</td>',
				'<td>{service_name}</td>',
				'<td>{count}</td>',
				'<td>{[fm.date(values.expiration,"d.m.Y")]}</td>',
			'</tr>',
			'</tpl>',
		'</table>'
	),
	
	updateValueData : function(d) {
		if (this.records && this.records.length) {
			this.body.removeClass('empty-body');
			var recs = _.map(this.records, function(rec){ return rec.data });
			var text = this.dataTpl.apply(recs);
			this.body.update(text);
		} else {
			d['value'] = '' 
		}; 
	},
	
});

Ext.reg('asgmtticket', App.examination.AsgmtTicket);