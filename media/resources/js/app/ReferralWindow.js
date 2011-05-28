Ext.ns('App');

App.ReferralWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		config = {
			title:'Организации / врачи',
			width:700,
			height:500,
			layout:'fit',
			items:{
				xtype:'referralgrid'
			},
			modal:true,
			border:false
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ReferralWindow.superclass.initComponent.apply(this, arguments);
	}
	
});


Ext.reg('referralwindow', App.ReferralWindow);