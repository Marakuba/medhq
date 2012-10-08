Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.TextTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		config = {
			type:'textticket'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.TextTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
		
	}
	
});

Ext.reg('textticket', Ext.ux.form.TextTicket);