Ext.ns('App.examination', 'App.models');

App.examination.MedStandartGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('medstandart','medstandart'),
            model: App.models.MedStandartModel
        });

        this.columns =  [{
                header: "Наименование",
                width: 60,
                sortable: true,
                dataIndex: 'name'
            },{
                header: "Возрастная категория",
                width: 60,
                sortable: true,
                dataIndex: 'age_category_name'
            },{
                header: "Носологическая форма",
                width: 20,
                sortable: true,
                dataIndex: 'nosological_form_name'
            },{
                header: "Фаза",
                width: 20,
                sortable: true,
                dataIndex: 'phase_name'
            },{
                header: "Этап",
                width: 20,
                sortable: true,
                dataIndex: 'stage_name'
            },{
                header: "Осложнения",
                width: 20,
                sortable: true,
                dataIndex: 'complications_name'
            },{
                header: "Условие оказания",
                width: 20,
                sortable: true,
                dataIndex: 'terms_name'
            }];

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect:function(model,ind,rec) {
                        this.fireEvent('standartselect',rec.data.id);
                    },
                    rowdeselect: function() {
                    },
                    scope:this
                }
            }),
            listeners: {
            },
            viewConfig:{
                forceFit:true
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 100,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Показана запись {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            })
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.MedStandartGrid.superclass.initComponent.apply(this, arguments);


        this.on('afterrender',function(){
            if (this.icd10){
                this.store.setBaseParam('mkb10',this.mkb10)
            }
            this.store.load();
        })

    }


});



Ext.reg('medstandartgrid',App.examination.MedStandartGrid);
