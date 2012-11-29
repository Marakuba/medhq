Ext.ns('App.servicemanager');



App.servicemanager.SelectedServiceGrid = Ext.extend(Ext.grid.GridPanel, {

    origTitle: 'Отмеченные услуги',

    initComponent : function() {

        this.store = this.store || new Ext.data.ArrayStore({
            fields: ['id','code','name']
        });

        this.columns =  [
            {
                header: "Код",
                width: 10,
                sortable: false,
                dataIndex: 'code'
            },
            {
                header: "Наименование",
                width: 100,
                sortable: false,
                dataIndex: 'name'
            }
        ];

        this.deselectBtn = new Ext.Button({
            text: 'Убрать из отмеченных',
            handler: function(){
                var records = this.getSelectionModel().getSelections();
                this.fireEvent('deselectnode', records);
            },
            scope: this,
            iconCls:'silk-cancel',
            disabled: true
        });

        this.deselectAllBtn = new Ext.Button({
            text: 'Очистить таблицу',
            handler: function(){
                var records = this.store.data.items;
                this.fireEvent('deselectnode', records);
            },
            scope: this,
            iconCls:'silk-cancel'
        });

        var config = {
            title: this.title || this.origTitle,
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : false,
                listeners: {
                    scope: this,
                    rowselect: function(sm, ind, rec){
                        this.setBtnsDisabled(false);
                    },
                    rowdeselect: function(sm, ind, rec){
                        this.setBtnsDisabled(true);
                    }
                }
            }),
            tbar:[{
                iconCls:'silk-pencil',
                text:'Добавить услуги врачу',
                handler:this.doAction.createDelegate(this,[this.onStaffCoice])
            },{
                iconCls:'silk-pencil',
                text:'Активировать',
                handler:this.doAction.createDelegate(this,[this.setActive, true])
            },{
                iconCls:'silk-pencil',
                text:'Деактивировать',
                handler:this.doAction.createDelegate(this,[this.setActive, false])
            },
            this.deselectBtn, this.deselectAllBtn],
            viewConfig : {
                forceFit : true
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.SelectedServiceGrid.superclass.initComponent.apply(this, arguments);

    },

    setBtnsDisabled: function(status){
        this.deselectBtn.setDisabled(status);
    },

    onChange: function(){
        var record = this.getSelectionModel().getSelected();
        if (record) {
            this.fireEvent('openbaseservice',record);
        }
    },

    doAction: function(fn, opt){
        this.fireEvent('doaction', fn, this, opt);
    },

    onStaffCoice: function(scopeForm){
        var staffWin = new App.choices.StaffChoiceWindow({
            fn: function(staffRecord){
                staffWin.close();
                var params = {};
                var records = _.map(this.store.data.items, function(rec){
                    return rec.data.id;
                });
                params['records'] = records;
                params['staff'] = staffRecord.data.id;
                App.direct.service.updateStaffInfo(params, function(res,e){
                    Ext.Msg.alert('Уведомление', res.data.text);
                }, this);
            },
            scope: scopeForm
        });
        staffWin.show();
    },

    setActive: function(scopeForm, opt){
        var params = {};
        var records = _.map(scopeForm.store.data.items, function(rec){
                    return rec.data.id;
                });
        params['records'] = records;
        params['status'] = opt;
        App.direct.service.setActive(params, function(res,e){
            Ext.Msg.alert('Уведомление', res.data.text);
        }, this);
    },

    loadRecords: function(records){
        this.store.loadData(records);
        this.setBtnsDisabled(true);
        this.setTitle(this.origTitle + ' (' + records.length + ')');
    },

    removeRecords: function(records){
        if (records.length == this.store.data.length){
            this.store.removeAll();
        } else {
            this.store.remove(records);
        }
        var len = this.store.data.length;
        if (len){
            this.setTitle(this.origTitle + ' (' + len + ')');
        } else {
            this.destroy();
        }

    }

});
