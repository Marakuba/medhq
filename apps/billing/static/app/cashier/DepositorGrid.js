Ext.ns('App','App.cashier');

App.cashier.DepositorGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('patient','depositor'),
            model: App.models.Depositor
        });

        this.columns =  [
            {
                header: "Фамилия",
                width: 45,
                sortable: true,
                dataIndex: 'last_name'
            },{
                header: "Имя",
                width: 45,
                sortable: true,
                dataIndex: 'first_name'
            },{
                header: "Отчество",
                width: 45,
                sortable: true,
                dataIndex: 'mid_name'
            },{
                header: "Баланс",
                width: 35,
                sortable: true,
                dataIndex: 'balance'
            }
        ];
        this.payButton = new Ext.Button({
            iconCls:'silk-add',
            text:'Возврат',
            disabled:true,
            handler:this.onReturn.createDelegate(this),
            scope:this
        });
        this.refreshButton = new Ext.Button({
            iconCls:'silk-add',
            text:'Обновить баланс',
            disabled:true,
            handler:this.onPatientBalanceUpdate.createDelegate(this),
            scope:this
        });
        this.ttb = new Ext.Toolbar({
            items:[this.payButton,this.refreshButton]
        });


        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border: false,
            store:this.store,
            columns:this.columns,
            listeners: {
                rowdblclick:this.onReturn.createDelegate(this),
                scope:this
            },
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                        //this.fireEvent('patientselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                        this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                        //this.fireEvent('patientdeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                        this.btnSetDisabled(true);
                    },
                    scope:this
                }
            }),
            tbar:this.ttb,
            bbar: new Ext.PagingToolbar({
                pageSize: 20,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Записи {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            }
            //listeners: {
            //  rowdblclick:this.onPatientEdit.createDelegate(this),
            //  scope:this
            //}
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.cashier.DepositorGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);
        WebApp.on('paymentsave', this.reloadStore, this);
        WebApp.on('visitcreate', this.reloadStore, this);
        this.on('afterrender', function(){
            if (this.searchValue){
                this.onGlobalSearch(this.searchValue)
            } else {
                this.store.load();
            }
        },this);
        this.on('destroy', function(){
            WebApp.un('paymentsave', this.reloadStore, this);
            WebApp.un('globalsearch', this.onGlobalSearch, this);
            WebApp.un('visitcreate', this.reloadStore, this);
        },this);
//      WebApp.on('patientwrite', this.onPatientWrite, this);
        //this.on('patientselect', this.onPatientSelect, this);
        //this.store.on('write', this.onStoreWrite, this);
    },

    onPatientSelect: function(){
//      this.btnSetDisable(false);
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected()
    },

    getAbsoluteUrl: function(id) {
        return "/admin/patient/patient/"+id+"/";
    },

    goToSlug: function(slug) {
        var s = this.getSelected().data.id;
        var url = this.getAbsoluteUrl(s)+slug+"/";
        window.open(url);
    },

    onGlobalSearch: function(v){
        var s = this.store;
        s.baseParams = { format:'json' };
        vi = parseInt(v);
        s.setBaseParam('search', v);
        s.load();
    },

    onReturn: function(){
        var record = this.getSelected();
        if (record) {
            this.win = new App.billing.PaymentWindow({
                is_income : false,
                amount:Math.abs(record.data.balance),
                patientRecord:record
            });
            this.win.show();
        }
    },

    onPatientBalanceUpdate : function(){
        var rec = this.getSelected();
        if(rec){
            App.direct.patient.updatePatientInfo(rec.id, function(res,e){
                var data = res.data;
                //beginEdit не закрывается, чтобы не происходило сохранение
                rec.beginEdit();
                for(k in data){
                    rec.set(k,data[k]);
//                  console.info(k,data[k]);
                }
                this.store.load();
//              console.info(rec.data);
//              rec.endEdit();
//              this.patientSelect(rec);
//              this.patientCard.doRefresh();
            }, this);
        }
    },

    reloadStore: function(record){
        if (this.store) {
            this.store.load();
            this.btnSetDisabled(true);
        }
    },

    btnSetDisabled: function(status) {
        this.payButton.setDisabled(status);
        this.refreshButton.setDisabled(status);
        //this.cardButton.setDisabled(status);
        //this.contractButton.setDisabled(status);
    }

});

Ext.reg('depositorgrid', App.cashier.DepositorGrid);
