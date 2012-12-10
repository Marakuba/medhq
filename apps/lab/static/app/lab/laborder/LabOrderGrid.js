Ext.ns('App.laboratory');

App.laboratory.LabOrderGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoSave : true,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('lab', 'laborder'),
            model: App.models.LabOrder
        });
//      this.store.setBaseParam('is_manual',false);

        this.fields = [
            ['start_date','visit__created__gte','Дата с','Y-m-d 00:00'],
            ['end_date','visit__created__lte','по','Y-m-d 23:59'],
            ['office','visit__office','Офис'],
            ['payer','visit__payer','Плательщик'],
            ['laboratory','laboratory','Лаборатория'],
            ['staff','staff','Врач'],
            ['patient','visit__patient','Пациент'],
            ['cito','visit__is_cito','Cito']
        ];

        this.columns =  [{
                id: 'order',
                header: "Заказ",
                width: 10,
                sortable: true,
                dataIndex: 'barcode',
                renderer:function(v,opts,rec) {
                    return String.format("<div><span style='font-weight:bold'>{0}</span>{3}<br><span>{1}</span><br><span>{2}</span></div>",
                            v, Ext.util.Format.date(rec.data.visit_created,'d.m.y'),
                            Ext.util.Format.date(rec.data.visit_created,'H:i'),
                            rec.data.send_to_email ? "<span class='silk-email' style='margin-left:4px;padding-left:16px;'>&nbsp;</span>" : "");
                }
            },{
                header: "Дата",
                width: 10,
                sortable: true,
                hidden:true,
                dataIndex: 'visit_created',
                renderer:Ext.util.Format.dateRenderer('d.m.Y')
            },{
                header: "Пациент",
                width: 38,
                sortable: true,
                dataIndex: 'patient_name',
                renderer:function(v,opts,rec) {
                    return String.format('<div>{0}<div style="color:red;font-weight:bold;text-align:right">{1}</div></div>',
                            v,
                            rec.data.visit_is_cito ? 'cito' : '');
                }
            },{
                id:'laboratory',
                header: "Офис / Оператор",
                width: 18,
                dataIndex: 'office_name',
                renderer:function(v,opts,rec) {
                    return String.format('<div style="{2}"><b>{0}</b>{3}<p>{1}</p></div>',
                            v,
                            rec.data.operator_name,
                            rec.data.is_manual ? 'background:#DDD;' : '',
                            rec.data.payer_name==v ? '' : '<p><em>'+rec.data.payer_name+'</em></p>');
                }
            },{
                id:'staff',
                header: "Лаб. / Врач",
                width: 16,
                dataIndex: 'staff_name',
                renderer:function(v,opts,rec) {
                    return String.format("<div><b>{0}</b><p>{1}</p><span>{2}</span></div>",
                            rec.data.laboratory_name, v, Ext.util.Format.date(rec.data.executed,'d.m.y'))
                }
            },{
                header: "Выполнено",
                width: 11,
                hidden:true,
                sortable: true,
                dataIndex: 'executed',
                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            }
        ];

        this.openBtn = new Ext.Button({
            text:'Открыть заказ',
            disabled:true,
            handler:this.onOpen.createDelegate(this, [this.laborderModeFunc]),
            scope:this
        });

        this.labs = new Ext.CycleButton({
            showText: true,
            prependText: 'Лаборатория: ',
            items: [{
                text:'любая',
                checked:true,
                filterValue:undefined
            }]
        });

        this.ttb = new Ext.Toolbar({
            items:[{
                text:'Фильтр',
                handler:function(){
                    this.searchWin = new App.laboratory.SearchWindow({
                        filterKey: 'lab-order-filters',
                        store:this.store,
                        fields:this.fields
                    });
                    this.searchWin.on('updatefilters', this.updateFilterStatus, this);
                    this.searchWin.show(this.getEl());
                },
                scope:this
            },{
                iconCls:'icon-clear-left',
                handler:function(){
                    Ext.state.Manager.getProvider().set('lab-order-filters', {});
                    this.updateFilters({});
                },
                hidden:true,
                scope:this
            },'-',{
                text:'Штрих-код',
                handler:this.printBarcode.createDelegate(this),
                scope:this
            },'->',new Ext.CycleButton({
                showText: true,
                prependText: 'Выполнено: ',
                items: [{
                    text:'все',
                    checked:true,
                    filterValue:undefined
                },{
                    text:'да',
                    iconCls:'icon-state-yes',
                    filterValue:true
                },{
                    text:'нет',
                    iconCls:'icon-state-no',
                    filterValue:false
                }],
                changeHandler:function(btn, item){
                    this.storeFilter('is_completed',item.filterValue);
                },
                scope:this
            })]
        });

        this.filterText = new Ext.Toolbar.TextItem({
            text:'Фильтры не используются'
        });

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border : false,
            store:this.store,
            stateful:false,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                        this.stopSelection = true;
                        this.fireEvent('orderselect', rec);
                    },
                    rowdeselect: function(sm, row, rec) {
                        this.fireEvent('orderdeselect', rec);
                    },
                    scope:this
                }
            }),
            tbar:this.ttb,
            listeners: {
//              rowdblclick:this.onOpen.createDelegate(this, [this.laborderModeFunc])
            },
            bbar: new Ext.PagingToolbar({
                pageSize: 100,
                store: this.store,
                displayInfo: true,
                displayMsg: '{0} - {1} | {2}',
                emptyMsg: "Нет записей",
                items:['-',this.filterText]
            }),
            view : new Ext.grid.GridView({
                forceFit : true,
                emptyText: 'Нет записей',
                getRowClass: function(record, index) {
                    var c = record.get('is_completed');
                    return c ? 'x-lab-complete' : 'x-lab-incomplete';
                }
            }),
            listeners:{
                scope:this,
                rowclick:{
                    fn:this.onServiceClick.createDelegate(this),
                    buffer:300,
                    scope:this
                }
            }
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.LabOrderGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('globalsearch', this.onGlobalSearch, this);
//      this.initLabs();
        this.on('afterrender', function() {
            var filters = Ext.state.Manager.getProvider().get('lab-order-filters');
            this.updateFilters(filters);
        }, this);
    },

    onServiceClick : function(grid,rowIndex,e){
        var rec = grid.getStore().getAt(rowIndex);
        var sel_rec = this.getSelectionModel().getSelected();
        if(!this.stopSelection){
            this.fireEvent('orderselect', rec);
        } else {
            this.stopSelection = false;
        }
    },

    printBarcode : function(){
        var rec = this.getSelected();
        if(rec){
            var win = new App.barcodepackage.DuplicateWindow({
                params:{
                    code:rec.data.barcode,
                    lat:rec.data.lat
                }
            });
            win.show();
        }
    },

    updateFilters : function(filters) {
        this.fireEvent('updatefilters');
        if(filters) {
            Ext.each(this.fields, function(field){
                if(filters[field[0]]) {
                    this.storeFilter(field[1], filters[field[0]][0], false);
                } else {
                    delete this.store.baseParams[field[1]];
                }
            }, this);
            this.updateFilterStatus(filters);
        }
        this.store.load();
    },

    updateFilterStatus : function(filters) {
        var filtersText = [];
        Ext.each(this.fields, function(field){
            if(filters[field[0]]) {
                filtersText.push(String.format("{0}: {1}", field[2], filters[field[0]][1]));
            }
        }, this);
        this.filterText[filtersText.length ? 'addClass' : 'removeClass']('x-filters-enabled');
        this.filterText.setText(filtersText.length ? String.format('{0}',filtersText.join(' ')) : 'Фильтры не используются');
        this.getTopToolbar().items.itemAt(1).setVisible(filtersText.length>0);
    },

    onOpen: function(f){
        var rec = this.getSelected();
        if(rec) {
            config = {
                labOrderRecord:rec,
                scope:this,
                fn:function(rec) {

                }
            }
            WebApp.fireEvent('launchapp', 'resultgrid', config);
        }
    },

    onGlobalSearch: function(v){
        var s = this.store;
        s.setBaseParam('search', v);
        s.load();
    },

    storeFilter: function(field, value, autoLoad){
        var autoLoad = autoLoad==undefined ? true : autoLoad;
        if(value==undefined) {
            delete this.store.baseParams[field]
        } else {
            this.store.setBaseParam(field, value);
        }
        if (autoLoad) {
            this.store.load();
        }
    },

    initLabs: function(){
        // laboratory
        Ext.Ajax.request({
            url:App.utils.getApiUrl('state','medstate'),
            method:'GET',
            success:function(resp, opts) {
                var jsonResponse = Ext.util.JSON.decode(resp.responseText);
                var items = [{
                    text:'любая',
                    checked:true,
                    filterValue:undefined
                }];
                Ext.each(jsonResponse.objects, function(item,i){
                    items.push({
                        filterValue:item.id,
                        text:item.name
                    });
                }, this);
                this.ttb.add(new Ext.CycleButton({
                    showText: true,
                    prependText: 'Лаборатория: ',
                    items: items,
                    changeHandler:function(btn, item){
                        this.storeFilter('laboratory',item.filterValue);
                    },
                    scope:this
                }));
                this.ttb.doLayout();
            },
            scope:this
        });

    },

    getSelected: function() {
        return this.getSelectionModel().getSelected()
    },

    onPrint: function() {
        var id = this.getSelected().data.id;
        var url = ['/lab/print/results',id,''].join('/');
        window.open(url);
    }


});



Ext.reg('labordergrid',App.laboratory.LabOrderGrid);
