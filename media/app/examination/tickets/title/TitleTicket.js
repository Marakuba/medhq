Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.TitleTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		config = {
			type:'title'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.TitleTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	}
	
});

Ext.reg('titleticket', Ext.ux.form.TitleTicket);