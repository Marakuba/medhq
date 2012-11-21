Ext.ns('App', 'App.serviceadm', 'Ext.ux');

App.serviceadm.ExtServiceForm = Ext.extend(Ext.form.FormPanel,{

    initComponent:function(){

        this.saveBtn = new Ext.Button({
            text: 'Сохранить',
            handler: this.onSave.createDelegate(this,[]),
            scope:this
        });

        this.closeBtn = new Ext.Button({
            text: 'Закрыть',
            handler: function(){
                if (!this.savingProcess){
                    this.fireEvent('closeform',this);
                    this.destroy();
                } else {
                    Ext.Msg.alert('Пожалуйста, подождите...','Идет процесс сохранения формы');
                }
            },
            scope:this
        });

        this.ownStateStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.getApiUrl('state','ownstate'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'state'},
                    {name: 'name'}
                ]
        });

        this.ownStateCombo = new Ext.form.LazyClearableComboBox({
            fieldLabel:'Учреждение',
            name: 'staff__department',
            anchor:'98%',
            hideTrigger:false,
            store:this.departmentStore,
            displayField: 'name',
            valueField: 'resource_uri'
        });

        this.branchStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : true,
            apiUrl : App.getApiUrl('state','department'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'state'},
                    {name: 'name'}
                ]
        });

        this.branchCombo = new Ext.form.LazyClearableComboBox({
            fieldLabel:'Учреждение',
            name: 'staff__department',
            anchor:'98%',
            hideTrigger:false,
            store:this.departmentStore,
            displayField: 'name',
            valueField: 'resource_uri'

        });

        this.staffStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.getApiUrl('staff','position'),
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

        this.multiselectDataStore = new Ext.data.ArrayStore({
            data: [[123,'One Hundred Twenty Three'],
                ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
                ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine']],
            fields: ['value','text'],
            sortInfo: {
                field: 'value',
                direction: 'ASC'
            }
        });

        this.staffSelector = new Ext.ux.form.ItemSelector({
            name: 'staff',
            fieldLabel: 'Кем выполняется',
            imagePath: MEDIA_URL + 'extjs/ux/images/',
            multiselects: [{
                // autoScroll: true,
                width: 250,
                height: 200,
                store: this.staffStore,
                displayField: 'name',
                valueField: 'resource_uri'
            },{
                width: 250,
                height: 200,
                store: this.staff2Store,
                displayField: 'name',
                valueField: 'resource_uri',
                tbar:[{
                        text: 'clear',
                        handler:function(){
                            simple_form.getForm().findField('itemselector').reset();
                        }
                    }]
            }]
        });

        config = {
            layout: 'form',
            border: false,
            items: [{
                xtype: 'hidden',
                name: 'base_service',
                allowBlank: false
            },{
                xtype:'checkbox',
                name:'is_active',
                checked:true,
                boxLabel:'Услуга активна'
            },{
                xtype:'checkbox',
                name:'is_manual',
                boxLabel:'Выполняется вручную',
                checked:false
            },{
                xtype:'textfield',
                name:'code',
                fieldLabel:'Внешний код',
                width:200
            },
            this.staffSelector
            ],
            bbar:[this.saveBtn, this.closeBtn]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.serviceadm.ExtServiceForm.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(form){
            if (this.record){
                // console.log(this.record);
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

    onSave: function(){
        var bsField = this.getForm().findField('base_service');
        var bs = bsField.getValue();
        var bsStore = this.parentForm.record.store;
        if (!bs){
            if (this.parentForm.record.data.resource_uri){
                bsField.setValue(this.parentForm.record.data.resource_uri);
                this.saveForm();
            } else {
                this.parentForm.onSave(function(record,scope){
                    bsField.setValue(record.data.resource_uri);
                    scope.setTitle(record.data.short_name + ': ' + scope.record.data.state_name);
                    scope.saveForm();
                }, this);
            }
        } else {
            this.saveForm();
        }

        console.log(this.staffSelector.getValue());
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
        this.staffStore.load({callback: function(){
            var form = this.getForm();
            form.loadRecord(record);
            form.items.each(function(f){
                if (f.getValue){
                    f.originalValue = f.getValue();
                }
            });
        }, scope: this});

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
