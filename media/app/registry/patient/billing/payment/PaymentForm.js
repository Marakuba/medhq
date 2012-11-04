Ext.ns('Ext.ux');
Ext.ns('Ext.billing');


App.billing.PaymentForm = Ext.extend(Ext.form.FormPanel, {


    initComponent: function(){

        this.store = new Ext.data.RESTStore({
            apiUrl : App.getApiUrl('billing','payment'),
            baseParams:{
                format:'json'
            },
            model: App.models.paymentModel
        });

        this.cl_acc_store = new Ext.data.JsonStore({
            autoLoad:false,
            proxy: new Ext.data.HttpProxy({
                url:App.getApiUrl('billing','clientaccount'),
                method:'GET'
            }),
            root:'objects',
            idProperty:'resource_uri',
            fields:['resource_uri','client_item','account_id','client_balance'],
            writer : new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: true
            }),
            baseParams : {
                format:'json'
            }
        });

        this.patient_store = new Ext.data.JsonStore({
            autoLoad:false,
            proxy: new Ext.data.HttpProxy({
                url:App.getApiUrl('patient','patient'),
                method:'GET'
            }),
            root:'objects',
            idProperty:'resource_uri',
            fields:['resource_uri','client_item','full_name','last_name','balance'],
            writer : new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: true
            }),
            baseParams : {
                format:'json'
            }
        });

        this.clientCmb = new Ext.form.LazyComboBox({
            fieldLabel:'Пациент',
            allowBlank:false,
            displayField: 'full_name',
            queryParam:'last_name__istartswith',
            hidden:this.patientRecord||this.patient_id? true : false,
            disabled:this.patientRecord||this.patient_id? true : false,
            anchor:'71%',
            store: this.patient_store,
            //name:'client_item',
            listeners:
            {
                scope:this,
                'select':function(combo, record, index){
                    var client_id = App.uriToId(record.data.resource_uri);
                    this.cl_accCmb.store.setBaseParam('client_item__client',client_id);
                    this.cl_accCmb.store.load({callback:this.setAccount,scope:this});
                    this.cl_accCmb.enable();
                    this.setBalance(record.data.balance);
                       //this.balanceButton.setDisabled((!(record.data.balance <0 == this.is_income))||(record.data.balance==0));
                }
            }
        }),

        this.cl_accCmb = new Ext.form.LazyComboBox({
            fieldLabel:'Лицевой счет',
            anchor:'71%',
            name:'client_account',
            store:this.cl_acc_store,
            disabled:(this.patientRecord||this.patient_id)? false : true,
            allowBlank:false,
            displayField: 'account_id',
            selectOnFocus:true
        }),

        this.balanceButton = new Ext.Button({
            text:'...',//будет обновляться при выборе пациента
            disabled:true,
            fieldLabel:' Баланс',
            handler:this.onBalanceClick.createDelegate(this),
            scope:this
        })

        this.amountField = new Ext.form.NumberField({
            fieldLabel: 'Сумма',
            name: 'amount',
            //width:140,
            style:'font-size:2.5em; height:1em; width:140px',
            allowBlank:true,
            minValue: 0,
            value: 0,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        this.onSave();
                    }
                },
                scope:this
            }
        });

        //this.is_income = true;
        config = {
            //title:this.is_income==true ? 'Приходный ордер' : 'Расходный ордер',
            closable:true,
            layout:'border',
            trackResetOnLoad:true,
            items:
            [
                {
                baseCls:'x-border-layout-ct',
                region:'center',
                layout:'border',
                items:[{
                    region:'center',
                    //height:200,
                    xtype:'fieldset',
                    border:false,
                    labelWidth:75,
                    defaults:{
                        layout:'form'
                    },
                    items:[{
                        xtype:'hidden',
                        name:'print_check'
                        //value:false
                    },{
                        xtype:'compositefield',
                        fieldLabel:'№',
                        itemCls:'doc-title',
                        invalidClass:'x-plain',
                        items:[{
                            xtype:'textfield',
                            name: 'id',
                            disabled:true,
                            padding:'2',
                            width:75,
                            allowBlank:true
                        },{
                            xtype:'displayfield',
                            value:'от'
                        },{
                            xtype:'datefield',
                            name:'doc_date',
                            format:'d.m.Y',
                            allowBlank:false
                        }]
                    },{
                        layout: {
                            type:'column'
                        },
                        baseCls:'x-border-layout-ct',
                        border:false,
                        defaults:{
                            xtype:'fieldset',
                            layout:'form',
                            border:false,
                            padding:'2',
                            labelWidth:75
                        },
                        items:[{
                            columnWidth:1,
                            items:[this.clientCmb,
                                this.cl_accCmb,
                            new Ext.form.ComboBox({
                                name : 'payment_type',
                                fieldLabel: 'Вид оплаты',
                                typeAhead: true,
                                triggerAction: 'all',
                                anchor:'71%',
                                lazyRender:true,
                                mode: 'local',
                                store: new Ext.data.ArrayStore({
                                    id: 0,
                                    fields: [
                                        'value',
                                        'type'
                                    ],
                                    data:   [['cash', 'Наличные'], ['card','Банковская карта']]//убрал ['non_cash', 'Безналичный расчет'],
                                }),
                                valueField: 'value',
                                value:'cash',
                                displayField: 'type'
                            }),
                            this.balanceButton,
                            this.amountField,{
                                xtype:'textarea',
                                name:'comment',
                                fieldLabel:'Примечание',
                                anchor:'98%',
                                autoScroll:true,
                                allowBlank:true
                            },
                            {
                                xtype:'hidden',
                                name:'direction',
                                allowBlank:true,
                                value:this.is_income==true ? '1' : '2'
                            }
                            ]
                        }]
                    }]
                }]
            }]

        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.billing.PaymentForm.superclass.initComponent.apply(this, arguments);
//        App.eventManager.on('paymentcreate', this.onPmCreate, this);
        //App.eventManager.on('accountcreate', this.onAccountCreate, this);
        //App.eventManager.on('clientaccountcreate', this.onClientAccountCreate, this);

//        this.store.on('write', this.onStoreWrite, this);
//        this.on('destroy', function(){
//            this.store.un('write', this.onStoreWrite, this);
////            App.eventManager.un('paymentcreate', this.onPmCreate, this);
//        },this);



        this.on('afterrender', function(){
            if (this.patientRecord || this.patient_id) {
                if (this.patientRecord){
                    this.patient_id = this.patientRecord.data.id;
                };
                this.cl_accCmb.store.setBaseParam('client_item__client',
                                                                        this.patient_id);
                this.cl_accCmb.store.load({callback:this.setAccount,scope:this});
                //this.getForm().findField('client_account').setValue(this.patientRecord.data.resource_uri);
            }
            if(this.record) {
                this.getForm().loadRecord(this.record);
                var patient = App.getApiUrl('patient','patient') + '/' + this.record.data.client
                this.clientCmb.setValue(patient);
                this.clientCmb.originalValue = patient;
            }
            else {
                var d = new Date;
                this.getForm().findField('doc_date').setValue(d);
                this.getForm().findField('doc_date').originalValue = d;
                if (this.amount){
                    this.amountField.setValue(this.amount);
                }
            };
            this.amountField.focus(true,1500);
        },this);

        /*this.on('paymentcreate', function(record){
            this.record = record;
            this.getForm().loadRecord(this.record);
            this.getForm().findField('number').setValue(this.record.data.id);
            this.getForm().findField('number').originalValue = this.record.data.id;
        },this);*/
    },

    onPmCreate: function(record) {
        this.record = record;
        this.getForm().loadRecord(this.record);
    },

    getRecord: function() {
        if(!this.record) {
            if(this.model) {
                var Model = this.model;
                this.record = new Model();
            } else {
                console.log('Ошибка: нет модели');
            }
        }
        return this.record;
    },

    onSave: function() {
        var f = this.getForm();
        if (f.findField('amount')=='0'){
            return false
        }
        if(f.isValid()){
            var Record = this.getRecord();
            /*this.cl_acc_store.baseParams = {
                client: this.getForm().findField('client').getValue(),
                account: this.getForm().findField('account').getValue()
            }
            this.cl_acc_store.load();
            if (!this.cl_acc_store.Count()) {

            }*/
            f.updateRecord(Record);
            if(this.fn) {
                Ext.callback(this.fn, this.scope || window, [Record]);
            };
            //this.markDirty(false);
        } else {
            Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
        }
    },

    onClose: function() {
        this.isModified();
        this.destroy();
    },

    isModified: function() {
        console.log('is form dirty:', this.getForm().isDirty());

        this.getForm().items.each(function(f){
           if(f.isDirty()){
            console.log('dirty field:',f);
           }
        });
    },

    setAccount: function(records,opt,success){
        if (records) {
            var rec = records[0];
            this.cl_accCmb.setValue(rec.data.resource_uri);
            this.cl_accCmb.originalValue = rec.data.resource_uri;
            this.setBalance(rec.data.client_balance);
        }
    },

    onStoreWrite: function(store, action, result, res, rs) {
//        App.eventManager.fireEvent('paymentsave',rs);
        this.record = rs;
    },

    onPrintCheck: function(){
        var value = this.getForm().findField('print_check').getValue();
        if (value=='true') {
            Ext.MessageBox.show({
                title:'Чек уже был напечатан',
                msg: 'Всё равно печатать?',
                buttons: Ext.MessageBox.YESNO,
                fn: function(btn){
                    if(btn=='yes'){
                        //Посылаем команду печати чека
                    }
                },

                scope: this
            });
        } else {
            this.getForm().findField('print_check').setValue(true);
            this.onSave()
            //Посылаем команду печати чека
        }

    },

    onBalanceClick: function(){
        this.amountField.setValue(Math.abs(parseInt(this.balanceButton.getText())))
    },

    setBalance: function(balance){
        if (balance==null) balance = 0;
        this.balanceButton.setText(String.format("{0}",balance));
        this.balanceButton.setDisabled((balance==0) || (this.is_income == (balance > 0)));
    }

});

Ext.reg('paymentform',App.billing.PaymentForm);
