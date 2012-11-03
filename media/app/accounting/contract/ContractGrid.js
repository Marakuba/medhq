Ext.ns('App.accounting');


App.accounting.ContractGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent: function() {

        this.addContractBtn = new Ext.Button({
            iconCls:'silk-add',
            text:'Добавить договор',
            handler:this.onAddContract.createDelegate(this),
            scope:this
        });

        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.getApiUrl('acc_contract'),
            model: App.models.AccountingContract
        });

        this.columns = [{
            header: "№",
            dataIndex: 'number',
            width:15
        },{
            header: "Дата",
            dataIndex: 'on_date',
            renderer:Ext.util.Format.dateRenderer('d.m.Y'),
            width:20
        },{
            header: "Организация",
            dataIndex: 'state_name',
            width:100
        },{
            header: "Филиал",
            dataIndex: 'branch_name',
            width:100
        }];

        config = {
            border: false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                        this.fireEvent('rowselect',rec);
                    },
                    rowdeselect: function(sm, row, rec) {
                    },
                    scope:this
                }
            }),
            tbar:[this.addContractBtn, {
                iconCls:'silk-pencil',
                text:'Редактировать',
                handler:this.onEditContract.createDelegate(this, []),
                scope:this
            }],
            bbar: new Ext.PagingToolbar({
                pageSize: 200,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Записи {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            viewConfig : {
                forceFit : true,
                emptyText: '<div class="start-help-text">Для начала работы добавьте новый договор</div>'
                //getRowClass : this.applyRowClass
            },
            listeners: {
                rowdblclick: function(grid, idx, e) {
                    var rec = this.store.getAt(idx);
                    if(rec){
                        this.onEditContract(rec);
                    }
                },
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.ContractGrid.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
            this.store.load({
                callback:function(){
                    this.getSelectionModel().selectFirstRow();
                },
                scope:this
            });
        },this);

    },

    onAddContract: function(){
        var contractWin = new App.accounting.ContractWindow({
            store:this.store,
            fn:function(record){
                if(record){
                    this.store.add(record);
                    this.store.save();
                }
                contractWin.close();
            },
            scope:this
        });

        contractWin.show();
    },

    onEditContract : function(rec){
        var record = rec || this.getSelectionModel().getSelected();
        if(!record) { return; }
        var contractWin = new App.accounting.ContractWindow({
            record:record,
            store:this.store,
            fn:function(record){
                if(record){
                    this.store.save();
                }
                contractWin.close();
            },
            scope:this
        });

        contractWin.show();

    }

});


Ext.reg('contractgrid', App.accounting.ContractGrid);
