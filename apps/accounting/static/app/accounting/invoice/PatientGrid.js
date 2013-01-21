Ext.ns('App.accounting');


App.accounting.PatientGrid = Ext.extend(Ext.grid.GridPanel, {
    
    initComponent: function() {

        this.store = new Ext.data.ArrayStore({
            idIndex: 0,
            fields: [
                {name:'id'},
                {name:'patient_name'}
            ],
            listeners:{
                remove:this.onStoreRemove.createDelegate(this)
            }
        });

        this.columns = [{
            header: "Пациент",
            dataIndex: 'patient_name'
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
            tbar: new Ext.Toolbar({
                hidden: this.hideToolbar,
                items:[{
                    iconCls: 'silk-add',
                    text:'Добавить пациента',
                    handler: this.onAddPatient.createDelegate(this)
                }, {
                    iconCls: 'silk-delete',
                    text:'Исключить',
                    handler: this.onRemovePatient.createDelegate(this)
                }]
            }),
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            },
            listeners: {
                scope:this
            }
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.accounting.PatientGrid.superclass.initComponent.apply(this, arguments);

    },

    onAddPatient : function(btn){
        var win = new App.choices.PatientChoiceWindow({
            fn: function(rec){
                var patient = {
                    id:rec.data.id,
                    patient_name: String.format('{0} {1} {2}', rec.data.last_name, rec.data.first_name, rec.data.mid_name)
                };
                var model = new this.store.recordType(patient);
                this.store.insert(0, model);
                this.getSelectionModel().selectFirstRow();
                win.close();
            },
            scope:this
        });
        win.show(btn.getEl());
    },

    onRemovePatient : function(){
        var rec = this.getSelectionModel().getSelected();
        if(rec){
            Ext.MessageBox.confirm('Потверждение','Удалить пациента из списка и всего его услуги?', function(btn){
                if(btn=='yes'){
                    this.store.remove(rec);
                }
            }, this);
        }
    },

    onStoreRemove : function(store, rec, idx) {
        // this.getSelectionModel().selectFirstRow();
        
        // var c = store.getCount() - 1;
        // if (idx>=c) {
        //     this.getSelectionModel().selectRow(idx);
        // } else {
        //     this.getSelectionModel().selectLastRow();
        // }
        // // console.info('ifx of removed:',idx, 'recs count', store.getCount());
    }

});


Ext.reg('accpatientgrid', App.accounting.PatientGrid);