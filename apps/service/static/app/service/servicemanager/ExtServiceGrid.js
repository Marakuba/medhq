Ext.ns('App.servicemanager');



App.servicemanager.ExtServiceGrid = Ext.extend(Ext.grid.GridPanel, {


    initComponent : function() {

        this.store = this.store || new Ext.data.RESTStore({
            autoSave: false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('service','extserviceadm'),
            model: App.models.ExtendedService,
            baseParams:{
                format:'json'
            }
        });

        this.addBtn = new Ext.Button({
            iconCls:'silk-add',
            text: 'Добавить',
            // scope: this,
            handler:this.onAdd.createDelegate(this,[])
        });

        this.editBtn = new Ext.Button({
            iconCls:'silk-pencil',
            text: 'Изменить',
            // scope: this,
            handler:this.onChange.createDelegate(this,[])
        });

        this.columns =  [
            {
                header: "Организация",
                // width: 100,
                sortable: true,
                dataIndex: 'state_name',
                renderer:function(val, meta, record) {
                    var p = record.data.is_active;
                    var flag = p ? 'yes' : 'no';
                    var img = "<img src='"+WebApp.MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>";
                    return String.format("{0} {1}", img, val);
                }
            }
        ];

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true
            }),
            listeners:{
                scope: this,
                rowclick: function(grid, idx, e){
                    var rec = this.store.getAt(idx);
                    if(rec){
                        this.fireEvent('openextservice',rec);
                    }
                }
            },
            tbar:[this.addBtn],
            viewConfig : {
                forceFit : true
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.ExtServiceGrid.superclass.initComponent.apply(this, arguments);

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
