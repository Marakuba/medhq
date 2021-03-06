Ext.ns('App','App.patient');

App.patient.PatientGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('patient','patient'),
            model: App.models.Patient
        });

        // if(App.settings.strictMode) {
        //  this.store.setBaseParam('state',active_state_id);
        // }

        this.store.load();

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
                header: "Д.р.",
                width: 35,
                sortable: true,
                dataIndex: 'birth_day',
                renderer:Ext.util.Format.dateRenderer('d.m.Y')
            }
        ];

        this.editButton = new Ext.Button({
            iconCls:'silk-pencil',
//          text:'Изменить',
            disabled:true,
            handler:this.onPatientEdit.createDelegate(this),
            scope:this
        });

        this.cardButton = new Ext.menu.Item({
            text:'Амбулаторная карта',
            disabled:true,
            handler: this.goToSlug.createDelegate(this, ['print_card']),
            scope:this
        });
        this.contractButton = new Ext.menu.Item({
            text:'Договор',
            disabled:true,
            handler: this.goToSlug.createDelegate(this, ['contract']),
            scope:this
        });

        this.agreementButton = new Ext.Button({
            text:'Согласие',
            iconCls:'silk-error',
            hidden:true,
            handler: this.onAccepted.createDelegate(this),
            scope:this
        });

        this.agrmtButton = new Ext.menu.Item({
            text:'Согласие',
            hidden:true,
            handler: this.onAccepted.createDelegate(this),
            scope:this
        });

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border: false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                        this.stopSelection = true;
                        this.fireEvent('patientselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                        this.btnSetDisabled(false, rec);
                    },
                    rowdeselect: function(sm, row, rec) {
                        this.fireEvent('patientdeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                        this.btnSetDisabled(true, rec);
                    },
                    scope:this
                }
            }),
            tbar:[{
                xtype:'button',
                iconCls:'silk-add',
                text:'Новый пациент',
                handler:this.onPatientAdd.createDelegate(this, [])
            },this.editButton,'-',this.agreementButton,'->',{
                iconCls:'silk-bullet-wrench',
                menu:[this.cardButton,this.contractButton,this.agrmtButton]
            }],
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
            },
            listeners: {
                rowdblclick:this.onPatientEdit.createDelegate(this),
                rowclick:{
                    fn:this.onPatientClick.createDelegate(this),
                    buffer:300,
                    scope:this
                },
                scope:this
            }
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.patient.PatientGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);
//      WebApp.on('patientwrite', this.onPatientWrite, this);
        this.on('patientselect', this.onPatientSelect, this);
        this.store.on('write', this.onStoreWrite, this);
        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);
    },

    onPatientClick : function(grid,rowIndex,e){
        var rec = grid.getStore().getAt(rowIndex);
        var sel_rec = this.getSelectionModel().getSelected();
        if(!this.stopSelection){
            this.fireEvent('patientselect', rec);
        } else {
            this.stopSelection = false;
        }
    },

    btnSetDisabled: function(status, rec) {
        this.editButton.setDisabled(status);
        this.agreementButton.setDisabled(status);
        this.cardButton.setDisabled(status);
        this.agrmtButton.setDisabled(status);
        this.contractButton.setDisabled(status);
    },

    onPatientSelect: function(record){
        if(!record) return false;
        this.agrmtButton.setVisible(record.data.accepted);
        this.agreementButton.setVisible(!record.data.accepted);
        this.doLayout();
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

    storeFilter: function(field, value){
        if(!value) {
            delete this.store.baseParams[field];
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },

    onGlobalSearch: function(v){
        this.storeFilter('search', v);
    },

    onPatientAdd: function() {
        this.win = new App.patient.PatientWindow({
            store:this.store,
            scope:this,
            fn:function(record){
//              this.store.insertRecord(record);
            }
        });
        this.win.show();
        this.win.on('savecomplete',this.onSaveComplete,this);
    },

    onPatientEdit: function() {
        this.stopSelection = true;
        var record = this.getSelected();
        if(record) {
            this.win = new App.patient.PatientWindow({
                record:record,
                store:this.store,
                scope:this,
                fn:function(record){
                }
            });
            this.win.show();
            this.win.on('savecomplete',this.onSaveComplete,this);
        }
    },

    onSaveComplete: function(record){
        if(this.win) this.win.close();
    },
    onStoreWrite: function(store, action, result, res, rs) {
        if( res.success && this.win ) {
            this.store.filter('id',rs.data.id);
            this.getSelectionModel().selectFirstRow();
            if(action=='create') {
//              WebApp.fireEvent('patientcreate',rs);
                this.fireEvent('patientselect',rs);
            }

        }

    },

    getPatientRecord: function(patientId){ //and select him
        delete this.store.baseParams['search'];
        var curPatient = this.getSelectionModel().getSelected();
        if (!curPatient) return false;
        if (patientId && (curPatient.data.id != patientId)){
            this.store.load({params:{'id':patientId},callback:function(records){
                if (!records.length) return
                this.getSelectionModel().selectFirstRow();
                return this.getSelectionModel().getSelected();
            },scope:this})
        } else {
            return curPatient
        }
    },

    acceptedUrlTpl: '/patient/acceptance/{0}/',

    onAccepted: function(){

        var record = this.getSelected();
        if (!record) return false;

        if (!record.data.accepted){
            Ext.Msg.confirm('Подтверждение','Согласие подписано пациентом?',function(btn){
                if (btn=='yes'){
                    params = {}
                    params['patient'] = record.data.id;
                    params['state'] = WebApp.state;
                    App.direct.patient.setAcceptedDate(params,function(res){
                        var date = Date.parseDate(res.data.accepted,'m/d/Y H:i:s');
                        record.data['accepted'] = date;
                        this.fireEvent('patientselect',record)
                    },this)
                }

            },this);
        }
        var url = String.format(this.acceptedUrlTpl,record.data.id);
        window.open(url);
    }

});



Ext.reg('patientgrid', App.patient.PatientGrid);
