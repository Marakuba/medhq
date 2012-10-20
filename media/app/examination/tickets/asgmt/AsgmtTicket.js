Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.AsgmtTicket = Ext.extend(Ext.ux.form.Ticket,{
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
		
		this.data.store = new Ext.data.Store({
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
	
	afterEdit: function(data,panel){
		panel.data.value = data;
		panel.updateData();
//		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	setData : function(data) {
		Ext.apply(this.data,data)
		this.data.store.load({callback:function(records){
			this.data.value = records;
			this.updateData();
		},scope:this})
	},
	
	
	updateData : function() {
		var d = this.data || {'printable':true, 'private':false};
		if (d.title) {
			this.setTitle(d.title);
		} else {
			this.setTitle('Щелкните здесь чтобы установить заголовок...');
			this.header.addClass('empty-header');
			d['title'] = ''
		};
		if (d.value && d.value.length) {
			this.body.removeClass('empty-body');
			var text = '<table border=1><tr><th>Услуга</th><th>Количество</th></tr>';
			Ext.each(d.value,function(v){
				text += '<tr><td>' + v.data.service_name + '</td><td>' + v.data.count + '</td></tr>';
			});
			text += '</table>';
			this.body.update(text);
		} else {
			d['value'] = '' 
		}; 
		if(!d.printable) {
			this.addClass('not-printable');
		}
		if(d.private) {
			this.addClass('private');
			this.pntMenuItem.setDisabled(true);
		}
		this.data = d;
		this.doLayout();
		this.afterLoad();
	}
	
});

Ext.reg('asgmtticket', App.examination.AsgmtTicket);