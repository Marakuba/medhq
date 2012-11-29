Ext.ns('App', 'App.servicemanager');

App.servicemanager.LabServiceForm = Ext.extend(Ext.form.FormPanel,{

    origTitle: 'Лабораторная услуга',

    initComponent:function(){

        this.saveBtn = new Ext.Button({
            text: 'Сохранить',
            handler: this.onSaveBtnClick.createDelegate(this,[]),
            scope:this
        });

        this.closeBtn = new Ext.Button({
            text: 'Закрыть',
            handler: this.onCloseBtnClick.createDelegate(this,[]),
            scope:this
        });

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab','ls'),
            baseParams:{
                format:'json'
            },
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'base_service'},
                    {name: 'widget'},
                    {name: 'is_manual'},
                    {name: 'code'}
                ]
        });

        this.widgetCB = new Ext.form.ComboBox({
            fieldLabel: 'Виджет',
            disabled: this.record && this.record.data.id,
            name: 'widget',
            store: new Ext.data.ArrayStore({
                fields: ['id','title'],
                data: WebApp.lab_widgets
            }),
            typeAhead: true,
            triggerAction: 'all',
            valueField: 'id',
            displayField: 'title',
            mode: 'local',
            forceSelection: true,
            selectOnFocus: true,
            editable: false,
            anchor: '50%',
            listeners: {
                scope: this,
                select: function(combo, record, idx){
                    this.updateRecord();
                }
            }
        });

        this.tests = new App.laboratory.AnalysisEditor({
            showServiceTree: false,
            height: 300,
            listeners: {
                scope: this,
                aftersave: function(){
                    this.savedCount += 1;
                    if (this.savedCount == this.countToSave){
                        this.fireEvent('aftersave');
                    }
                }
            }
        });

        config = {
            layout: 'form',
            autoScroll: true,
            title: this.title || this.origTitle,
            items: [
            {
                xtype: 'hidden',
                name: 'base_service'
            },{
                xtype: 'checkbox',
                name: 'is_manual',
                checked: false,
                boxLabel: 'В отдельный ордер',
                listeners: {
                    scope: this,
                    check: function() {
                        if (!(this.dataIsLoading === true || this.dataIsLoading === undefined)){
                            this.updateRecord();
                        }
                    }

                }
            },{
                xtype:'textfield',
                name:'code',
                fieldLabel:'Код ручного исследования',
                width:200,
                listeners: {
                    scope:this,
                    render: function(c) {
                        var el = c.getEl();
                        el.on('blur',function(f){
                            if (!(this.dataIsLoading === true || this.dataIsLoading === undefined)){
                                this.updateRecord();
                            }
                        }, this);
                    }
                }
            },
            this.widgetCB,
            this.tests],

            bbar:[this.saveBtn, this.closeBtn]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.LabServiceForm.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            this.origTitle = this.title;
            if(this.bsRecord && this.bsRecord.data.id){
                this.setRecord(this.bsRecord);
            } else {
                this.dataIsLoading = false;
            }
        }, this);

        this.store.on('write', function(){
            this.savedCount += 1;
            if (this.savedCount == this.countToSave){
                this.fireEvent('aftersave');
            }
            this.makeClean();
        }, this);
    },

    setRecord: function(bsRecord){
        if (!bsRecord.data.id){
            this.record = new this.store.recordType();
            this.store.add(this.record);
            this.dataIsLoading = false;
        } else {
            this.tests.loadBaseService(bsRecord.data.id);
            this.dataIsLoading = true;
            this.store.load({
                params: {
                    base_service: bsRecord.data.id
                },
                callback: function(records){
                   if(records.length){
                        this.record = records[0];
                        var f = this.getForm();
                        f.loadRecord(records[0]);
                   }
                   this.dataIsLoading = false;

                },
                scope: this
            });
        }

    },

    updateRecord: function(){
        if (!this.record){
            this.record = new this.store.recordType();
            this.store.add(this.record);
        }
        this.getForm().updateRecord(this.record);
        this.markDirty();
    },

    setBaseService: function(bsUri){
        this.getForm().findField('base_service').setValue(bsUri);
        this.updateRecord();
        this.tests.setBaseService(bsRecord.data.id);
        this.onSave();
    },

    onSave: function(){
        this.savedCount = 0;
        if (this.isDirty()){
            this.store.save();
            this.tests.onSave();
        }
    },

    isDirty: function(){
        this.countToSave = 0;
        var records = this.store.getModifiedRecords();
        if (records.length > 0){
            this.countToSave +=1;
        }
        if (this.tests.isDirty()){
            this.countToSave +=1;
        }
        return this.countToSave > 0;
    },

    onSaveBtnClick: function(){
        this.fireEvent('saveform');
    },

    onCloseBtnClick: function(){
        this.fireEvent('closeform');
    },

    markDirty: function(){
        this.setTitle(this.origTitle + '*');
    },

    makeClean: function(){
        this.setTitle(this.origTitle);
    }

});
