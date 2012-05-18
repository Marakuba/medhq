Ext.ns('App.orderedservice');

App.orderedservice.Orders = Ext.extend(Ext.TabPanel, {

	initComponent : function() {
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
	}
});


Ext.reg('orders', App.orderedservice.Orders);