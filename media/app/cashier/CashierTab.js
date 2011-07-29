Ext.ns('App');

App.CashierTab = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		
		this.menuBar = new Ext.Panel({
			region:'west',
			//frame:true,
			title:'Меню',
			width:100,
			//height:500,
 			layout: {
	            type:'vbox',
            	padding:'10',
            	align:'stretch'
        	},
        	defaults:{margins:'0 0 5 0'},
        	items:[{
	            xtype:'button',
    	        text: 'Z-Отчет',
				scale: 'large',
				handler: function(){
					window.location.href = '/webapp/registry/';
				}
	        },{
    	        xtype:'button',
        	    text: 'X-Отчет',
				scale: 'large',
				handler: function(){
					window.location.href = '/webapp/laboratory/';
				}
			}]
		});
	
		this.mainPanel = new Ext.TabPanel({
			activeTab:0,
			region:'center',
			items:[{
					title:'Платежи',
					layout:'fit',
					xtype:'paymentgrid'
				}]
		});
	
		config = {
			title:'Кассир',
			region:'center',
			border:false,
			layout:'border',
			items:[this.menuBar,this.mainPanel]
			
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CashierTab.superclass.initComponent.apply(this, arguments);
	}
	
});

Ext.reg('cashiertab', App.CashierTab);
