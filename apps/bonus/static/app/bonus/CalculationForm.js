Ext.ns('App.bonus');


App.bonus.CalculationForm = Ext.extend(Ext.form.FormPanel, {


    initComponent: function(){

        config = {
            layout:'form',
            padding:10,
            baseCls:'x-plain',
            items:[{
                    layout:{
                        type:'hbox'
                    },
                    baseCls:'x-plain',
                    border:false,
                    defaults:{
                        baseCls:'x-plain',
                        border:false,
                        height:40,
                        layout:'form',
                        defaults:{
                            border:false,
                            allowBlank:false
                        }
                    },
                    items:[{
                        items:[{
                            xtype:'datefield',
                            name: 'start_date',
                            width:95,
                            fieldLabel: 'Начало периода',
                            format:'d.m.Y'
                        }]
                    },{
                        xtype:'spacer',
                        width:10
                    },{
                        items:[{
                            xtype:'datefield',
                            width:95,
                            name:'end_date',
                            fieldLabel: 'Конец периода',
                            format:'d.m.Y'
                        }]
                    }]
                },
                new Ext.form.ComboBox({
                    name : 'category',
                    allowBlank: false,
                    fieldLabel: 'Категория',
                    typeAhead: true,
                    editable: false,
                    triggerAction: 'all',
                    anchor:'100%',
                    // lazyRender:true,
                    mode: 'local',
                    store: new Ext.data.ArrayStore({
                        id: 0,
                        fields: [
                            'value',
                            'type'
                        ],
                        data: [
                            ['к', 'Врач клиники'],
                            ['л', 'Лечащий врач'],
                            ['в', 'Направивший врач']
                        ]
                    }),
                    valueField: 'value',
                    displayField: 'type'
                }), {
                    xtype:'textarea',
                    name:'comment',
                    anchor:'100%',
                    fieldLabel:'Комментарий'
                }
            ]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.bonus.CalculationForm.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
        }, this);
    },

    setActiveRecord : function(rec){
        this.record = rec;
        this.getForm().loadRecord(this.record);
    },

    setEmptyRecord : function(){
        this.record = new this.store.recordType();
    },

    onSave: function(){
        if(this.getForm().isValid()){
            var record = new this.store.recordType();
            this.getForm().updateRecord(record);
            if(this.fn) {
                Ext.callback(this.fn, this.scope || window, [record]);
            }
        }
    }
});
