Ext.ns('App.laboratory');

App.laboratory.RefRangeChangeForm = Ext.extend(Ext.Window, {

    initComponent:function(){
        this.form = new Ext.form.FormPanel({
            hideLabels:true,
            border:false,
            items:[{
                xtype:'textarea',
                border:false,
                anchor:'100% 100%',
                name:'text'
            }]
        });
        
        config = {
                title:'Референсные интервалы :: ' + this.analysis,
                width:550,
                height:350,
                modal:true,
                layout:'fit',
                border:false,
                items: [this.form],
                buttons:[{
                    text:'Сохранить',
                    handler:this.onSave.createDelegate(this)
                },{
                    text:'Отменить',
                    handler:function(){
                        this.close();
                    },
                    scope:this
                }]
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.RefRangeChangeForm.superclass.initComponent.apply(this, arguments);
        this.on('afterrender', function(){
            this.form.getForm().findField('text').setValue(this.text);
        }, this);
    },
    
    onSave: function(){
        if(this.fn){
            var text = this.form.getForm().findField('text').getValue();
            Ext.callback(this.fn, this.scope || window, [text]);
        }
    }
});