Ext.ns('App', 'App.servicemanager', 'Ext.ux');

App.servicemanager.ItemSelector = Ext.extend(Ext.ux.form.ItemSelector, {
    initComponent: function(){

        config = {};

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.ItemSelector.superclass.initComponent.call(this);
    },

    onRender: function(ct, position){
        App.servicemanager.ItemSelector.superclass.onRender.call(this, ct, position);
        this.fromMultiselect.fs.setAutoScroll(true);
        this.toMultiselect.fs.setAutoScroll(true);
        this.doLayout();
    },

    getValue : function() {
        var v = this.hiddenField.dom.value.split(',');
        if (v.length && v[0] !== ''){
            return v;
        } else {
            return [];
        }
    },

    setValue: function(values){
        this.dataIsLoading = true;
        var fromStore = this.fromMultiselect.view.store;
        var toStore = this.toMultiselect.view.store;
        Ext.each(values,function(v){
            var idx = fromStore.find(this.fromMultiselect.valueField,v);
            if(idx != -1){
                var record = fromStore.getAt(idx);
                toStore.add(record);
                fromStore.remove(record);
            } else {
                console.log('Значение не найдено: ' + v);
            }
        }, this);
        this.dataIsLoading = false;
    },

    valueChanged: function(store) {
        if (!this.dataIsLoading){
            var record = null;
            var values = [];
            for (var i=0; i<store.getCount(); i++) {
                record = store.getAt(i);
                values.push(record.get(this.toMultiselect.valueField));
            }
            this.hiddenField.dom.value = values.join(this.delimiter);
            this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
        }
    }
});

