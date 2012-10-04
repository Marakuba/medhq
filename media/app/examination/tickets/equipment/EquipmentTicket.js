Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.EquipmentTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		config = {
			type:'equipment'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.EquipmentTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	}
	
});

Ext.reg('equipmentticket', Ext.ux.form.EquipmentTicket);