Ext.ns('App.accounting');


App.accounting.InvoiceGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent: function() {

        this.addInvoiceBtn = new Ext.Button({
            iconCls:'silk-add',
            text:'Добавить счет',
            handler:this.onAddInvoice.createDelegate(this),
            scope:this
        });

        this.editInvoiceBtn = new Ext.Button({
            iconCls:'silk-pencil',
            text:'Изменить счет',
            handler:this.onEditInvoice.createDelegate(this, []),
            scope:this
        });

        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : get_api_url('acc_invoice'),
            model: App.models.AccountingInvoice
        });

        this.columns = [{
            header: "Номер",
            dataIndex: 'number',
            width:120
        },{
            header: "Дата",
            dataIndex: 'on_date',
            renderer:Ext.util.Format.dateRenderer('d.m.Y'),
            width:70
        },{
            header: "Сумма, руб.",
            dataIndex: 'total_price',
            width:120
        }];

        config = {
            border: false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {

                    },
                    rowdeselect: function(sm, row, rec) {
                    },
                    scope:this
                }
            }),
            tbar:[this.addInvoiceBtn,this.editInvoiceBtn,'-',{
                iconCls:'silk-printer',
                text:'Печать',
                menu:[{
                    text:'Реестр оказанных услуг',
                    handler:this.onPrint.createDelegate(this, ['register'])
                },{
                    text:'Счет',
                    handler:this.onPrint.createDelegate(this, ['invoice'])
                }]
            }],
            viewConfig : {
                // forceFit : true,
                emptyText: 'По данному договору нет ни одного счета'
                //getRowClass : this.applyRowClass
            },
            listeners: {
                rowdblclick: function(grid, idx, e){
                    var rec = this.store.getAt(idx);
                    if(rec){
                        this.onEditInvoice(rec);
                    }
                },
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceGrid.superclass.initComponent.apply(this, arguments);

    },

    setContract: function(record){
        this.contract = record;
        this.store.setBaseParam('contract',record.data.id);
        this.store.load({
            callback:function(rs, opts){
                if(rs.length){
                    this.getSelectionModel().selectFirstRow();
                }
            },
            scope:this
        });
    },

    onAddInvoice: function(){
        if (this.contract){
            App.eventManager.fireEvent('launchapp', 'accinvoiceapp', {
                contractId: this.contract.data.id,
                title:'Новый счет',
                fn:function(record){
                    this.store.load();
                },
                scope:this
            }, true);
        }
    },
    onEditInvoice: function(record){
        var rec = record || this.getSelectionModel().getSelected();
        if(rec){
            var title = String.format('Счет №{0} от {1}', rec.data.number, Ext.util.Format.date(rec.data.on_date));
            App.eventManager.fireEvent('launchapp', 'accinvoiceapp', {
                invoiceId: rec.data.id,
                title:title,
                fn:function(record){
                    this.store.load();
                },
                scope:this
            }, true);
        }
    },

    onPrint : function(view, record){
        var rec = record || this.getSelectionModel().getSelected();
        if(!rec) { return; }
        if(view=='register'){
            var url = "/old/reporting/corp-pnt-service-register/print/?invoice_id={0}&order__patient=&staff__staff=&staff__department=&order__referral=&execution_place_office=&execution_place_filial=&order__payment_type=&price_type=&order__cls=&from_place_filial=&from_lab=&details=да";
            url = String.format(url, rec.data.id);
            window.open(url);
        }
    }

});


Ext.reg('invoicegrid', App.accounting.InvoiceGrid);
