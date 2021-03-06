Ext.ns('App.examination');

/*
 *
 * plugin result:
 *
 * {
 *      section:'section_name',
 *      objects:[{
 *          type:'empty|servicetpl|currentcard|card|stafftpl|statetpl|service|',
 *          title:'title',
 *          modified:Date(),
 *          created:Date(),
 *          objectId:1
 *      }]
 *  }
 *
 */


App.examination.StaffTemplatePlugin = function(config, order){
    this.config = config || {};
    this.callback = this.config.callback;

    this.results = undefined;

    this.store = new Ext.data.RESTStore({
        autoSave: false,
        autoLoad : false,
        apiUrl : App.utils.getApiUrl('examination','examtemplate'),
        model: App.models.Template
    });
    this.store.load({
        params:{
            deleted:false,
            staff:WebApp.active_staff,
            base_service__isnull:true
        },
        callback:function(records, opts, success){
            if(success && records.length){
                this.results = {
                    section:'Мои шаблоны',
                    cls:'silk-add',
                    objects:[]
                }
                Ext.each(records, function(rec){
                    this.results.objects.push({
                        action:'copy',
                        type:'tpl',
                        title:rec.data.name,
                        objectId:rec.data.id
                    });
                }, this);
            }
            Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
        },
        scope:this
    })
};

App.examination.StateTemplatePlugin = function(config, order){
    this.config = config || {};
    this.callback = this.config.callback;

    this.results = undefined;

    this.store = new Ext.data.RESTStore({
        autoSave: false,
        autoLoad : false,
        apiUrl : App.utils.getApiUrl('examination','examtemplate'),
        model: App.models.Template
    });
    this.store.load({
        params:{
            deleted:false,
            base_service__isnull:true,
            staff__isnull:true
        },
        callback:function(records, opts, success){
            if(success && records.length){
                this.results = {
                    section:'Шаблоны клиники',
                    cls:'silk-add',
                    objects:[]
                }
                Ext.each(records, function(rec){
                    this.results.objects.push({
                        action:'copy',
                        type:'tpl',
                        title:rec.data.name,
                        objectId:rec.data.id
                    });
                }, this);
            }
            Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
        },
        scope:this
    })
};


App.examination.StartView = Ext.extend(Ext.grid.GridPanel, {

    dataPlugins : this.dataPlugins,

    plainResults : function(results){
        var r = [], result_order = [];
        for(idx in results){
            result_order.push(idx);
        }
        Ext.each(result_order.sort(), function(k){
            var res = results[k];
            if(res) {
                Ext.each(res.objects, function(obj,i){
                    obj.id = res.section+"_"+(i+1);
                    obj.section_name = res.section;
                    r.push(obj);
                });
            }
        });
        return r
    },

    pluginCallback : function(d, order){
        this.results[order] = d;
        this.steps-=1;
        if(this.steps==0){
            this.store.loadData(this.plainResults(this.results));
            this.getView().focusRow(0);
            this.getSelectionModel().selectFirstRow();
            this.fireEvent('loadcomplete', this);
        }
    },

    runPlugins : function(config){
        this.steps = this.dataPlugins.length;
        config.callback = this.pluginCallback;
        config.scope = this;
        Ext.each(this.dataPlugins, function(plugin,order){
            plugin(config,order);
        }, this)
    },

    results : {},

    initComponent : function() {

        /*
         * требуется запись из журнала заказов
         *
         * из неё обязательны поля: id, service
         *
         */

        this.addEvents('preview','copy','edit','empty','loadcomplete');

        this.store = new Ext.data.GroupingStore({
            autoSave:false,
            autoLoad:false,
            reader: new Ext.data.JsonReader({
                idProperty : 'id',
                fields     : ['id','section_name','type','title','action','objectId','cls'],
            }),
            remoteSort: true,
            groupField:'section_name'
        });

        var config = {
            autoScroll:true,
            store:this.store,
            border:false,
            bodyCssClass:'disabled-groups',
            bubbleEvents:['preview','copy','edit','empty','loadcomplete'],
            columns:[{
                dataIndex:'section_name',
                hidden:true
            },{
                dataIndex:'title',
                header:'Объект'
            }],
            hideHeaders:true,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : false,
                initEvents : function(){

                    if(!this.grid.enableDragDrop && !this.grid.enableDrag){
                        this.grid.on('rowmousedown', this.handleMouseDown, this);
                    }

                    this.rowNav = new Ext.KeyNav(this.grid.getGridEl(), {
                        up: this.onKeyPress,
                        down: this.onKeyPress,
                        enter : function(e, name){
                            var rec = this.getSelected();
                            this.fireEvent('onenter', rec);
                        },
                        scope: this
                    });

                    this.grid.getView().on({
                        scope: this,
                        refresh: this.onRefresh,
                        rowupdated: this.onRowUpdated,
                        rowremoved: this.onRemove
                    });
                },
                listeners : {
                    rowselect : function(sm,i,rec){
                        this.fireEvent('preview', rec.data.type, rec.data.objectId, rec.data)
                    },
                    onenter: function(rec){
                        this.fireEvent(rec.data.action, rec.data.type, rec.data.objectId);
                    },
                    scope:this
                }
            }),
            view : new Ext.grid.GroupingView({
                forceFit : true,
                emptyText: 'Нет записей',
                groupTextTpl: '{group}',
                headersDisabled:true,
                enableRowBody:true,
                getRowClass: function(record, index, p, store) {
//                  return record.data.action=='edit' ? 'x-grid-row-info' : ''
                },
                processEvent: function(name, e){
                    Ext.grid.GroupingView.superclass.processEvent.call(this, name, e);
                }
            }),
            listeners:{
                rowdblclick:function(grid,i,e){
                    var rec = grid.store.getAt(i);
                    this.fireEvent(rec.data.action, rec.data.type, rec.data.objectId);
                },
                keypress: function(e){
                    console.dir(e);
                },
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.StartView.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
            this.runPlugins({
                orderId:this.orderId,
                patientId:this.patientId,
                baseServiceId:this.baseServiceId,
            });
        },this)
    }

});

