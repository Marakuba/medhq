Ext.ns('App.serviceadm');



App.serviceadm.SelectedServiceGrid = Ext.extend(Ext.grid.GridPanel, {


    initComponent : function() {

        this.store = this.store || new Ext.data.RESTStore({
            autoSave: false,
            autoLoad : false,
            apiUrl : App.getApiUrl('service','baseservice'),
            model: App.models.BaseService,
            baseParams:{
                format:'json'
            }
        });

        this.columns =  [
            {
                header: "Наименование",
                width: 100,
                sortable: true,
                dataIndex: 'name'
            }
        ];

        var config = {
            title:'Выделенные услуги',
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
                iconCls:'silk-pencil',
                text:'Изменить',
                handler:this.onChange.createDelegate(this,[])
            }],
            viewConfig : {
                forceFit : true
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.serviceadm.SelectedServiceGrid.superclass.initComponent.apply(this, arguments);

        this.on('render', function(){


        }, this);
    },

    onChange: function(){
        var record = this.getSelectionModel().getSelected();
        if (record) {
            this.fireEvent('openbaseservice',record);
        }
    }

});
