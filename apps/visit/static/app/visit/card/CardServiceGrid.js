!(function(){

    Ext.ns('App.visit');

    App.visit.CardServiceGrid = Ext.extend(Ext.grid.GridPanel, {

        loadInstant: false,

        initComponent : function() {

            this.proxy = new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('visit','orderedservice')
            });

            this.reader = new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                idProperty: 'id',
                root: 'objects'
            }, [
                {name: 'id'},
                {name: 'created', allowBlank: false, type:'date'},
                {name: 'service_name', allowBlank: false},
                {name: 'price', allowBlank: false},
                {name: 'barcode'},
                {name: 'laboratory'},
                {name: 'visit_id', allowBlank: true},
                {name: 'staff', convert:function(v,rec){
                    return v ? v.name : '---';
                }}
            ]);

            this.writer = new Ext.data.JsonWriter({
                encode: false
            });

            this.store = new Ext.data.GroupingStore({
                baseParams: {
                    format:'json'
                },
                paramNames: {
                    start : 'offset',  // The parameter name which specifies the start row
                    limit : 'limit',  // The parameter name which specifies number of rows to return
                    sort : 'sort',    // The parameter name which specifies the column to sort on
                    dir : 'dir'       // The parameter name which specifies the sort direction
                },
                groupField:'barcode',
                remoteSort: true,
                sortInfo:{
                    field: 'laboratory',
                    direction: "desc"
                },
                restful: true,     // <-- This Store is RESTful
                proxy: this.proxy,
                reader: this.reader,
                writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
            });


            this.columns =  [
                {
                    header: "Визит",
                    width: 50,
                    sortable: true,
                    dataIndex: 'barcode',
                    hidden:true
                },{
                    header:'Где выполняется',
                    width:30,
                    sortable:true,
                    dataIndex:'laboratory'
                },{
                    header: "Дата",
                    width: 50,
                    sortable: true,
                    dataIndex: 'created',
                    renderer:Ext.util.Format.dateRenderer('d.m.Y')
                },{
                    header: "Услуга",
                    width: 50,
                    sortable: true,
                    dataIndex: 'service_name'
                },{
                    header: "Врач",
                    width: 50,
                    sortable: true,
                    dataIndex: 'staff'
                },{
                    header: "Стоимость",
                    width: 50,
                    sortable: true,
                    // hidden: App.settings.strictMode,
                    dataIndex: 'price'
                }
            ];

            var config = {
                loadMask : {
                    msg : 'Подождите, идет загрузка...'
                },
                title: 'Оказанные услуги',
                border : false,
                store:this.store,
                columns:this.columns,
                sm : new Ext.grid.RowSelectionModel({
                            singleSelect : true
                        }),
                bbar: new Ext.PagingToolbar({
                    pageSize: 100,
                    store: this.store,
                    displayInfo: true,
                    displayMsg: 'Показана запись {0} - {1} из {2}',
                    emptyMsg: "Нет записей"
                }),
                view: new Ext.grid.GroupingView({
                    forceFit : true,
                    emptyText : 'Нет ни одной услуги'
                })

            };

            Ext.apply(this, Ext.apply(this.initialConfig, config));
            App.visit.CardServiceGrid.superclass.initComponent.apply(this, arguments);
        },

        setActivePatient: function(rec) {
            id = rec.id;
            this.patientId = id;
            var s = this.store;
            s.baseParams = {format:'json','order__patient': id};
            s.load();
        }


    });



    Ext.reg('cardservicegrid', App.visit.CardServiceGrid);

    if(!window['PatientCard']){
        window['PatientCard'] = [];
    }
    window.PatientCard.push(['cardservicegrid', {}]);

})();