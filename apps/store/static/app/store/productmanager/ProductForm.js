Ext.ns('App', 'App.productmanager');

App.productmanager.ProductForm = Ext.extend(Ext.form.FormPanel,{

    initComponent:function(){

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

        this.itemsSet = [{
            xtype:'hidden',
            name:'parent'
        }];

        this.unitCombo = new Ext.form.LazyComboBox({
            fieldLabel:'Единица измерения',
            name: 'unit',
            anchor:'98%',
            hideTrigger:true,
            displayField: 'name',
            valueField: 'resource_uri',
            listeners:{
                'render': function(f){
                    var el = f.getEl();
                    el.on('click',this.onUnitChoice.createDelegate(this, []),this);
                },
                forceload: function(value){
                    if (this.dataIsLoading === false){
                        this.updateRecord();
                    }
                },
                scope:this
            },
            onTriggerClick:this.onUnitChoice.createDelegate(this, [])
        });

        if (this.record.data.is_group){
            this.itemsSet.push(
            {
                xtype: 'textfield',
                width: 400,
                value: '',
                allowBlank: false,
                fieldLabel: 'Наименование',
                name:'name'
            });
        } else {
            this.itemsSet = this.itemsSet.concat([
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
                            var full_name = this.getForm().findField('full_name');
                            if (full_name && !full_name.getValue() && c.getValue()){
                                full_name.setValue(c.getValue());
                            }
                        }, this);
                    }
                }

            },{
                xtype:'textfield',
                width: 400,
                value: '',
                allowBlank: false,
                fieldLabel: 'Полное наименование',
                name:'full_name'
            },
            {
                xtype:'textfield',
                width: 100,
                value: '',
                allowBlank: true,
                fieldLabel: 'Код (создаётся автоматически)',
                name:'code'
            },
            this.unitCombo,
            {
                xtype:'numberfield',
                width: 100,
                value: 0,
                allowBlank: true,
                minValue:0,
                fieldLabel: 'Время доставки(дни)',
                name:'delivery_period'
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
        App.productmanager.ProductForm.superclass.initComponent.apply(this, arguments);

        this.record.store.on('write', this.onItemWrite, this);

        this.on('afterrender', function(form){
            this.origTitle = this.title;
            if (this.record){
                this.setRecord(this.record);
            }
            this.getForm().findField('name').focus(false,350);
        }, this);

        this.on('beforedestroy', function(){
            this.record.store.un('write', this.onItemWrite, this);
        },this);
    },

    onUnitChoice: function() {
        var unitWindow = new App.choices.UnitChoiceWindow({
            title:'Единицы измерения',
            scope:this,
            fn:function(record){
                if (!record){
                    return 0;
                }
                this.unitCombo.forceValue(record.data.resource_uri);
                this.markDirty();
                unitWindow.close();
            }
         });
        unitWindow.show();
    },

    onItemWrite: function(store, action, result, res, rs){
        this.origTitle = rs.data.name;
        this.cleanForm();
        this.onSaveComplete();
        if (!this.closing){
            this.dataIsLoading = true;
            this.getForm().loadRecord(rs);
            this.dataIsLoading = false;
            this.cleanForm();
        }
    },

    onSave: function(){
        if (!this.record){
            console.log('Не задана запись product');
            return false;
        }
        var f = this.getForm();
        if (f.isValid()){
            if(f.isDirty()) {
                f.updateRecord(this.record);
                this.record.store.save();
                this.setTitle(this.record.data.name);
            }
            this.onSaveComplete();
        } else {
            this.fireEvent('activeme',this);
            Ext.Msg.alert('Внимание!','Заполните необходимые поля формы!');
        }
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
        this.dataIsLoading = false;

    },

    closeForm: function(afterCloseFn,afterCloseScope){
        this.closing = true;
        this.afterCloseFn = afterCloseFn;
        this.afterCloseScope = afterCloseScope;
        if (this.getForm().isDirty()) {
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
                msg:'Материал не сохранен!',
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
        this.fireEvent('itemclosed', this);
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

    markDirty: function(){
        if(this.dataIsLoading === false){
            this.setTitle(this.origTitle + '*');
        }
    }

});
