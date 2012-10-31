Ext.ns('App.accounting');

App.accounting.ContractWindow = Ext.extend(Ext.Window, {

    initComponent:function(){
        this.form = new App.accounting.ContractForm({
            store:this.store,
            fn:function(record){
                Ext.callback(this.fn, this.scope || window, [record]);
            },
            scope:this
        });

        config = {
            width:300,
            height:200,
            modal:true,
            layout:'fit',
            title:'Добавить договор',
            items:[
                this.form
            ],
            bbar:[{
                text:'Сохранить',
                handler:this.onSave.createDelegate(this)
            },{
                text:'Отмена',
                handler:this.onCancel.createDelegate(this)
            }]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractWindow.superclass.initComponent.apply(this, arguments);

        this.on('beforeclose',function(){
        },this)

    },

    onSave: function(){
        this.form.onSave();
    },

    onCancel: function(){
        if(this.fn) {
            Ext.callback(this.fn, this.scope || window, [undefined]);
        };
    }
});
