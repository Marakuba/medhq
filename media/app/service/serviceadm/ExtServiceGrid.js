Ext.ns('App.serviceadm');



App.serviceadm.ExtServiceGrid = Ext.extend(Ext.grid.GridPanel, {


    initComponent : function() {

        this.store = this.store || new Ext.data.RESTStore({
            autoSave: false,
            autoLoad : false,
            apiUrl : App.getApiUrl('service','extserviceadm'),
            model: App.models.ExtendedService,
            baseParams:{
                format:'json'
            }
        });

        this.columns =  [
            {
                header: "Организация",
                width: 100,
                sortable: true,
                dataIndex: 'state_name'
            }
        ];

        var config = {
            title:'Организации',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true
            }),
            tbar:[{
                iconCls:'silk-add',
                text:'Добавить',
                handler:this.onAdd.createDelegate(this,[])
            },{
                iconCls:'silk-pencil',
                text:'Изменить',
                handler:this.onChange.createDelegate(this,[])
            }],
            viewConfig : {
                forceFit : true
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.serviceadm.ExtServiceGrid.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            if (this.baseServiceId){
               this.setBaseService(this.baseServiceId);
            }

        }, this);
    },

    onAdd: function(){
        this.fireEvent('addextservice');
    },

    onChange: function(){
        var record = this.getSelectionModel().getSelected();
        if (record) {
            this.fireEvent('openextservice',record);
        }
    },

    setBaseService: function(baseServiceId){
        this.baseServiceId = baseServiceId;
        this.store.load({params:{
            'base_service': baseServiceId
        }, callback: function(records){
            if (records.length){
                this.getSelectionModel().selectFirstRow();
            }
        },scope: this});
    }
});
