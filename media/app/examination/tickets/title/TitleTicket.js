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
			tools:[],
			title:undefined,
			header:false,
			bodyCssClass:'content-title empty-body',
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TitleTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
		
	},
	
	setTools : function(){
		
	},
	
	headerConfig: function(panel){
		
	},
	
	afterEdit: function(data,panel){
		panel.data.title = data.title;
		panel.data.value = data.value;
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	updateTitleData : function(){
		
	}
	
});

Ext.reg('titleticket', App.examination.TitleTicket);