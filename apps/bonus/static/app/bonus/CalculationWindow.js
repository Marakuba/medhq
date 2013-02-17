Ext.ns('App.bonus');

App.bonus.CalculationWindow = Ext.extend(Ext.Window, {

    title: 'Новое начисление',

    initComponent:function(){


        this.form = new App.bonus.CalculationForm({
            store: this.store,
            fn:function(record){
                this.record = record;
                Ext.callback(this.fn, this.scope || window, [this.record]);
            },
            scope:this
        });

        config = {
            width:450,
            height:350,
            layout:'fit',
            items:[this.form],
            modal:true,
            border:false,
            buttons:[{
                text:'Сохранить',
                handler:this.onSave.createDelegate(this),
                scope:this
            },{
                text:'Закрыть',
                handler:this.onClose.createDelegate(this),
                scope:this
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.bonus.CalculationWindow.superclass.initComponent.apply(this, arguments);
    },

    onSave: function(){
        this.form.onSave();
    },

    onClose: function(){
        this.close();
    }

});

