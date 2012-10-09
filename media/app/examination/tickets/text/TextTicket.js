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
		
	},
	
	bodyConfig: function(panel){
		panel.body.on('dblclick', function(e, t){
				panel.onEdit(panel);
        		panel.fireEvent('ticketbodyclick',panel);
        	}, null, {
        });
	},
	
	afterEdit: function(data,panel){
		panel.data.title = data.title;
		panel.data.value = data.value;
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	}
	
});

Ext.reg('textticket', Ext.ux.form.TextTicket);