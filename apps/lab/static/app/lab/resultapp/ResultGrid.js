Ext.ns('App.results');

App.results.Grid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.proxy = new Ext.data.HttpProxy({
            url: App.utils.getApiUrl('lab','laborder')
        });

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, [
            {name: 'id'},
            {name: 'created', allowBlank: false, type:'date'},
            {name: 'is_completed', allowBlank: false, type:'boolean'},
            {name: 'is_printed', allowBlank: false, type:'boolean'},
            {name: 'print_date', allowBlank: false, type:'date'},
            {name: 'visit_id'},
            {name: 'barcode'},
            {name: 'send_to_email'},
            {name: 'patient_name'},
            {name: 'office_name'},
            {name: 'laboratory_name'},
            {name: 'staff_name'},
            {name: 'payer_name'}
        ]);

        this.writer = new Ext.data.JsonWriter({
            encode: false
        });

        this.baseParams = { format:'json' };

        this.store = new Ext.data.Store({
            autoLoad:false,
            baseParams: this.baseParams,
            paramNames: {
                start : 'offset',  // The parameter name which specifies the start row
                limit : 'limit',  // The parameter name which specifies number of rows to return
                sort : 'sort',    // The parameter name which specifies the column to sort on
                dir : 'dir'       // The parameter name which specifies the sort direction
            },
            restful: true,     // <-- This Store is RESTful
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
        });

        // if(App.settings.strictMode) {
        //     this.store.setBaseParam('visit__office',active_state_id);
        // }

        this.store.load();

        this.columns =  [{
                width:25,
                sortable:false,
                renderer:function(val, opts, rec) {
                    var cls;
                    if(rec.data.send_to_email){
                        cls = 'silk-'+rec.data.send_to_email;
                    }
                    return String.format('<div class="{0}" style="width:20px;height:16px;"></div>', cls);
                }
            },{
                header: "№ заказа",
                width: 70,
                sortable: false,
                dataIndex: 'is_completed',
                renderer: function(val, opts, rec) {
                    var cls = val ? "cell-completed-icon" : "";
                    return String.format('<div class="{0}" style="pagging-left:18px;text-indent:16px;">{1}</div>',cls,rec.data.barcode);
                }
            },{
                header: "Дата",
                width: 70,
                sortable: true,
                dataIndex: 'created',
                renderer:Ext.util.Format.dateRenderer('d.m.y'),
                editor: new Ext.form.TextField({})
            },{
                header: "Пациент",
                width: 220,
                sortable: true,
                dataIndex: 'patient_name'
            },{
                header: "Офис",
                width: 135,
                sortable: true,
                dataIndex: 'office_name'
            },{
                header: "Лаборатория",
                width: 125,
                sortable: true,
                dataIndex: 'laboratory_name'
            },{
                header: "Врач",
                width: 130,
                sortable: true,
                dataIndex: 'staff_name'
            },{
                header: "Плательщик",
                width: 110,
                sortable: true,
                dataIndex: 'payer_name'
            },{
                width: 115,
                sortable: true,
                header:'Напечатано',
                dataIndex: 'is_printed',
                renderer: function(val,opts,rec) {
                    if(val){
                        time = Ext.util.Format.date(rec.data.print_date, 'd.m.y / H:i');
                        return String.format('{0}&nbsp;&nbsp;<img src="{1}resources/images/icon-yes.gif">', time, WebApp.MEDIA_URL)
                    }
                }
            }
        ];

        this.ttb =  new Ext.Toolbar({
            items:[{
                xtype:'button',
                iconCls:'silk-printer',
                text:'Печать',
                handler:this.onPrint.createDelegate(this, [])
            },'-', {
                xtype:'button',
                iconCls:'app-pdf',
                // text:'Печать',
                handler:this.onPrint.createDelegate(this, ['pdf'])
            }/*,'->','Период',{
                id:'visits-start-date-filter',
                xtype:'datefield',
                format:'d.m.Y',
                name:'start_date',
                listeners: {
                    select: function(df, date){
                        this.storeFilter('visit__created__gte',date.format('Y-m-d 00:00'));
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
                        this.storeFilter('visit__created__lte',date.format('Y-m-d 23:59'));
                    },
                    scope:this
                }
            },{
                text:'Очистить',
                handler:function(){
                    Ext.getCmp('visits-start-date-filter').reset();
                    Ext.getCmp('visits-end-date-filter').reset();
                    this.storeFilter('visit__created__lte',undefined);
                    this.storeFilter('visit__created__gte',undefined);
                },
                scope:this
            },'-'*/
            ]});

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
            tbar:this.ttb,
            listeners: {
                rowdblclick:this.onPrint.createDelegate(this, [])
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 100,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Показана запись {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            viewConfig : {
//              forceFit : true,
                emptyText: 'Нет записей',
                getRowClass : this.applyRowClass
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.results.Grid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);

        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);

//      this.initToolbar();
    },

    applyRowClass : function(record, index){
        // x-grid-row-normal
        if(record.data.is_completed){
            return "x-grid-row-normal";
        }
        return "";
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

    onPrint: function(format) {
        var rec = this.getSelected();
        if(!rec) { return; }
        var id = rec.data.id;
        format = format ? '?format='+format : '';
        var url = String.format('/lab/print/results/{0}/{1}', id, format);
        window.open(url);
    },

    onGlobalSearch: function(v){
        this.storeFilter('search', v);
    },

    initToolbar: function(){
        // laboratory
        Ext.Ajax.request({
            url:App.utils.getApiUrl('state','medstate'),
            method:'GET',
            success:function(resp, opts) {
                this.ttb.add({
                    xtype:'tbtext',
                    text:'Лаборатория: '
                });
                this.ttb.add({
                    xtype:'button',
                    enableToggle:true,
                    toggleGroup:'ex-place-cls',
                    text:'Все',
                    pressed: true,
                    handler:this.storeFilter.createDelegate(this,['laboratory'])
                });
                var jsonResponse = Ext.util.JSON.decode(resp.responseText);
                Ext.each(jsonResponse.objects, function(item,i){
                    this.ttb.add({
                        xtype:'button',
                        enableToggle:true,
                        toggleGroup:'ex-place-cls',
                        text:item.name,
                        handler:this.storeFilter.createDelegate(this,['laboratory',item.id])
                    });
                }, this);
                //this.ttb.addSeparator();
                //this.ttb.add();
                //this.ttb.add()
                this.ttb.doLayout();
            },
            scope:this
        });
    }

});



Ext.reg('resultsgrid',App.results.Grid);
