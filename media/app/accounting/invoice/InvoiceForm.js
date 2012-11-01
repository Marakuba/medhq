Ext.ns('App.accounting');


App.accounting.InvoiceForm = Ext.extend(Ext.form.FormPanel, {
    
    initComponent: function() {
        config = {
            border:false,
            // baseCls:'x-plain',
            layout:{
                type:'hbox'
            },
            defaults:{
                padding:10,
                // baseCls:'x-plain',
                height:50,
                border:false
            },
            items:[{
                layout:'form',
                labelWidth:25,
                items:[{
                    xtype:'textfield',
                    fieldLabel:'№',
                    name:'number',
                    allowBlank:false
                }]
            },{
                layout:'form',
                labelWidth:40,
                items:[{
                    xtype:'datefield',
                    fieldLabel:'Дата',
                    name:'on_date',
                    value:new Date(),
                    allowBlank:false
                }]
            },{
                layout:'form',
                labelWidth:40,
                items:[{
                    xtype:'numberfield',
                    fieldLabel:'Сумма',
                    readOnly:true,
                    name:'total_price',
                    format:'0,000.00'
                }]
            },{
                id:'invoice-form-info',
                baseCls:'x-form-item',
                flex:1,
                style:{
                    padding:'11px',
                    // textAlign:'right'
                }
            },{
                layout:'form',
                items:[{
                    xtype:'button',
                    text:'Сохранить и продолжить',
                    handler:this.onSave.createDelegate(this, [false])
                }]
            },{
                layout:'form',
                items:[{
                    xtype:'button',
                    text:'Сохранить',
                    handler:this.onSave.createDelegate(this, [true])
                }]
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.InvoiceForm.superclass.initComponent.apply(this, arguments);

    },

    infoTpl : new Ext.XTemplate(
        '<div>',
            'Заказчик: <b>{state_name}</b> &nbsp;&nbsp;&nbsp; Исполнитель: <b>{branch_name}</b>',
        '</div>'
    ),

    setContractRecord : function(rec) {
        this.contractRecord = rec;
        var p = Ext.getCmp('invoice-form-info');
        this.infoTpl.overwrite(p.getEl(), rec.data);
        // console.info('conract record:',rec);
    },

    setInvoiceRecord : function(rec) {
        this.invoiceRecord = rec;
        this.getForm().loadRecord(rec);
        // console.info('invoice record:',rec);
    },

    setTotalPrice : function(total_price) {
        // console.info(total_price);
        this.invoiceRecord.set('total_price',total_price);
        this.getForm().findField('total_price').setValue(total_price);
    },

    onSave : function(cont){
        if(this.getForm().isValid()){
            this.getForm().updateRecord(this.invoiceRecord);
            this.fireEvent('save', this.invoiceRecord, cont);
            // console.info('updated record:', this.invoiceRecord);
        } else {

        }
    }

});


Ext.reg('accinvoiceform', App.accounting.InvoiceForm);