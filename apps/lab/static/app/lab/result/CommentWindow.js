Ext.ns('App.result');

App.result.CommentWindow = Ext.extend(Ext.Window, {

    initComponent:function(){
        this.form = new Ext.form.FormPanel({
            hideLabels:true,
            border:false,
            items:[{
                xtype:'textarea',
                anchor:'100% 100%',
                name:'comment'
            }]
        });
        
        config = {
                title:'Комментарий :: '+this.analysis,
                width:550,
                height:350,
                modal:true,
                layout:'fit',
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
        App.result.CommentWindow.superclass.initComponent.apply(this, arguments);
        this.on('afterrender', function(){
            this.form.getForm().findField('comment').setValue(this.comment);
        }, this);
    },
    
    onSave: function(){
        if(this.fn){
            var comment = this.form.getForm().findField('comment').getValue();
            Ext.callback(this.fn, this.scope || window, [comment]);
        }
    }
});