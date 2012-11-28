Ext.ns('App', 'App.servicemanager');

App.servicemanager.ExtServicePanel = Ext.extend(Ext.Panel,{

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

        this.medStateStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('state','medstate'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'name'}
                ]
        });

        this.grid = new App.servicemanager.ExtServiceGrid({
            // baseServiceId: this.bsRecord.data.id,
            // width: 200,
            region: 'center'
        });

        this.contentPanel = new Ext.Panel({
            width:700,
            layout: 'fit',
            items:[],
            region:'east',
            margins: '0 5 0 0'
        });

        config = {
            layout:'border',
            items:[this.grid,this.contentPanel],
            bbar:[this.saveBtn, this.closeBtn]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.ExtServicePanel.superclass.initComponent.apply(this, arguments);

        this.grid.on('afterrender', function(){
            this.medStateStore.load({callback: function(records){
                if (!this.bsRecord) return false;
                if (this.bsRecord.data.id){
                    this.grid.store.setBaseParam('base_service', this.bsRecord.data.id);
                    this.grid.store.load({callback: function(records){
                        if (records.length){
                            this.grid.getSelectionModel().selectFirstRow();
                            this.openExtService(records[0]);
                        }
                    }, scope: this});
                } else {
                    if (records.length == 1){
                        this.addExtService(stateRecord);
                        this.grid.addBtn.disable();
                    }
                }
            }, scope: this});
        }, this);

        this.grid.on('openextservice',this.openExtService, this);

        this.grid.on('addextservice',this.showStateWin, this);

        this.grid.store.on('write', function(){
            this.fireEvent('aftersave');
        }, this);
    },

    showStateWin: function(){
        this.medStateStore.clearFilter();
        var existing = [];
        this.grid.store.each(function(serv){
            existing.push(App.uriToId(serv.data.state));
        }, this);
        var in_array;
        this.medStateStore.filterBy(function(record,id){
            in_array = false;
            Ext.each(existing,function(st){
                if (record.data.id == st) in_array = true;
            });
            return !in_array;
        });
        if(this.medStateStore.data.length > 1){
            this.stateWin = new App.choices.StateChoiceWindow({
                height: 300,
                width: 300,
                store: this.medStateStore,
                fn: this.addExtService,
                scope:this
            });
            this.stateWin.show();
        } else {
            if (this.medStateStore.data.length){
                var stateRecord = this.medStateStore.data.items[0];
                this.addExtService(stateRecord);
                this.grid.addBtn.disable();
            }
        }

    },

    openExtService: function(record){
        if (!this.isValid()){
            Ext.Msg.alert('Внимание!','Заполните все необходимые поля формы');
            return false;
        }
        if (this.extServiceForm){
            var p = this.extServiceForm.staffSelector.getValue();
            this.extServiceForm.destroy();
        }
        this.extServiceForm = new App.servicemanager.ExtServiceForm({
            record: record,
            title: record.data.state_name
        });
        this.contentPanel.add(this.extServiceForm);
        this.record = record;
        this.doLayout();
    },

    addExtService: function(stateRecord){
        if (this.stateWin) this.stateWin.destroy();
        var eRecord = new this.grid.store.recordType();
        eRecord.set('base_service',this.bsRecord.data.resource_uri);
        eRecord.set('state',stateRecord.data.resource_uri);
        eRecord.set('state_name',stateRecord.data.name);
        this.grid.store.add(eRecord);
        this.grid.getSelectionModel().selectRecords([eRecord]);
        this.openExtService(eRecord);
    },

    setBSRecord: function(){
        if(this.bsRecord && this.bsRecord.data.id){

        }

    },

    isValid: function(){
        var isValid = true;
        if (this.extServiceForm){
            isValid = this.extServiceForm.getForm().isValid();
        }
        return isValid;
    },

    setBaseService: function(bsUri){
        if (this.extServiceForm){
            var esForm = this.extServiceForm.getForm();
            esForm.findField('base_service').setValue(bsUri);
        }
        this.grid.store.each(function(rec){
            rec.set('base_service', bsUri);
        }, this);
        this.onSave();
    },

    onSave: function(){
        this.grid.store.save();
    },

    isDirty: function(){
        var records = this.grid.store.getModifiedRecords();
        if (records.length > 0){
        }
        return records.length > 0;
    },

    onSaveBtnClick: function(){
        this.fireEvent('saveform');
    },

    onCloseBtnClick: function(){
        this.fireEvent('closeform');
    }
});
