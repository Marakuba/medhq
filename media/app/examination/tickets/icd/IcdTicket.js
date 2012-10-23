Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.IcdTicket = Ext.extend(App.examination.Ticket,{
	initComponent: function(){
		
		config = {
			editor:'icdticketeditor'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.IcdTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	},
	
	qtpl : new Ext.XTemplate(
		'<div>{name}</div>'
	),
	
	renderData : function(){
		return this.qtpl.apply({
			name : this.data.value._name
		});
	},
	
	afterEdit: function(data,panel){
		panel.data.value._name = data.attributes.text;
		panel.data.value._resource_uri = data.attributes.resource_uri;
		panel.data.value._rendered = this.renderData();
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	updateValueData : function(d){
		if (d.value) {
			this.body.removeClass('empty-body');
			this.body.update(d.value._rendered);
		} else {
			d['value'] = {} 
		}; 
	}
	
//	getEditorConfig : function(panel){
//		var editorConfig = {
//			title:panel.data.title,
//			data:panel.data.value._raw,
//			fn: panel.editComplete,
//			panel:panel,
//			code:this.code
//		}
//		return editorConfig
//	},
	

	
});

Ext.reg('icdticket', App.examination.IcdTicket);