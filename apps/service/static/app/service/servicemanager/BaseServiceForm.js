Ext.ns('App', 'App.servicemanager');

App.servicemanager.BaseServiceForm = Ext.extend(Ext.form.FormPanel,{

    initComponent:function(){
        this.childs = [];

        this.saveBtn = new Ext.Button({
            text: 'Сохранить',
            handler: this.onSave.createDelegate(this,[]),
            scope:this
        });

        this.closeBtn = new Ext.Button({
            text: 'Закрыть',
            handler: this.closeForm.createDelegate(this,[]),
            scope:this
        });

        this.typeCB = new Ext.form.ComboBox({
            fieldLabel: 'Тип',
            disabled: this.record && this.record.data.id,
            name: 'type',
            store: new Ext.data.ArrayStore({
                fields: ['id','title'],
                data: WebApp.bs_types
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
            value: 'cons',
            listeners: {
                scope: this,
                select: function(combo, record, idx){
                    if (record.data.id == 'lab'){
                        this.openLabServiceForm(true);
                    }
                    this.markDirty();
                }
            }
        });

        this.itemsSet = [{
            xtype:'hidden',
            name:'parent'
        },{
            xtype:'hidden',
            name:'version'
        }];

        if (this.record.data.type == 'group'){
            this.itemsSet.push(
            {
                xtype: 'textfield',
                width: 400,
                value: '',
                allowBlank: false,
                fieldLabel: 'Наименование',
                name:'name'
            },{
                xtype:'hidden',
                name:'type'
            });
        } else {
            this.itemsSet = this.itemsSet.concat([
                this.typeCB,
            {
                xtype: 'textfield',
                width: 400,
                padding: 4,
                value: '',
                allowBlank: false,
                fieldLabel: 'Наименование',
                name:'name',
                listeners: {
                    scope:this,
                    change: function() {
                        this.markDirty();
                    },
                    render: function(c) {
                        var el = c.getEl();
                        el.on('blur',function(f){
                            var short_name = this.getForm().findField('short_name');
                            if (short_name && !short_name.getValue() && c.getValue()){
                                short_name.setValue(c.getValue());
                            }
                        }, this);
                    }
                }

            },{
                xtype:'textfield',
                width: 400,
                value: '',
                allowBlank: false,
                fieldLabel: 'Краткое наименование',
                name:'short_name'
            },
            {
                xtype:'textfield',
                width: 100,
                value: '',
                allowBlank: true,
                fieldLabel: 'Код (создаётся автоматически)',
                name:'code'
            },{
                xtype:'numberfield',
                width: 100,
                value: 0,
                allowBlank: true,
                minValue:0,
                fieldLabel: 'Время выполнения(мин)',
                name:'execution_time'
            },
            // this.materialCB,
            {
                xtype:'textfield',
                width: 400,
                value: '',
                fieldLabel: 'Рабочий бланк',
                name:'inner_template'
            },{
                xtype:'textarea',
                width: 400,
                height:50,
                autoScroll: true,
                value: '',
                fieldLabel: 'Общий референсный интервал',
                name:'gen_ref_interval'
            },{
                xtype:'textarea',
                width: 400,
                autoScroll: true,
                height:50,
                value: '',
                fieldLabel: 'Описание',
                name:'description'
            }]);
        }

        config = {
            layout: 'form',
            labelWidth: 200,
            border: false,
            autoScroll: true,
            items: this.itemsSet,
            defaults:{
                listeners: {
                    scope:this,
                    change: function() {
                        this.markDirty();
                    }
                }
            },
            bbar:[this.saveBtn, this.closeBtn]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.BaseServiceForm.superclass.initComponent.apply(this, arguments);

        this.record.store.on('write', this.onBSStoreWrite, this);

        this.on('afterrender', function(form){
            this.origTitle = this.title;
            if (this.record){
                this.setRecord(this.record);
            }
            this.getForm().findField('name').focus(false,350);
        }, this);

        this.on('beforedestroy', function(){
            this.record.store.un('write', this.onBSStoreWrite, this);

            if (this.childs.length){
                Ext.each(this.childs, function(form){
                    form.destroy();
                }, this);
            }
        },this);
    },

    onBSStoreWrite: function(store, action, result, res, rs){
        if (action == 'create'){
            this.setBaseService(rs.data.id);
        } else {
            this.saveChilds();
        }
        this.origTitle = rs.data.short_name;
        this.cleanForm();
        if (this.savedCount >= this.countToSave) {
            this.onSaveComplete();
        }
        if (!this.closing){
            this.dataIsLoading = true;
            this.getForm().loadRecord(rs);
            this.dataIsLoading = false;
            this.cleanForm();
        }
    },

    onSave: function(){
        if (!this.record){
            console.log('Не задана запись base_service');
            return false;
        }
        if (this.isDirty()){
            // Количество сохраненных форм.
            // Необходимо для определения факта завершения процедуры сохранения
            this.savedCount = 0;

            var f = this.getForm();
            if (f.isValid()){
                if(f.isDirty()) {
                    f.updateRecord(this.record);
                    this.record.store.save();
                    this.setTitle(this.record.data.short_name);
                } else {
                    this.savedCount += 1;
                    this.saveChilds();
                }
            } else {
                this.fireEvent('activeme',this);
                Ext.Msg.alert('Внимание!','Заполните необходимые поля формы!');
            }
        } else {
            this.onSaveComplete();
        }

    },

    isDirty: function(){
        this.countToSave = 0; //Сколько форм должно быть сохранено
        var isDirty = false;
        if (this.getForm().isDirty()){
            console.log('BaseForm isDirty');
            return true;
        }
        Ext.each(this.childs, function(f){
            if (f.onSave && f.isDirty){
                if (f.isDirty()){
                    console.log(f.title + ' isDirty');
                    this.countToSave += 1;
                    isDirty = true;
                }
            }
        }, this);
        return isDirty;
    },

    saveChilds: function(){
        Ext.each(this.childs, function(f){
            if (f.onSave){
                f.onSave();
            }
        }, this);
    },

    onSaveComplete: function(){
        if (this.fn){
            Ext.callback(this.fn, this.scope || window, [this.record]);
        }
        this.fireEvent('savecomplete', this);
        if (this.closing){
            this.onClose();
        } else {

        }
    },

    setRecord: function(record){
        this.dataIsLoading = true;
        var form = this.getForm();
        form.loadRecord(record);
        this.record = record;
        if (record.data.id){
            form.items.each(function(f){
                if (f.getValue){
                    f.originalValue = f.getValue();
                }
            });
        }
        if (record.data.type !== 'group') {
            this.openExtServiceForm(record);
            if (record.data.type == 'lab') {
                this.openLabServiceForm();
            }
        }
        this.dataIsLoading = false;

    },

    openExtServiceForm: function(bsRecord, activeme){
        this.esForm = new App.servicemanager.ExtServicePanel({
            bsRecord: bsRecord,
            title: 'Организации',
            listeners: {
                scope: this,
                aftersave: function(){
                    this.savedCount += 1;
                    if (this.savedCount >= this.countToSave) {
                        this.onSaveComplete();
                    }
                },
                saveform: this.onSave,
                closeform: this.closeForm

            }
        });
        this.childs.push(this.esForm);
        this.fireEvent('openform', this.esForm);
        if (activeme) {
            this.fireEvent('activeme', this.esForm);
        }
    },

    openLabServiceForm: function(activeme){
        this.lsForm = new App.servicemanager.LabServiceForm({
            bsRecord: this.record,
            title: 'Лабораторная услуга',
            listeners: {
                scope: this,
                aftersave: function(){
                    this.savedCount += 1;
                    if (this.savedCount >= this.countToSave) {
                        this.onSaveComplete();
                    }
                },
                saveform: this.onSave,
                closeform: this.closeForm
            }
        });
        this.childs.push(this.lsForm);
        this.fireEvent('openform', this.lsForm);
        if (activeme) {
            this.fireEvent('activeme', this.lsForm);
        }
    },

    closeForm: function(afterCloseFn,afterCloseScope){
        this.closing = true;
        this.afterCloseFn = afterCloseFn;
        this.afterCloseScope = afterCloseScope;
        if (this.isDirty()) {
            this.fireEvent('activeme',this);
            Ext.MessageBox.show({
                title:'Подтверждение',
                closable:false,
                modal:true,
                buttons:{
                    cancel:'Отменить закрытие',
                    yes:'Сохранить и закрыть',
                    no:'Не сохранять'
                },
                msg:'Услуга не сохранена!',
                fn:function(btn){
                    if(btn!='cancel') {
                        if(btn=='yes') {
                            this.onSave();
                        } else if (btn=='no') {
                            this.onClose();
                        }
                    } else {
                        this.closing = false;
                    }
                },
                scope:this
            });
            // Ext.Msg.alert('Были внесены изменения', 'Сохраните или закройте форму');
        } else {
            this.onClose();
        }
    },

    onClose: function(){
        Ext.each(this.childs, function(form){
            form.destroy();
        }, this);
        if (this.afterCloseFn){
            this.afterCloseFn(this.afterCloseScope);
        } else {
            this.fireEvent('closeform', this);
        }
        this.fireEvent('serviceclosed', this);
    },

    cleanForm: function(){
        var form = this.getForm();
        form.items.each(function(f){
            if (f.getValue){
                f.originalValue = f.getValue();
            }
        });
        this.setTitle(this.origTitle);
    },

    setBaseService: function(bsId){
        Ext.each(this.childs, function(f){
            if (f.setBaseService){
                f.setBaseService(bsId);
            }
        }, this);
    },

    markDirty: function(){
        if(this.dataIsLoading === false){
            this.setTitle(this.origTitle + '*');
        }
    }

});
