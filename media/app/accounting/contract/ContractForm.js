Ext.ns('App.accounting');


App.accounting.ContractForm = Ext.extend(Ext.form.FormPanel, {


    initComponent: function(){

        this.store = this.store || new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_contract'),
            model: App.models.AccountingContract
        });

        this.branchStore = new Ext.data.RESTStore({
            apiUrl : get_api_url('state'),
            baseParams:{
                format:'json',
                type:'b'
            },
            model: App.models.MedState
        });

        this.stateStore = new Ext.data.RESTStore({
            apiUrl : get_api_url('state'),
            autoLoad:true,
            baseParams:{
                format:'json',
                type:'j'
            },
            model: App.models.MedState
        });

        this.branchCmb = new Ext.form.LazyComboBox({
            fieldLabel:'Филиал',
            allowBlank:false,
            displayField: 'name',
            anchor:'98%',
            store: this.branchStore,
            name:'branch',
            listeners:
            {
                scope:this,
                'select':function(combo, record, index){
                }
            }
        });

        this.stateCombo = new Ext.form.LazyComboBox({
            fieldLabel:'Организация',
            name: 'state',
            anchor:'98%',
            hideTrigger:true,
            allowBlank:false,
            autoSelect:false,
            store:this.stateStore,
            displayField: 'name',
            listeners:{
                'render': function(f){
                    var el = f.getEl()
                    el.on('click',this.onStateChoice.createDelegate(this, []),this)
                },
                'select':function(combo,record,index){
                },
                scope:this
            },
            onTriggerClick:this.onStateChoice.createDelegate(this, [])
        });

        config={
            layout:'form',
            border:false,

            items:[{
                    layout:'hbox',
                    border:false,
                    defaults:{
                        border:false,
                        labelWidth:40,
                        height:50,
                        align:'center'
                    },
                    items:[{
                        defaults:{
                            border:false,
                        },
                        layout:'form',
                        items:[{
                            xtype:'textfield',
                            name: 'number',
                            fieldLabel:'Номер',
                            padding:'2',
                            width:100,
                            allowBlank:true
                        }]
                    },{
                        layout:'form',
                        items:[{
                            xtype:'datefield',
                            width:90,
                            labelWidth:30,
                            fieldLabel:'от',
                            name:'on_date',
                            format:'d.m.Y',
                            allowBlank:false
                        }]
                    }]
                },

                this.branchCmb,
                this.stateCombo
            ]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractForm.superclass.initComponent.apply(this, arguments);
    },

    onStateChoice: function() {
        var stateWindow = new App.choices.StateChoiceWindow({
            title:'организации',
            scope:this,
            store:this.stateStore,
            fn:function(record){
                if (!record){
                    return 0;
                }
                this.stateCombo.forceValue(record.data.resource_uri);
                stateWindow.close();
            }
         });
        stateWindow.show();
    },

    onSave: function(){
        var record = new this.store.recordType();
        this.getForm().updateRecord(record);
        if(this.fn) {
            Ext.callback(this.fn, this.scope || window, [record]);
        };
    }
})
