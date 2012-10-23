Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.TitleTicket = Ext.extend(App.examination.Ticket,{
	initComponent: function(){
		
		config = {
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TitleTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
		
	},
	
	afterEdit: function(data,panel){
		panel.data.title = data.title;
		panel.data.value = data.value;
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	}
	
});

Ext.reg('titleticket', App.examination.TitleTicket);