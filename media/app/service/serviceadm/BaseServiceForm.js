Ext.ns('App', 'App.serviceadm');

App.serviceadm.BaseServiceForm = Ext.extend(Ext.form.FormPanel,{

    initComponent:function(){
        this.childs = [];

        this.saveBtn = new Ext.Button({
            text: 'Сохранить',
            handler: this.onSave.createDelegate(this,[]),
            scope:this
        });

        this.closeBtn = new Ext.Button({
            text: 'Закрыть',
            handler: this.onClose.createDelegate(this,[]),
            scope:this
        });

        this.ownStateStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.getApiUrl('state','ownstate'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'name'}
                ]
        });

        this.extServiceGrid = new App.serviceadm.ExtServiceGrid({
            baseServiceId: this.record.data.id,
            height:400
        });

        this.extServiceGrid.on('openextservice',this.openExtService, this);

        this.extServiceGrid.on('addextservice',this.showStateWin, this);

        this.extServiceGrid.on('afterrender',function(){
            if (!this.record || this.record.data.type == 'group') return false;
            this.ownStateStore.load({callback: function(records){
                if (records.length === 0 || this.record.data.id) return false;
                if (records.length == 1) {
                    this.addExtService(records[0]);
                } else {
                    this.showStateWin();
                }

            }, scope: this});
        }, this);

        this.materialCB = new Ext.form.LazyComboBox({
            fieldLabel:'Материал',
            allowBlank:true,
            displayField: 'name',
            anchor:'50%',
            store: new Ext.data.RESTStore({
                autoSave: false,
                autoLoad : false,
                apiUrl : App.getApiUrl('service','material'),
                model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'name'}
                ],
                baseParams:{
                    format:'json'
                }
            }),
            name:'material',
            editable:false,
            typeAhead:true,
            selectOnFocus:false,
            valueField: 'resource_uri',
            listeners:  {
                'select':function(combo, record, index){
                },
                scope:this
            }
        });

        this.typeCB = new Ext.form.ComboBox({
            fieldLabel: 'Тип',
            disabled: this.record && this.record.data['id'],
            name: 'type',
            store: new Ext.data.ArrayStore({
                fields: ['id','title'],
                data: bs_types
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
            value: 'cons'
        });

        this.itemsSet = [{
            xtype: 'textfield',
            width: 400,
            value: '',
            allowBlank: false,
            fieldLabel: 'Наименование',
            name:'name'

        },{
            xtype:'hidden',
            name:'parent'
        },{
            xtype:'hidden',
            name:'version'
        }];

        if (this.record.data.type == 'group'){
            this.itemsSet.push({
                xtype:'hidden',
                name:'type'
            });
        } else {
            this.itemsSet = this.itemsSet.concat([{
                xtype:'textfield',
                width: 400,
                value: '',
                allowBlank: false,
                fieldLabel: 'Краткое наименование',
                name:'short_name'
            },
            this.typeCB,
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
            },
            this.extServiceGrid]);
        }

        config = {
            layout: 'form',
            border: false,
            autoScroll: true,
            items: this.itemsSet,
            bbar:[this.saveBtn, this.closeBtn]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.serviceadm.BaseServiceForm.superclass.initComponent.apply(this, arguments);

        this.record.store.on('write', function(store, action, result, res, rs){
            this.saving = false;
            if(this.afterSaveFn){
                this.afterSaveFn(rs,this.scopeForm);
            }
            this.cleanForm();
        }, this);

        this.on('afterrender', function(form){
            if (this.record){
                this.setRecord(this.record);
            }
            this.getForm().findField('name').focus(false,350);
        }, this);

        this.on('beforedestroy', function(){
            if (this.childs.length){
                Ext.each(this.childs, function(form){
                    form.destroy();
                }, this);
            }
        },this);
    },

    onSave: function(afterSaveFn,scopeForm){
        var f = this.getForm();
        if (f.isValid()){
            this.afterSaveFn = afterSaveFn;
            this.scopeForm = scopeForm;
            if(f.isDirty()) {
                this.saving = true;
            }
            f.updateRecord(this.record);
            this.record.store.save();
            this.setTitle(this.record.data.short_name);
            if (this.fn){
                Ext.callback(this.fn, this.scope || window, [this.record]);
            }
        } else {
            this.fireEvent('activeme',this);
            Ext.Msg.alert('Внимание!','Заполните необходимые поля формы!');
        }
    },

    setRecord: function(record){
        if (record.data.type != 'group' && record.data['id']){
            this.extServiceGrid.setBaseService(record.data.id);
        }
        var form = this.getForm();
        form.loadRecord(record);
        form.items.each(function(f){
            if (f.getValue){
                f.originalValue = f.getValue();
            }
        });
    },

    closeForm: function(afterCloseFn,scopeForm){
        if (this.getForm().isDirty()) {
            this.fireEvent('activeme',this);
            Ext.Msg.alert('Были внесены изменения', 'Сохраните или закройте форму');
        } else {
            this.onClose(afterCloseFn,scopeForm);
        }
    },

    onClose: function(afterCloseFn,scopeForm){
        if (!this.savingProcess){
            var d;
            Ext.each(this.childs, function(form){
                d = form.getForm().isDirty();
                if (d) {
                    this.fireEvent('activeme',form);
                    Ext.Msg.alert('Были внесены изменения', 'Сохраните или закройте форму');
                    return false;
                }
            }, this);
            if(!d){
                if(afterCloseFn){
                    afterCloseFn(scopeForm);
                }
                this.destroy();
            }
        } else {
            Ext.Msg.alert('Идет процесс сохранения формы', 'Повторите действие позже');
        }

    },

    showStateWin: function(){
        this.ownStateStore.clearFilter();
        var existing = [];
        this.extServiceGrid.store.each(function(serv){
            existing.push(App.uriToId(serv.data.state));
        }, this);
        var in_array;
        this.ownStateStore.filterBy(function(record,id){
            in_array = false;
            Ext.each(existing,function(st){
                if (record.data.id == st) in_array = true;
            });
            return !in_array;
        });
        this.stateWin = new App.choices.StateChoiceWindow({
            height: 300,
            width: 300,
            store: this.ownStateStore,
            fn: this.addExtService,
            scope:this
        });
        this.stateWin.show();
    },

    openExtService: function(record){
        var extServForm = new App.serviceadm.ExtServiceForm({
            record: record,
            title: this.title + ': ' + record.data.state_name,
            store: this.extServiceGrid.store,
            parentForm: this,
            listeners: {
                scope: this,
                closeform: function(form){
                    var currChild;
                    var idx = this.childs.indexOf(form);
                    if(idx!=-1) this.childs.splice(idx, 1);
                },
                activeme: function(form){
                    this.fireEvent('activeme',form);
                }
            }
        });
        this.childs.push(extServForm);
        this.fireEvent('openextservice', extServForm);
    },

    addExtService: function(stateRecord){
        if (this.stateWin) this.stateWin.destroy();
        var eRecord = new this.extServiceGrid.store.recordType();
        eRecord.set('state',stateRecord.data.resource_uri);
        eRecord.set('state_name',stateRecord.data.name);
        this.extServiceGrid.store.add(eRecord);
        this.openExtService(eRecord);
    },

    cleanForm: function(){
        var form = this.getForm();
        form.items.each(function(f){
            if (f.getValue){
                f.originalValue = f.getValue();
            }
        });
    }

});
