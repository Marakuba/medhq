Ext.ns('App.laboratory');

App.laboratory.InputListChangeForm = Ext.extend(Ext.Window, {

    initComponent:function(){

        this.inputListStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab','inputlist'),
            model: ['id','name','resource_uri']
        });

        this.valueStore = new Ext.data.ArrayStore({
            model:['name','resource_uri']
        });

        this.form = new Ext.form.FormPanel({
            hideLabels:true,
            border:false,
            items:[{
                xtype: 'itemselector',
                name: 'inputlist',
                imagePath: WebApp.MEDIA_URL+'extjs/ux/images/',
                multiselects: [{
                    legend:'Возможные',
                    width: 300,
                    height: 300,
                    store: this.inputListStore,
                    displayField: 'name',
                    valueField: 'resource_uri',
                    tbar:[{
                        xtype:'textfield',
                        anchor:'100%'
                    }]
                }, {
                    legend:'Выбранные',
                    width: 300,
                    height: 300,
                    store: this.valueStore,
                    displayField: 'name',
                    valueField: 'resource_uri',
                    tbar: [{
                        text: 'Очистить',
                        handler: function() {
                            this.form.getForm().findField('inputlist').reset();
                        },
                        scope:this
                    }]
                }]
            }]
        });
        
        config = {
                title:'Маски ввода :: ' + this.analysis,
                width:650,
                height:400,
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
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.InputListChangeForm.superclass.initComponent.apply(this, arguments);
        this.on('afterrender', function(){
            var f = this.form.getForm().findField('inputlist');
            f.doLayout();
            this.inputListStore.load({
                callback:function(){
                    var selects = [];
                    Ext.each(this.inputList, function(il){
                        var rec = f.fromMultiselect.store.findExact('resource_uri',il);
                        var r = f.fromMultiselect.store.getAt(rec);
                        selects.push(rec);
                    }, this);
                    f.fromMultiselect.view.select(selects);
                    f.fromTo();
                },
                scope:this
            });
        }, this);
    },
    
    onSave: function(){
        if(this.fn){
            var inputList = this.form.getForm().findField('inputlist').getValue();
            Ext.callback(this.fn, this.scope || window, [inputList.split(',')]);
        }
    }
});