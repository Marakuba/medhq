Ext.ns('App.orderedservice');

App.orderedservice.Orders = Ext.extend(Ext.TabPanel, {

	initComponent : function() {
		
		this.origTitle = 'Заказы';
		
		config = {
			closable:true,
			title:'Заказы',
			tabPosition:'bottom',
			activeItem:this.activeItem || 0,
			items:[{
				xtype:'localordergrid',
				searchValue:this.searchValue
			},{
				xtype:'remoteordergrid',
				searchValue:this.searchValue
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.orderedservice.Orders.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.getItem(this.activeItem)
		},this)
	}
});


Ext.reg('orders', App.orderedservice.Orders);