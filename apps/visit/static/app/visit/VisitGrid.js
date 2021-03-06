Ext.ns('App.visit');



App.visit.VisitGrid = Ext.extend(Ext.grid.GridPanel, {

    loadInstant: false,

    initComponent : function() {

        this.proxy = new Ext.data.HttpProxy({
            url: App.utils.getApiUrl('visit','visit')
        });

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, App.models.Visit);

        this.writer = new Ext.data.JsonWriter({
            encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
        });
        this.baseParams = {
            format:'json'
        };
        this.store = new Ext.data.Store({
            baseParams: this.baseParams,
            paramNames: {
                start : 'offset',
                limit : 'limit',
                sort : 'sort',
                dir : 'dir'
            },
            restful: true,
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });

        // if(App.settings.strictMode) {
        //     this.store.setBaseParam('office',active_state_id);
        // }

        this.columns =  [{
                width: 8,
                sortable: false,
                dataIndex: 'cls',
                renderer: function(val) {
                    var icon;
                    switch (val) {
                        case 'п':
                                icon='UserSetup.png';
                                alt='Прием';
                                break;
                        case 'б':
                                icon='TestTubes.png';
                                alt='Поступление биоматериала';
                                break;
                    }
                    return "<img src='"+WebApp.MEDIA_URL+"resources/css/icons/"+icon+"' title='"+alt+"'>";
                }
            },{
                header: "№ заказа",
                width: 10,
                sortable: true,
                dataIndex: 'barcode_id'
            },{
                header: "Дата",
                width: 15,
                sortable: true,
                dataIndex: 'created',
                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            },{
                header: "Пациент",
                width: 50,
                sortable: true,
                dataIndex: 'patient_name'
            },{
                header: "Сумма, руб.",
                width: 30,
                sortable: true,
                dataIndex: 'total_price',
                renderer: function(v,params,rec){
                    if(rec.data.cls=='б'){
                        return "---";
                    }
                    return v-(rec.data.discount_value*v/100);
                }
            },{
                header: "Скидка, %",
                width: 10,
                sortable: true,
                dataIndex: 'discount_value',
                renderer: function(v,params,rec){
                    if(rec.data.cls=='б'){
                        return "---";
                    }
                    return v;
                }
            },{
                header: "Сумма скидки, руб.",
                width: 10,
                sortable: true,
                dataIndex: 'discount_value',
                renderer: function(val, params, rec) {
                    if(rec.data.cls=='б'){
                        return "---";
                    }
                    return rec.data.total_price*val/100;
                }
            },{
                header: "Кто направил",
                width: 30,
                sortable: true,
                dataIndex: 'referral_name'
            },{
                header: "Офис",
                width: 20,
                sortable: true,
                dataIndex: 'office_name'
            },{
                header: "Оператор",
                width: 20,
                sortable: true,
                dataIndex: 'operator_name'
            },{
                header: "Плательщик",
                width: 25,
                sortable: true,
                dataIndex: 'payer_name'
            }
        ];

        this.ttb = new Ext.Toolbar({
            items:[{
                xtype:'button',
                iconCls:'silk-printer',
                text:'Печать счета',
                handler:this.toPrint.createDelegate(this,['visit'])
            },'-',{
                text:'Печать заказа',
                handler:this.toPrint.createDelegate(this,['sampling'])
            },{
                text:'Печать штрих-кодов',
                handler:this.printBarcode.createDelegate(this,[])
            },'->','Период',{
                id:'visits-start-date-filter',
                xtype:'datefield',
                format:'d.m.Y',
                name:'start_date',
                listeners: {
                    select: function(df, date){
                        this.storeFilter('created__gte',date.format('Y-m-d 00:00'));
                    },
                    scope:this
                }
            },{
                id:'visits-end-date-filter',
                xtype:'datefield',
                format:'d.m.Y',
                name:'end_date',
                listeners: {
                    select: function(df, date){
                        this.storeFilter('created__lte',date.format('Y-m-d 23:59'));
                    },
                    scope:this
                }
            },{
                text:'Очистить',
                handler:function(){
                    Ext.getCmp('visits-start-date-filter').reset();
                    Ext.getCmp('visits-end-date-filter').reset();
                    this.storeFilter('created__lte',undefined);
                    this.storeFilter('created__gte',undefined);
                },
                scope:this
            },'-']
        });

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
            listeners: {
                rowdblclick:this.onPreview.createDelegate(this,[])
            },
            tbar:this.ttb,
            bbar: new Ext.PagingToolbar({
                pageSize: 20,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Показана запись {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            viewConfig : {
                forceFit : true
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.VisitGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);

        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);

        this.on('render',function(){
            this.store.load();
        }, this);

        // if(!App.settings.strictMode) {
            this.initToolbar();
        // }
    },


    initToolbar: function(){
        // laboratory
        Ext.Ajax.request({
            url:App.utils.getApiUrl('state','medstate'),
            method:'GET',
            success:function(resp, opts) {
                this.ttb.add({
                    xtype:'tbtext',
                    text:'Офис: '
                });
                this.ttb.add({
                    xtype:'button',
                    enableToggle:true,
                    toggleGroup:'ex-place-cls',
                    text:'Все',
                    pressed: true,
                    handler:this.storeFilter.createDelegate(this,['office'])
                });
                var jsonResponse = Ext.util.JSON.decode(resp.responseText);
                Ext.each(jsonResponse.objects, function(item,i){
                    this.ttb.add({
                        xtype:'button',
                        enableToggle:true,
                        toggleGroup:'ex-place-cls',
                        text:item.name,
                        handler:this.storeFilter.createDelegate(this,['office',item.id])
                    });
                }, this);
                //this.ttb.addSeparator();
                //this.ttb.add();
                //this.ttb.add()
                this.ttb.doLayout();
            },
            scope:this
        });
    },

    storeFilter: function(field, value){
        if(!value) {
            delete this.store.baseParams[field];
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load();
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected();
    },

    getAbsoluteUrl: function(id) {
        return "/visit/visit/"+id+"/";
    },

    toPrint:function(slug){
        var rec = this.getSelected();
        if(rec){
            var url = String.format('/visit/print/{0}/{1}/',slug,rec.id);
            window.open(url);
        }
    },

    goToSlug: function(slug) {
        var s = this.getSelected().data.id;
        var url = this.getAbsoluteUrl(s)+slug+"/";
        window.open(url);
    },

    onGlobalSearch: function(v){
        this.storeFilter('search', v);
    },

    printBarcode: function()
    {
        var bc_win;
        var record = this.getSelected();
        var visitId = record.id;
        bc_win = new App.barcode.PrintWindow({
            visitId:visitId,
            record:record
        });
        bc_win.show();
    },

    onPreview: function(){
        var visit = this.getSelected();
        var previewWindow = new Ext.Window({
            modal:true,
            closable:true,
            title:'Предпросмотр',
            height:600,
            layout:'fit',
            width:800,
            tbar:[{
                xtype:'button',
                iconCls:'silk-printer',
                text:'Печать счета',
                handler:this.toPrint.createDelegate(this,['visit'])
            },'-',{
                text:'Печать заказа',
                handler:this.toPrint.createDelegate(this,['sampling'])
            }],
            items:[{
                autoScroll:true,
                xtype:'panel',
                layout:'fit',
                autoLoad:String.format('/widget/visit/{0}/',visit.data.id)
            }]
        });

        previewWindow.show();
    }

});

Ext.reg('visitgrid', App.visit.VisitGrid);
