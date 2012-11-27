Ext.ns('App','App.choices');

App.choices.StateChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = this.store || new Ext.data.RESTStore({
            autoLoad : true,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('state','state'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'name'}
                ]
        });

        this.columns =  [
            {
                header: "Организация",
                sortable: true,
                dataIndex: 'name',
                editor: new Ext.form.TextField({})
            }
        ];

        this.addButton = new Ext.Button({
            iconCls:'silk-add',
            text:'Добавить',
            hidden:!this.addCompany,
            handler:this.onAddCompany.createDelegate(this, []),
            scope:this
        });

        this.choiceButton = new Ext.Button({
            iconCls:'silk-accept',
            disabled:true,
            text:'Выбрать',
            handler:this.onChoice.createDelegate(this, []),
            scope:this
        });

        this.editor = new Ext.ux.grid.RowEditor({
            saveText: 'Сохранить',
            cancelText: 'Отменить',
            listeners:{
                afteredit:function(editor,changes,rec,i) {
                    var name = rec.data.name;
                    rec.set('print_name', name);
                    rec.set('official_title', name);
                    rec.set('type', this.companyType);
                    rec.set('remotestate',null);
                    this.store.save();
                },
                scope:this
            }
        });


        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border: false,
            store:this.store,
            columns:this.columns,
            // plugins:[this.editor],
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                        this.fireEvent('stateselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                        this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                        this.fireEvent('statedeselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                        this.btnSetDisabled(true);
                    },
                    scope:this
                }
            }),
            tbar:[this.choiceButton, new Ext.ux.form.SearchField({
                paramName:'name__istartswith',
                store: this.store
            })],
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
                rowdblclick:this.onChoice.createDelegate(this, []),
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.choices.StateChoiceGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);
        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);
//      WebApp.on('patientwrite', this.onPatientWrite, this);
        this.on('stateselect', this.onStateSelect, this);
        //this.store.on('write', this.onStoreWrite, this);
    },

    btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
    },

    onStateSelect: function(){
//      this.btnSetDisable(false);
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected()
    },

    onGlobalSearch: function(v){
        var s = this.store;
        s.baseParams = { format:'json' };
        s.setBaseParam('name__istartswith', v);
        s.load();
    },

    onStoreWrite: function(store, action, result, res, rs) {
        if( res.success && this.win ) {
            store.filter('id',rs.data.id);
            this.getSelectionModel().selectFirstRow();
            this.fireEvent('stateselect',rs);
        }
//      if(action=='create') {
//          WebApp.fireEvent('patientcreate',rs);
//      }
    },

    onAddCompany : function(){
        var r = new this.store.recordType({
        });
        this.editor.stopEditing();
        this.store.add(r);
        this.editor.startEditing(this.store.getCount()-1);
    },

    onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record) {
            Ext.callback(this.fn, this.scope || window, [record]);
        };
    }

});

