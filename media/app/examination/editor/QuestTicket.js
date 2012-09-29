Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.QuestTicket = Ext.extend(Ext.ux.form.Ticket,{
	initComponent: function(){
		
		config = {
			type:'questionnaire'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.QuestTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	}
	
});

Ext.reg('questticket', Ext.ux.form.QuestTicket);