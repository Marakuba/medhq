Ext.ns('App.visit');



App.visit.VisitTab = Ext.extend(Ext.Panel, {
    initComponent : function() {

        this.store = this.store || new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('visit','visit'),
            model: App.models.Visit,
            listeners:{
                scope:this,
                exception:this.onException
            }

        });

        this.preorderStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : true,
            apiUrl : App.utils.getApiUrl('scheduler','extpreorder'),
            model: App.models.Preorder
        });

        this.patientStore = this.patientStore || new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('patient','patient'),
            model: App.models.Patient
        });

        this.model = this.store.recordType;

        this.form = new App.visit.VisitForm({
            region:'center',
            baseCls:'x-border-layout-ct',
            model:this.model,
//          record:this.record,
//          patientRecord:this.patientRecord,
            preorderRecord:this.preorderRecord,
            type:this.type,
            hasBarcode:this.hasBarcode,
            fn:function(record){
                this.record = record;
                this.store.insertRecord(record);
                Ext.callback(this.fn, this.scope || window, [this.record]);
            },
            listeners:{
                scope:this,
                basketexception:this.onException,
                closeall:function(){
                    this.destroy();
                }
            },
            scope:this
        });

        this.patientButton = new Ext.Button({
            text:'Пациент',
            iconCls: 'silk-pencil',
            handler: this.onPatientEdit.createDelegate(this,[]),
            disabled:true,
            scope:this
        });

        this.saveButton = new Ext.Button({
            text:'Сохранить',
            handler: this.onFormSave.createDelegate(this,[]),
//          disabled:true,
            scope:this
        });

        this.payButton = new Ext.Button({
            text:'Сохранить и оплатить',
            handler: this.onFormSave.createDelegate(this,[true]),
            hidden:this.type!='visit',
//          disabled:true,
            scope:this
        });

        config = {
            layout:'fit',
            border:false,
            defaults: {
                border:false
//              collapsible: true,
//              split: true,
                //baseCls:'x-border-layout-ct',
            },
            tbar:[this.patientButton,
                  {
                    xtype:'button',
                    iconCls:'silk-accept',
                    text:'Выбрать предзаказ',
                    // hidden:App.settings.strictMode,
                    handler: this.form.onPreorderChoice.createDelegate(this.form,[]),
                    scope:this
                  },
                  '->',{
                text:'Закрыть',
                handler:this.onClose.createDelegate(this,[])
            },this.saveButton,this.payButton],
            items:[this.form]
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.VisitTab.superclass.initComponent.apply(this, arguments);

//      this.setTitle(this.getTitleText()); //TODO: make correct title

        this.store.on('write', this.onStoreWrite, this);
        this.on('destroy', function(){
            this.store.un('write', this.onStoreWrite, this);
        },this);

        this.on('render', function(){
            if (!this.patientId){
                return false
            };
            this.setTitle(this.getTitleText());
            this.patientStore.setBaseParam('id',this.patientId);
            this.patientStore.load({callback:function(records){
                if (!records.length){
                    return
                };
                this.patientRecord = records[0];
                this.getPatientTitle();
                this.form.setPatientRecord(this.patientRecord);
                if (this.visitId){
                    this.store.setBaseParam('id',this.visitId);
                    this.store.load({callback:function(records){
                        if (!records.length){
                            return
                        };
                        this.record = records[0];
                        this.form.setVisitRecord(this.record,this.patientRecord);
                    },scope:this});
                } else {
                    this.form.saveAction();
                    if (this.TypeError != 'material') {
                        this.form.setContractRecord(this.patientId,this.visitId);
                    };
                };
            },scope:this});

            //ищем записи предзаказов во внутреннем store для независимости от внешних хранилищ
            if (this.preorderRecord){
                var preorderIDs = [];
                if(Ext.isArray(this.preorderRecord)){
                    Ext.each(this.preorderRecord,function(rec){
                        preorderIDs.push(rec.data.id)
                    })
                } else if (this.preorderRecord.data) {
                    preorderIDs = [this.preorderRecord.data.id];
                };
                this.preorderStore.baseParams['id__in']=preorderIDs;
                this.preorderStore.load({callback:function(records){
                    if (!records.length) return false;
                    this.form.setPreorderRecord(records);
                },scope:this})
            }
        },this);

    },


    onFormSave: function(post_pay) {
        if (post_pay){
            this.post_pay = post_pay
            this.totalSum = this.form.getSum();
        } else {
            this.post_pay = undefined;
        };
        var f = this.form;
        this.steps = f.getSteps();
        this.tSteps = this.steps;
        if(this.steps>0) {
            this.msgBox = Ext.MessageBox.progress('Подождите','Идет сохранение документа!');
            f.on('popstep',this.popStep, this);
            f.onSave();
        } else {
            this.onClose(true);
        }
    },

    onClose: function(noConfirm){
        var steps = this.form.getSteps();
        if(noConfirm===undefined && steps>0) {
            Ext.MessageBox.show({
                title:'Подтверждение',
                closable:false,
                modal:true,
                buttons:{
                    cancel:'Отменить закрытие',
                    yes:'Сохранить и закрыть',
                    no:'Не сохранять'
                },
                msg:'Документ не сохранен!',
                fn:function(btn){
                    if(btn!='cancel') {
                        if(btn=='yes') {
                            this.onFormSave();
                        } else if (btn=='no') {
                            this.close();
                        }
                    }
                },
                scope:this
            });
        } else {
            if (this.post_pay != undefined) {
                //var c = this.form.getSum();
                this.win = new App.billing.PaymentWindow({
                    is_income : true,
                    amount:this.totalSum,
                    patientRecord:this.patientRecord
                });
                this.win.show();
            };
            this.close();
        }
    },

    close: function() {
        WebApp.fireEvent('patientcardupdate',this.patientId);
        WebApp.fireEvent('closeapp',this.id);
//      WebApp.fireEvent('balanceupdate');
    },

    onStoreWrite: function(store, action, result, res, rs) {
        if(action=='create') {
            //если форма вызвана из карты пациента, то передавать this.patientId не надо. тогда просто
            //перегрузится visitStore в таблице визитов в карте пациента
            //иначе в таблице пациентов выберется текущий пациент и загрузятся его данные
            if (this.hasPatient){
                WebApp.fireEvent('visitcreate',rs);
            } else {
                WebApp.fireEvent('visitcreate',rs,this.patientId);
            }
        }
        this.record = rs;
        this.popStep();
    },

    popStep: function() {
        this.steps-=1;
        if(this.msgBox) {
            var progress = (this.tSteps-this.steps) / this.tSteps;
            this.msgBox.updateProgress(progress);
        }
        if(this.steps===0) {
            if(this.msgBox) {
                this.msgBox.hide();
            }
            this.onClose(true);
//          this.fireEvent('savecomplete');
        }
    },

    getPatientTitle : function(){
        var rec = this.patientRecord;
        var text = '';
        if (rec){
            text = 'Пациент: ' + rec.data.last_name + ' ' + rec.data.first_name + ' ' + rec.data.mid_name;
            this.patientButton.setText(text);
            this.patientButton.enable()
        } else {
            this.patientButton.disable();
            console.log('Не указан пациент')
        }
        return text
    },

    getTitleText: function() {
        var title;
        if(this.visitId) {
            title = this.type == 'visit' ? 'Прием №'+this.visitId : 'Поступление биоматериала №'+this.visitId;
        } else {
            title = this.type == 'visit' ? 'Новый прием' : 'Новое поступление биоматериала';
        }
        return title
    },

    onPatientEdit: function(){
        var rec = this.patientRecord;
        if (!rec){
            return false
        }
        this.pWin = new App.patient.PatientWindow({
            fromVisit:true,
            fn:function(record){
                this.patientRecord = record;
                this.getPatientTitle()
//              this.pWin.close()
            },
            listeners:{
                savecomplete:function(){
                    this.pWin.close();
                    this.patientStore.load();
                },
                scope:this
            },
            record:this.patientRecord,
            scope:this
        });

        this.pWin.show();
    },

    onException: function(){
        if(this.msgBox) {
            this.msgBox.hide();
        };
        Ext.Msg.alert('Ошибка!','Документ не сохранен. Попробуйте позже.')
    }
});

Ext.reg('visittab', App.visit.VisitTab);
