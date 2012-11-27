Ext.ns('App.referral');

App.referral.ReferralWindow = Ext.extend(Ext.Window, {

    initComponent:function(){
        config = {
            title:'Организации / врачи',
            width:700,
            height:500,
            layout:'fit',
            items:{
                xtype:'referralgrid',
                fn: function(record){
                    Ext.callback(this.fn, this.scope || window, [record]);
                },
                listeners:{
                    scope:this,
                    referralcreate:function(record){
                        this.fireEvent('referralcreate',record)
                    }
                },
                scope:this
            },
            modal:true,
            border:false
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.referral.ReferralWindow.superclass.initComponent.apply(this, arguments);
    }
    
});


Ext.reg('referralwindow', App.referral.ReferralWindow);