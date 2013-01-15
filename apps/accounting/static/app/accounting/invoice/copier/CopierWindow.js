Ext.ns('App.accounting');

App.accounting.CopierWindow = Ext.extend(Ext.Window, {

    initComponent:function(){

        this.invoiceGrid = new App.accounting.CopierInvoiceGrid({
            region: 'west',
            split:true,
            width:300
        });

        this.patientGrid = new App.accounting.PatientGrid({
            region:'north',
            height:100,
            split: true,
            hideToolbar: true
        });

        this.invoiceItemGrid = new App.accounting.InvoiceItemGrid({
            region:'center',
            hideToolbar: true
        });

        this.invoiceItemGrid.getView().deferEmptyText = false;
        this.invoiceItemGrid.getView().emptyText = "Нет ни одной записи";

        config = {
            title:'Выбор счета',
            width:850,
            height:550,
            modal:true,
            layout:'border',
            items:[this.invoiceGrid, {
                region:'center',
                layout:'border',
                border:false,
                items:[this.patientGrid, this.invoiceItemGrid]
            }],
            buttons:[{
                text:'Скопировать',
                handler: this.onCopy.createDelegate(this),
                scope:this
            },{
                text:'Закрыть',
                handler:function(){
                    this.close();
                },
                scope:this
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.CopierWindow.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){

        }, this);

        this.invoiceGrid.getSelectionModel().on('rowselect', function(sm, row, rec){
            this.invoiceItemGrid.loadItems(rec.data.id);
        }, this);

        this.invoiceItemGrid.on('patientlist', this.onPatientList, this);

        this.patientGrid.getSelectionModel().on('rowselect', this.onPatientSelect, this);

    },

    onCopy: function(){
        var s = this.invoiceItemGrid.getStore();
        var records = _.map(s.data.items, function(rec){
            var d = rec.data;
            return {
                service: d.service,
                service_name: d.service_name,
                execution_place: d.execution_place,
                price: d.price,
                count: d.count,
                total_price: d.total_price
            };
        });
        if(this.fn) {
            Ext.callback(this.fn, this.scope || window, [records]);
        }
    },

    onPatientList : function(l){
        this.patientGrid.getStore().loadData(l);
        this.patientGrid.getSelectionModel().selectFirstRow();
        // console.info('patient list', l);
    },

    onPatientSelect : function(sm, row, rec) {
        this.invoiceItemGrid.onPatientSelect(rec);
        // console.info('current patient', rec);
    }



});