App.servicemanager.ExtServiceForm = Ext.extend(Ext.form.FormPanel,{

    initComponent:function(){

        this.branchStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('state','medstate'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'name'}
                ]
        });

        this.branch2Store = new Ext.data.ArrayStore({
            fields: ['resource_uri','name']
        });

        this.branchSelector = new App.servicemanager.ItemSelector({
            name: 'branches',
            fieldLabel: 'Филиалы',
            imagePath: WebApp.MEDIA_URL + 'extjs/ux/images/',
            multiselects: [{
                // autoScroll: true,
                legend: 'Доступные',
                width: 250,
                height: 200,
                store: this.branchStore,
                displayField: 'name',
                valueField: 'resource_uri',
                containerScroll: true
            },{
                legend: 'Выбранные',
                width: 250,
                height: 200,
                containerScroll: true,
                store: this.branch2Store,
                displayField: 'name',
                valueField: 'resource_uri',
                tbar:[{
                    text: 'Очистить',
                    handler:function(){
                        simple_form.getForm().findField('itemselector').reset();
                    }
                    }]
            }],
            listeners: {
                scope: this,
                change: function() {
                    if (this.dataIsLoading === false){
                        this.updateRecord();
                    }
                }
            }
        });

        this.staffStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('staff','position'),
            model: [
                {name: 'resource_uri'},
                {name: 'name'}
            ],
            sortInfo: {
                field: 'name',
                direction: 'ASC'
            }
        });

        this.staff2Store = new Ext.data.ArrayStore({
            fields: ['resource_uri','name']
        });

        this.staffSelector = new App.servicemanager.ItemSelector({
            name: 'staff',
            fieldLabel: 'Кем выполняется',
            imagePath: WebApp.MEDIA_URL + 'extjs/ux/images/',
            multiselects: [{
                // autoScroll: true,
                legend: 'Доступные',
                width: 250,
                height: 200,
                store: this.staffStore,
                displayField: 'name',
                valueField: 'resource_uri',
                containerScroll: true
            },{
                legend: 'Выбранные',
                width: 250,
                height: 200,
                containerScroll: true,
                store: this.staff2Store,
                displayField: 'name',
                valueField: 'resource_uri',
                tbar:[{
                    text: 'Очистить',
                    handler:function(){
                        simple_form.getForm().findField('itemselector').reset();
                    }
                    }]
            }],
            listeners: {
                scope: this,
                change: function() {
                    if (this.dataIsLoading === false){
                        this.updateRecord();
                    }
                }
            }
        });

        this.tubeStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            baseParams: {
                format: 'json'
            },
            apiUrl : App.utils.getApiUrl('lab','tube'),
            model: [
                {name: 'resource_uri'},
                {name: 'name'},
                {name: 'id'}
            ]
        });

        this.tubeCombo = new Ext.form.LazyComboBox({
            fieldLabel:'Пробирка',
            name: 'tube',
            anchor:'98%',
            hideTrigger:true,
            store:this.tubeStore,
            displayField: 'name',
            // valueField: 'resource_uri',
            listeners:{
                'render': function(f){
                    var el = f.getEl();
                    el.on('click',this.onTubeChoice.createDelegate(this, []),this);
                },
                forceload: function(value){
                    if (this.dataIsLoading === false){
                        this.updateRecord();
                    }
                },
                scope:this
            },
            onTriggerClick:this.onTubeChoice.createDelegate(this, [])
        });

        this.profileStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab','analysisprofile'),
            model: [
                {name: 'resource_uri'},
                {name: 'name'},
                {name: 'id'}
            ]
        });

        this.profileCombo = new Ext.form.LazyComboBox({
            fieldLabel:'Профиль',
            allowBlank:true,
            displayField: 'name',
            anchor:'100%',
            store: this.profileStore,
            name:'base_profile',
            editable:false,
            typeAhead:true,
            selectOnFocus:false,
            listeners:  {
                'select':function(combo, record, index){
                    this.updateRecord();
                },
                scope:this
            }
        });

        config = {
            layout: 'form',
            border: false,
            autoScroll: true,
            labelWidth: 150,
            items: [{
                xtype: 'hidden',
                name: 'base_service',
                allowBlank: false
            },{
                xtype: 'checkbox',
                name: 'is_active',
                checked: false,
                boxLabel: 'Услуга активна',
                listeners: {
                    scope: this,
                    check: function() {
                        if (this.dataIsLoading === false){
                            this.updateRecord();
                        }
                    }

                }
            },{
                xtype:'checkbox',
                name:'is_manual',
                boxLabel:'Выполняется вручную',
                checked:false,
                listeners: {
                    scope:this,
                    check: function() {
                        if (this.dataIsLoading === false){
                            this.updateRecord();
                        }
                    }
                }
            },{
                xtype:'textfield',
                name:'code',
                fieldLabel:'Внешний код',
                width:200,
                listeners: {
                    scope:this,
                    change: function(c) {
                        if (this.dataIsLoading === false){
                            this.updateRecord();
                        }
                    }
                }
            },
            this.tubeCombo,
            {
                xtype:'numberfield',
                name:'tube_count',
                fieldLabel:'Количество пробирок',
                width:200,
                listeners: {
                    scope:this,
                    change: function(c) {
                        if (this.dataIsLoading === false){
                            this.updateRecord();
                        }
                    }
                }
            },
            this.profileCombo,
            this.branchSelector,
            this.staffSelector
            ]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.ExtServiceForm.superclass.initComponent.apply(this, arguments);

        this.staffSelector.on('afterrender', function(form){
            if (this.record){
                this.setRecord(this.record);
            }
        }, this);

        this.record.store.on('write', function(store, action, result, res, rs){
            this.savingProcess = false;
            this.cleanForm();
            if (this.fn){
                Ext.callback(this.fn, this.scope || window, [rs]);
            }
        }, this);
    },

    saveForm: function(){
        var f = this.getForm();
        if(f.isValid()){
            f.updateRecord(this.record);
            if(this.record.dirty) {
                this.savingProcess = true;
            }
            this.record.store.save();
        } else {
            this.fireEvent('activeme',this);
            Ext.Msg.alert('Внимание!','Заполните необходимые поля формы!');
        }
    },

    setRecord: function(record){
        this.dataIsLoading = true;
        this.staffStore.load({callback: function(){
            this.branchStore.load({callback: function(){
                var form = this.getForm();
                form.loadRecord(record);
                if (record.data.id){
                    this.cleanForm();
                }
                this.dataIsLoading = false;
            }, scope: this});
        }, scope: this});
    },

    cleanForm: function(){
        var form = this.getForm();
        form.items.each(function(f){
            if (f.getValue){
                f.originalValue = f.getValue();
            }
        });
    },

    updateRecord: function(){
        if (!this.record) return false;
        this.getForm().updateRecord(this.record);
        this.fireEvent('formchanged', this);
    },

    onTubeChoice: function() {
        var tubeWindow = new App.choices.TubeChoiceWindow({
            title:'Пробирки',
            scope:this,
            fn:function(record){
                if (!record){
                    return 0;
                }
                this.tubeCombo.forceValue(record.data.resource_uri);
                tubeWindow.close();
                var tubeCountField = this.getForm().findField('tube_count');
                if (tubeCountField.getValue()===''){
                    tubeCountField.setValue(1);
                }
            }
         });
        tubeWindow.show();
    },

    setBaseService: function(bsId){
        this.baseService = App.utils.getApiUrl('service', 'baseservice', bsId);
        this.getForm().findField('base_service').setValue(this.baseService);
    }

});
