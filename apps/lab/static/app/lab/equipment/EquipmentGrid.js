Ext.ns('App.equipment');

App.equipment.EquipmentGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    initComponent : function() {
        
        this.store = new Ext.data.Store({
            autoLoad:false,
            autoSave:true,
            baseParams: {
                format:'json'
            },
            paramNames: {
                start : 'offset',
                limit : 'limit',
                sort : 'sort',
                dir : 'dir'
            },
            restful: true,
            proxy: new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('lab', 'equipment')
            }),
            reader: new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                successProperty: 'success',
                idProperty: 'id',
                root: 'objects',
                messageProperty: 'message'
            }, new Ext.data.Record.create([
                {name: 'id'},
                {name: 'resource_uri'},
                {name: 'name'},
                {name: 'slug'},
                {name: 'address'},
                {name: 'order'},
                {name: 'is_active', type:'bool'}
            ])),
            writer: new Ext.data.JsonWriter({
                encode: false,
                writeAllFields: true
            }),
            listeners:{
                exception:function(proxy, type, action, options, response, arg){
                },
                write:function(store, action, result, res, rs){
                    if(action=='create') {
                        WebApp.fireEvent('equipmentcreate', rs);
                    }
                },
                scope:this
            }
        });
        
        this.columns =  [
            {
                header: "Название",
                width: 50,
                dataIndex: 'name'
            },{
                header: "Код",
                width: 20,
                sortable: true,
                dataIndex: 'slug'
            },{
                header: "Порядок", 
                width: 10, 
                sortable: true, 
                dataIndex: 'order',
                editor:new Ext.form.TextField({})
            },{
                header: "Активно", 
                width: 5, 
                sortable: true, 
                dataIndex: 'is_active',
                editor:new Ext.form.Checkbox({}), 
                renderer: function(val) {
                    flag = val ? 'yes' : 'no';
                    return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
                }
            }
        ];      
        
        var config = {
            id:'equipments-grid',
            title:'Оборудование',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            closable:true,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true
            }),
            tbar:[/*{
                iconCls:'silk-add',
                text:'Добавить',
                handler:this.onAdd.createDelegate(this)
            },*/'->',{
                iconCls:'x-tbar-loading',
                handler:function(){
                    this.store.load();
                },
                scope:this
            }],
            listeners: {
            },
            viewConfig : {
                forceFit : true
            }           
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.equipment.EquipmentGrid.superclass.initComponent.apply(this, arguments);
        
        this.on('afterrender', function(){
            this.store.load();
        },this);
    },
    
    onAdd: function() {
        var s = this.getStore();
        var Record = s.recordType;
        s.insert(0, new Record({}));
    },
    
    storeFilter: function(field, value){
        if(!value) {
            //console.log(this.store.baseParams[field]);
            delete this.store.baseParams[field]
            //this.store.setBaseParam(field, );
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },
    
    getSelected: function() {
        return this.getSelectionModel().getSelected();
    },
    
    
});



Ext.reg('equipmentgrid', App.equipment.EquipmentGrid);

App.webapp.actions.add('equipmentgrid', new Ext.Action({
    text: 'Анализаторы',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','equipmentgrid');
    }
}));