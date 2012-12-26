Ext.ns('App.equipment');

App.equipment.EquipmentTaskGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    initComponent : function() {

        this.origTitle = 'Задания';

        this.model = new Ext.data.Record.create([
            {name: 'id'},
            {name: 'resource_uri'},
            {name: 'equipment_assay'},
            {name: 'ordered_service'},
            {name: 'equipment_name'},
            {name: 'service_name'},
            {name: 'analysis_name'},
            {name: 'patient_name'},
            {name: 'order'},
            {name: 'result'},
            {name: 'status'},
            {name: 'status_name'},
            {name: 'repeats'},
            {name: 'completed', type:'date', format:'c'},
            {name: 'created', type:'date', format:'c'}
        ]);

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('lab', 'equipmenttaskro'),
            model: this.model
        });

        this.store.on('save',this.onStoreSave, this);

        this.store.on('load',this.onStoreLoad,this);

        this.columns =  [
            {
                header: "Добавлено",
                width: 18,
                dataIndex: 'created',
                renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')
            },{
                header: "Заказ",
                width: 10,
                dataIndex: 'order'
            },{
                header: "Пациент",
                width: 25,
                sortable: true,
                dataIndex: 'patient_name'
            },{
                header: "Оборудование",
                width: 18,
                dataIndex: 'equipment_name'
            },{
                header: "Исследование",
                width: 35,
                sortable: true,
                dataIndex: 'service_name'
            },{
                header: "Тест",
                width: 30,
                sortable: true,
                dataIndex: 'analysis_name'
            },{
                header: "Результат",
                width: 18,
                dataIndex: 'result'
            },/*{
                header: "Кол-во",
                width: 8,
                dataIndex: 'repeats'
            },*/{
                header: "Статус",
                width: 10,
                dataIndex: 'status_name'
            }
        ];

        this.restoreBtn = new Ext.Button({
            text:'Сбросить статус',
            hidden:true,
            handler: function(){
                var records = this.getSelectionModel().getSelections();
                Ext.each(records, function(rec,i){
                    rec.set('status','wait');
                });
                this.store.save();
            },
            scope:this
        });

        this.statusBtn = new Ext.CycleButton({
            showText: true,
            prependText: 'Статус: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'ожидание',
                filterValue:'wait'
            },{
                text:'в работе',
                filterValue:'proc'
            },{
                text:'выполнено',
                filterValue:'done'
            },{
                text:'повторы',
                filterValue:'rept'
            }],
            changeHandler:function(btn, item){
                this.storeFilter('status',item.filterValue);
                this.restoreBtn.setVisible(item.filterValue=='proc' || item.filterValue=='done');
            },
            scope:this
        });

        var config = {
            id:'equipment-task-grid',
            title:this.origTitle,
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            closable:true,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : false
            }),
            tbar:['Анализатор:',new Ext.form.ClearableComboBox({
                emptyText:'Любой',
                queryParam:'name__istartswith',
                minChars:2,
                triggerAction: 'all',
                valueField: 'resource_uri',
                store: new Ext.data.JsonStore({
                    autoLoad:true,
                    proxy: new Ext.data.HttpProxy({
                        url:App.utils.getApiUrl('lab', 'equipment'),
                        method:'GET'
                    }),
                    root:'objects',
                    idProperty:'id',
                    fields:['id','resource_uri','name']
                }),
                valueField:'id',
                displayField:'name',
                listeners:{
                    select:function(cmb,rec) {
                        this.storeFilter('equipment_assay__equipment',rec.id);
                    },
                    clearclick:function(){
                        this.storeFilter('equipment_assay__equipment');
                    },
                    scope:this
                }
            }),
            this.statusBtn, this.restoreBtn, '->',{
                iconCls:'x-tbar-loading',
                handler:function(){
                    this.store.load();
                },
                scope:this
            }],

            bbar: new Ext.PagingToolbar({
                pageSize: 50,
                store: this.store,
                displayInfo: true,
                displayMsg: '{0} - {1} | {2}',
                emptyMsg: "Нет записей",
//              items:['-',this.filterText]
            }),

            listeners: {
            },
            view : new Ext.grid.GridView({
                forceFit : true,
                emptyText: 'Нет записей',
                getRowClass: function(record, index) {
                    var s = record.get('status');
                    return String.format('x-equipment-task-{0}',s);
                }
            })
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.equipment.EquipmentTaskGrid.superclass.initComponent.apply(this, arguments);

        WebApp.on('globalsearch', this.onGlobalSearch, this);

        this.on('afterrender', function(){
            if (this.searchValue){
                this.onGlobalSearch(this.searchValue)
            } else {
                this.store.load();
            }
        },this);

        this.on('beforedestroy', function(){
            this.store.un('load',this.onStoreLoad,this);
            this.store.un('save',this.onStoreSave, this);
        },this);

        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);

    },

    onStoreSave : function(){
        this.statusBtn.setActiveItem(1);
    },

    onGlobalSearch: function(v){
        this.changeTitle = v!==undefined;
        if(!v){
            this.setTitle(this.origTitle);
        } else {
            this.storeFilter('search', v);
        }
    },

    storeFilter: function(field, value){
        if(!value) {
            delete this.store.baseParams[field]
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected()
    },

    onStoreLoad : function(store,r,options){
        if(this.changeTitle){
            this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
        }
    }

});



Ext.reg('equipmenttaskgrid', App.equipment.EquipmentTaskGrid);


App.webapp.actions.add('equipmenttaskgrid', new Ext.Action({
    text: 'Задания',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','equipmenttaskgrid');
    }
}));