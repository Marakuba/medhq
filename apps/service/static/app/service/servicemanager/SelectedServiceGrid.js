Ext.ns('App.servicemanager');



App.servicemanager.SelectedServiceGrid = Ext.extend(Ext.grid.GridPanel, {


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
            text: 'Убрать из выделенных',
            handler:this.onDeselect.createDelegate(this,[]),
            iconCls:'silk-cancel',
            disabled: true
        });

        var config = {
            title:'Выделенные услуги',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
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
            },
            this.deselectBtn],
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

    doAction: function(fn){
        this.fireEvent('doaction', fn, this);
    },

    onStaffCoice: function(scopeForm){
        var staffWin = new App.choices.StaffChoiceWindow({
            fn: function(staffRecord){
                staffWin.close();
                var params = {};
                params['records'] = this.records;
                params['staff'] = staffRecord.data.id;
                App.direct.service.updateStaffInfo(params, function(res,e){
                    Ext.Msg.alert('Уведомление', res.data.text);
                }, this);
            },
            scope: scopeForm
        });
        staffWin.show();
    },

    loadRecords: function(records){
        this.records = records;
        this.store.loadData(records);
        this.setBtnsDisabled(true);
    },

    onDeselect: function(){
        var rec = this.getSelectionModel().getSelected();
        if (rec){
            this.fireEvent('deselectnode', rec);
        }

    }

});
