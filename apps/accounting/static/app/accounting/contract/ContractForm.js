Ext.ns('App.accounting');


App.accounting.ContractForm = Ext.extend(Ext.form.FormPanel, {


    initComponent: function(){

        this.store = this.store || new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('accounting','acc_contract'),
            model: App.models.AccountingContract
        });

        this.branchStore = new Ext.data.RESTStore({
            apiUrl : App.utils.getApiUrl('state','state'),
            baseParams:{
                format:'json',
                type:'b'
            },
            model: App.models.MedState
        });

        this.stateStore = new Ext.data.RESTStore({
            apiUrl : App.utils.getApiUrl('state','jstate'),
            autoLoad : true,
            autoSave : false,
            baseParams:{
                format:'json',
                type:'j'
            },
            model: App.models.State
        });

        this.branchField = new Ext.form.LazyComboBox({
            fieldLabel:'Филиал',
            allowBlank:false,
            displayField: 'name',
            anchor:'100%',
            store: this.branchStore,
            name:'branch',
            editable:false,
            typeAhead:true,
            selectOnFocus:false,
            listeners:  {
                'select':function(combo, record, index){
                },
                scope:this
            }
        });

        this.stateField = new Ext.form.LazyComboBox({
            fieldLabel:'Организация',
            name: 'state',
            anchor:'100%',
            // hideTrigger:false,
            allowBlank:false,
            autoSelect:false,
            store:this.stateStore,
            displayField: 'name',
            listeners:{
                'render': function(f){
                    var el = f.getEl();
                    el.on('click',this.onStateChoice.createDelegate(this, []),this);
                },
                'select':function(combo,record,index){
                },
                scope:this
            },
            onTriggerClick:this.onStateChoice.createDelegate(this, [])
        });

        config = {
            layout:'form',
            border:false,
            padding:10,
            items:[{
                    layout:{
                        type:'hbox'
                    },
                    border:false,
                    defaults:{
                        border:false,
                        height:40,
                        layout:'form',
                        defaults:{
                            border:false,
                            allowBlank:false
                        }
                    },
                    items:[{
                        // labelWidth:40,
                        items:[{
                            xtype:'textfield',
                            name: 'number',
                            labelWidth:40,
                            fieldLabel:'Номер',
                            width:100
                        }]
                    },{
                        xtype:'spacer',
                        width:10
                    },{
                        labelWidth:20,
                        items:[{
                            xtype:'datefield',
                            width:90,
                            fieldLabel:'от',
                            name:'on_date',
                            format:'d.m.Y',
                            value:new Date()
                        }]
                    }]
                },

                this.branchField,
                this.stateField
            ]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractForm.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            if(this.contractId){
                this.store.load({
                    params:{
                        id:this.contractId
                    },
                    callback: function(rs, opts){
                        if(rs.length){
                            this.setActiveRecord(rs[0]);
                        } else {
                            this.setEmptyRecord();
                        }
                    },
                    scope:this
                });
            } else if (this.record) {
                this.setActiveRecord(this.record);
            } else {
                this.setEmptyRecord();
            }
            this.getForm().findField('number').focus(false, 350);
        }, this);
    },

    setActiveRecord : function(rec){
        this.record = rec;
        this.getForm().loadRecord(this.record);
    },

    setEmptyRecord : function(){
        this.record = new this.store.recordType();
    },

    onStateChoice: function() {
        var stateWindow = new App.choices.StateChoiceWindow({
            title:'Организации',
            scope:this,
            store:this.stateStore,
            addCompany:true,
            companyType:'j',
            fn:function(record){
                if (!record){
                    return;
                }
                this.stateField.forceValue(record.data.resource_uri);
                stateWindow.close();
            }
         });
        stateWindow.show();
    },

    onSave: function(){
        if(this.getForm().isValid()){
            // var record = new this.store.recordType();
            this.getForm().updateRecord(this.record);
            if(this.fn) {
                Ext.callback(this.fn, this.scope || window, [this.record]);
            }
        }
    }
});
