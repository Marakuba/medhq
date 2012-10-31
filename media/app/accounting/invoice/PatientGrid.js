Ext.ns('App.accounting');


App.accounting.PatientGrid = Ext.extend(Ext.grid.GridPanel, {
    
    initComponent: function() {

        this.store = new Ext.data.ArrayStore({
            idIndex: 0,
            fields: [
                {name:'id'},
                {name:'patient_name'}
            ]
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
            tbar:[{
                iconCls: 'silk-add',
                text:'Добавить пациента',
                handler: this.onAddPatient.createDelegate(this)
            }, {
                iconCls: 'silk-delete',
                text:'Исключить',
                handler: this.onRemovePatient.createDelegate(this)
            }],
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
            this.store.remove(rec);
        }
    }

});


Ext.reg('accpatientgrid', App.accounting.PatientGrid);