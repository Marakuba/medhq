
Ext.ns('App.accounting');


App.accounting.CopierInvoiceGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent: function() {

        this.store = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('accounting','acc_invoice'),
            model: App.models.AccountingInvoice
        });

        this.columns = [{
            header: "Номер",
            dataIndex: 'number',
            width:200,
            renderer:function(v){
                return String.format("<b>{0}</b>", v);
            }
        },{
            header: "Дата",
            dataIndex: 'on_date',
            renderer:Ext.util.Format.dateRenderer('d.m.Y'),
            width:70
        },{
            header: "Сумма, руб.",
            dataIndex: 'total_price',
            hidden:true,
            width:90
        }];

        this.choiceBtn = new Ext.Button({
            iconCls:'silk-accept',
            text: 'Выбрать'
        });

        this.searchField = new Ext.ux.form.SearchField({
            emptyText: 'Поиск по номеру счета',
            store: this.store,
            paramName: 'number__icontains'
        });

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
            tbar:[this.searchField],
            viewConfig : {
                // forceFit : true,
                emptyText: 'Нет ни одного счета',
                enableRowBody:true,
                getRowClass : function(record, index, p, store){
                    p.body = String.format('<p class="result-row-body">{0}</p>',record.data.state_name);
                }
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 200,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Записи {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
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
        App.accounting.CopierInvoiceGrid.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            this.store.load({
                callback: function(r, opts){

                }
            }, this);
        }, this);

    }

});
