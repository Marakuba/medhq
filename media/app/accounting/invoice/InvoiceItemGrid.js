Ext.ns('App.accounting');


App.accounting.InvoiceItemGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    initComponent: function() {

        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.getApiUrl('accounting','acc_invoice_item'),
            model: App.models.AccountingInvoiceItem
        });

        this.columns = [{
            // css:'background: #F9F9F9 repeat-y top right;', // url(expand-bg.gif)
            dataIndex: 'counter',
            width:3
        },{
            header: "Услуга",
            dataIndex: 'service_name',
            width:100
        }, {
            header: "Цена",
            dataIndex: 'price',
            width:20,
            editor: new Ext.form.NumberField({
                // allowBlank:true
            }),
            renderer:Ext.util.Format.numberRenderer('0,000.00')
        }, {
            header: "Кол-во",
            dataIndex: 'count',
            width:10,
            editor: new Ext.ux.form.SpinnerField({
                minValue: 1,
                maxValue: 20
            })
        }, {
            header: "Сумма",
            dataIndex: 'total_price',
            width:20,
            editor: new Ext.form.NumberField({
                // allowBlank:true
            }),
            renderer:Ext.util.Format.numberRenderer('0,000.00')
        }];

        config = {
            border: false,
            store:this.store,
            columns:this.columns,
            clicksToEdit:1,
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
            tbar:[{
                iconCls:'silk-delete',
                text:'Удалить',
                handler:this.onDeleteItem.createDelegate(this)
            }],
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            },
            listeners: {
                afteredit:this.afterEdit.createDelegate(this),
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceItemGrid.superclass.initComponent.apply(this, arguments);

    },

    afterEdit : function(e) {
        var rec = e.record;
        var f = e.field;
        switch (f)
        {
            case 'price':
                rec.set('total_price', rec.data.price*rec.data.count);
                break;
            case 'total_price':
                rec.set('price', rec.data.total_price/rec.data.count);
                break;
            case 'count':
                rec.set('total_price', rec.data.price*rec.data.count);
                break;
            default:
                break;
        }
        this.updateTotalPrice();
    },

    updateTotalPrice : function(){
        var total_price = 0;
        this.store.queryBy(function(rec){
            total_price += parseFloat(rec.get('total_price'));
        });
        this.fireEvent('totalpricechange', total_price);
        return total_price;
    },

    updateStore: function(){
        this.store.each(function(rec,i){
            rec.set('counter',i+1);
        });
    },

    addItem : function(fields) {
        var model = this.store.recordType;
        this.store.add(new model(fields));
        this.updateStore();
        this.updateTotalPrice();
    },

    onDeleteItem : function() {
        var rec = this.getSelectionModel().getSelected();
        if(rec){
            this.store.remove(rec);
            this.updateStore();
        }
    },

    getPatientList : function(rs){
        var patients = {}, res = [];
        Ext.each(rs, function(p){
            var id = App.uriToId(p.data.patient);
            patients[id] = p.data.patient_name;
        });

        for(pid in patients) {
            res.push([pid, patients[pid]]);
        }
        return res;
    },

    onRemovePatient : function(id) {
        var resource_uri = App.getApiUrl('patient','patient', id);
        var recs = this.store.queryBy(function(rec){
            return rec.data.patient==resource_uri;
        }, this);
        recs.each(function(rec){
            var r = this.store.getById(rec.data.id);
            // console.info(r, this.store.snapshot.indexOf(r));
            this.store.remove(rec);
            // this.updateStore();
        });
        this.updateTotalPrice();
    },

    loadItems : function(invoiceId) {
        this.store.load({
            params:{
                invoice:invoiceId
            },
            callback:function(rs, opts){
                this.updateStore();
                this.updateTotalPrice();
                var res = this.getPatientList(rs);
                this.fireEvent('patientlist', res);
            },
            scope:this
        });
    },

    onPatientSelect : function(rec){
        this.currentPatient = App.getApiUrl('patient','patient',rec.data.id);
        this.store.filter('patient', this.currentPatient);
        this.updateStore();
    },

    onInvoiceWrite : function(invoice) {
        this.store.queryBy(function(rec,id){
            if(!rec.data.invoice){
                rec.set('invoice', invoice.data.resource_uri);
            }
        });
        this.store.save();
    }

});


Ext.reg('accinvoiceitemgrid', App.accounting.InvoiceItemGrid);
