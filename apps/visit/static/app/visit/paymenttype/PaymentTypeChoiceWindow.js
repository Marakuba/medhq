Ext.ns('App.choices');

App.choices.PaymentTypeChoiceWindow = Ext.extend(Ext.Window, {

    initComponent:function(){

        this.policyCmb = new Ext.form.LazyClearableComboBox({
//          id:'visit-policy-cmb',
            fieldLabel:'Полис ДМС',
            anchor:'98%',
            name:'insurance_policy',
            store:new Ext.data.JsonStore({
                proxy: new Ext.data.HttpProxy({
                    url:App.utils.getApiUrl('patient','insurance_policy'),
                    method:'GET'
                }),
                root:'objects',
                idProperty:'resource_uri',
                fields:['resource_uri','name','number','state_name','start_date','end_date']
            }),
            displayField: 'name',
            listeners:{
                select: function(combo,record){
                },
                scope:this
            }
//          itemSelector: 'div.x-combo-list-item',
//          tpl:new Ext.XTemplate(
//              '<tpl for="."><div class="x-combo-list-item">',
//              '№{number}, {state_name}',
//              '</div></tpl>'
//          )
        });


        this.policyBar = new Ext.Panel({
            layout:'hbox',
            hidden: true,
            defaults:{
                baseCls:'x-border-layout-ct',
                border:false
            },
            items:[{
                flex:1,
                layout:'form',
                items:this.policyCmb
            },{
                //columnWidth:0.20,
                width:30,
                items:{
                    xtype:'button',
                    //text:'Добавить',
                    iconCls:'silk-add',
                    handler:function(){
                        var win;
                        if(!win && this.patientRecord) {
                            win = new App.insurance.PolicyWindow({
                                patientRecord:this.patientRecord,
                                fn: function(uri){
                                    this.policyCmb.forceValue(uri);
                                win.close();
                                },
                                scope:this
                            });
                            win.show(this);
                        }
                    },
                    scope:this
                }
            }]
        });


        this.payerCmb = new Ext.form.LazyComboBox({
                fieldLabel:'Плательщик',
                anchor:'98%',
                name:'payer',
                minChars:3,
                // hidden:(App.settings.strictMode && this.types==='material'),
                emptyText:'Выберите плательщика...',
                proxyUrl:App.utils.getApiUrl('state','state'),
                // value:App.settings.strictMode ? App.utils.getApiUrl('state','state',active_state_id) : '',
                listeners:{
                    select:function(combo,record){
                    },
                    scope:this
                }
        })


        this.payerBar = new Ext.Panel({
            layout:'hbox',
            hidden: true,
            defaults:{
                baseCls:'x-border-layout-ct',
                border:false
            },
            items:[{
                flex:1,
                layout:'form',
                items:this.payerCmb
            }]
        });

        this.paymentTypeCB = new Ext.form.ComboBox({
            fieldLabel:'Форма оплаты',
            name:'payment_type',
            store:new Ext.data.ArrayStore({
                fields:['id','title'],
                data: [
                    ['н','Касса'],
                    ['б','Юридическое лицо'],
                    ['д','ДМС']]
            }),
            typeAhead: true,
            triggerAction: 'all',
            baseCls:'x-border-layout-ct',
            valueField:'id',
            displayField:'title',
            mode: 'local',
            forceSelection:true,
            selectOnFocus:true,
            editable:false,
            anchor:'98%',
            value:'н',
            listeners: {
                select:function(combo,rec,i){
                    this.onPaymentTypeChoice(rec.data.id);
                },
                afterrender:function(){

                },
                scope:this
            }
        });

        this.paymentFs = new Ext.form.FormPanel({
//            layout: 'form',
            baseCls:'x-border-layout-ct',
            border:false,
            defaults:{
                border:false,
                baseCls:'x-border-layout-ct'
            },
            items:[
                this.paymentTypeCB,
                this.policyBar,
                this.payerBar
            ]
        });

        config = {
            width:500,
            height:200,
            modal:true,
            layout:'form',
//          baseCls:'x-border-layout-ct',
            title:'Тип оплаты',
            padding:5,
            items:[
                this.paymentFs
            ],
            bbar:[{
                text:'Сохранить',
                handler:this.setPtype,
                scope:this
            }]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.choices.PaymentTypeChoiceWindow.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
            if (!this.record){
                // console.log('не передана запись визита!');
                return false;
            }
            this.paymentTypeCB.setValue(this.record.data.payment_type);
            this.onPaymentTypeChoice(this.record.data.payment_type);
            this.payerCmb.setValue(this.record.data.payer);
            this.policyCmb.getStore().setBaseParam('patient',this.patientRecord.data.id);
            this.policyCmb.setValue(this.record.data.insurance_policy)

        },this)

    },

    onPaymentTypeChoice : function(id){

        switch(id){
            case 'д':
                this.hidePaymentCmb('payer');
                this.showPaymentCmb('policy');
                break
            case 'б':
                this.hidePaymentCmb('policy');
                this.showPaymentCmb('payer');
                break
            case 'н':
                this.hidePaymentCmb('policy');
                this.hidePaymentCmb('payer');
                break
            default:
                this.hidePaymentCmb('policy');
                this.hidePaymentCmb('payer');
                break
        };

    },

    hidePaymentCmb: function(type){
        if (!type) return false
        this[type+'Cmb'].allowBlank = true;
        this[type+'Cmb'].setRawValue('');
        this[type+'Cmb'].originalValue = '';
        this[type+'Cmb'].value = '';
        this[type+'Cmb'].reset();
        this[type+'Bar'].hide();
    },

    showPaymentCmb: function(type){
        if (!type) return false
        this[type+'Cmb'].allowBlank = false;
        this[type+'Bar'].show();
    },

    setPtype: function(){
        var f = this.paymentFs.getForm();
        if (!f.isValid()){
            Ext.Msg.alert('Внимание!','Введите все поля формы!')
            return false
        }
        params = {};
        params['id'] = this.record.data.id;
        params['ptype'] = this.paymentTypeCB.getValue();
        params['payer'] = App.utils.uriToId(this.payerCmb.getValue());
        params['insurance_policy'] = App.utils.uriToId(this.policyCmb.getValue());
        App.direct.visit.setPaymentType(params,function(res){
            //НЕ УДАЛЯТЬ console.log(res.data) !!!
            // console.log(res.data);
            if(res.success){
                this.fireEvent('ptypechoiced');
                this.close();
            }
        },this)
    }
});
