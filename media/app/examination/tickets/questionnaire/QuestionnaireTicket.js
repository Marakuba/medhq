Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.QuestTicket = Ext.extend(App.examination.Ticket,{
	initComponent: function(){
		
		config = {
			type:'questionnaire'
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.QuestTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			console.log(this.type)
		},this)
		
	}
	
});

Ext.reg('questticket', App.examination.QuestTicket);