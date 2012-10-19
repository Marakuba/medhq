Ext.ns('App.examination');

/*
 * title : '',
 * printable : true|false,
 * private : true|false,
 * value :{
 * 	_code:{
 * 	},
 * 	_rendered:''
 * 	},
 * 	_raw:{
 * 	}
 */


App.examination.AssistantTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		this.qtpl = new Ext.XTemplate(
			'<div>{name}</div>',
			{
		});
		
		config = {
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.AssistantTicket.superclass.initComponent.apply(this, arguments);
		
		this.data = this.data || {
			printable : false, 
			private : false,
			value : {
				_resource_uri : undefined,
				_name : undefined,
				_rendered : ''
			}
		};
		
		this.on('afterrender',function(){
			this.updateData();
		},this)
		
	},
	
    onEdit: function(panel){
		if(panel.fireEvent('ticketbeforeedit', panel)===true){
			this.win = new App.assistant.AssistantWindow({
				fn: function(record){
					this.editComplete(record, panel);
					this.win.close();
				},
				scope:this
			});
			this.win.show();
		}

	},
	
	renderData : function(){
		return this.qtpl.apply({
			name : this.data.value._name
		});
	},
	
	afterEdit: function(data,panel){
		panel.data.value._name = data.data.name;
		panel.data.value._resource_uri = data.data.resource_uri;
		panel.data.value._rendered = this.renderData();
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	updateData : function() {
		var d = this.data;// || {'printable':true, 'private':false};
		if (d.title) {
			this.setTitle(d.title);
		} else {
			this.setTitle('Щелкните здесь чтобы установить заголовок...');
			this.header.addClass('empty-header');
			d['title'] = ''
		};
		if (d.value) {
			this.body.removeClass('empty-body');
			this.body.update(d.value._rendered);
		} else {
			d['value'] = {
				_code : this.code,
				_rendered : '',
				_raw : undefined
			} 
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

Ext.reg('assistantticket', App.examination.AssistantTicket);