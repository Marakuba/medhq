Ext.ns('App.accounting');


App.accounting.InvoiceApp = Ext.extend(Ext.Panel, {

    title : 'Счет',

    initComponent: function() {

        this.contractStore = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('accounting','acc_contract'),
            model: App.models.AccountingContract
        });

        this.invoiceStore = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('accounting','acc_invoice'),
            model: App.models.AccountingInvoice
        });

        this.invoiceStore.on('write', this.onInvoiceWrite, this);

        this.form = new App.accounting.InvoiceForm({
            region:'north',
            height:45,
            style:{
                borderBottom:"solid 1px #99BBE8"
            },
            listeners:{
            }
        });

        this.form.on('save', this.onFormSave, this);

        this.patientGrid = new App.accounting.PatientGrid({
            region:'west',
            width:250
        });

        this.patientGrid.getSelectionModel().on('rowselect', this.onPatientSelect, this);
        this.patientGrid.getStore().on('remove', this.onPatientRemove, this);

        this.serviceTree = new App.service.ServiceTreeGrid({
            region:'east',
            baseParams: {
                payment_type:'н',
                all:1
            },
            split:true,
            width:360,
            listeners: {
                serviceclick: this.onServiceClick.createDelegate(this)
            }
        });

        this.basket = new App.accounting.InvoiceItemGrid({
            region:'center',
            style:{
                borderLeft:"solid 1px #99BBE8"
            }
        });

        this.basket.on('totalpricechange', this.onTotalPriceChange, this);
        this.basket.on('patientlist', this.onPatientList, this);
        this.basket.on('copy', this.addItems, this);
        this.basket.store.on('save', this.onBasketSave, this);


        config = {
            closable:true,
            layout:'border',
            items:[this.form, this.patientGrid, this.basket, this.serviceTree]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            if (this.invoiceId){
                this.loadInvoice(this.invoiceId);
            } else if (this.contractId){
                this.loadContract(this.contractId);
            }
        }, this);

    },

    onPatientList : function(l){
        this.patientGrid.getStore().loadData(l);
        this.patientGrid.getSelectionModel().selectFirstRow();
        // console.info('patient list', l);
    },

    onPatientRemove : function(store, rec, idx) {
        this.basket.onRemovePatient(rec.data.id);
    },

    onPatientSelect : function(sm, row, rec) {
        this.basket.onPatientSelect(rec);
        // console.info('current patient', rec);
    },

    loadInvoice : function(id){
        this.invoiceStore.load({
            params:{
                id:id
            },
            callback:function(rs, opts){
                if(rs.length){
                    this.onInvoiceLoad(rs[0]);
                }
            },
            scope:this
        });
    },

    onInvoiceLoad : function(rec){
        this.invoiceRecord = rec;
        this.form.setInvoiceRecord(rec);

        this.contractId = App.utils.uriToId(rec.data.contract);
        this.loadContract(this.contractId);
        if(rec.data.id){
            this.basket.loadItems(rec.data.id);
        }
    },

    loadContract : function(id){
        this.contractStore.load({
            params:{
                id:id
            },
            callback:function(rs, opts){
                if(rs.length){
                    this.onContractLoad(rs[0]);
                }
            },
            scope:this
        });
    },

    onContractLoad : function(rec){
        if(!this.invoiceRecord){
            var invoiceRecord = new this.invoiceStore.recordType({
                contract: rec.data.resource_uri
            });
            this.onInvoiceLoad(invoiceRecord);
        }
        this.contractRecord = rec;
        this.form.setContractRecord(rec);
    },

    getCurrentPatient : function() {
        return this.patientGrid.getSelectionModel().getSelected();
    },

    onServiceClick: function(node){
        var a = node.attributes;

        var nodes;
        if(a.isComplex){
            nodes = a.nodes;
        } else {
            nodes = [a];
        }

        var items = _.map(nodes, function(node){
            var id = node.id.split('-');
            return {
                service: App.utils.getApiUrl('service','baseservice', id[0]),
                service_name: node.text,
                execution_place: App.utils.getApiUrl('state','state', id[1]),
                price:node.price,
                count:1,
                total_price:node.price
            };
        });

        this.addItems(items);

    },

    addItems: function(items){
        var p = this.getCurrentPatient();
        if(!p) {
            Ext.MessageBox.alert('Ошибка','Сначала выберите пациента!');
            return;
        }

        Ext.each(items, function(item){
            var fields = {
                patient: App.utils.getApiUrl('patient','patient', p.data.id)
            };
            Ext.apply(fields, item);
            this.basket.addItem(fields);

        }, this);

    },

    onTotalPriceChange : function(total_price) {
        this.form.setTotalPrice(total_price);
    },

    onFormSave : function(rec, cont){
        this.cont = cont;
        if(rec.phantom){
            this.invoiceStore.add(this.invoiceRecord);
        }
        this.invoiceStore.save();
    },

    onInvoiceWrite : function(store, action, result, res, rs){
        if(res.success){
            this.setTitle(String.format('Счет №{0} от {1}', rs.data.number, Ext.util.Format.date(rs.data.on_date)));
            if(this.basket.store.getModifiedRecords().length || this.basket.store.removed.length){
                // console.info(this.basket.store.getModifiedRecords());
                // console.info(this.basket.store.removed);
                this.basket.onInvoiceWrite(rs);
            } else {
                // console.info('basket empty');
                this.onBasketSave();
            }
        }
    },

    onBasketSave : function(){
        // console.info('quit:', this.cont);
        if(this.cont){
            if(this.fn){
                Ext.callback(this.fn, this.scope || window, [this.invoiceRecord]);
            }
            this.destroy();
        }
    }

});


Ext.reg('accinvoiceapp', App.accounting.InvoiceApp);
