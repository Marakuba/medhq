Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.MKBTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		config = {
			type:'mkb'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.MKBTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	}
	
});

Ext.reg('mkbticket', Ext.ux.form.MKBTicket);