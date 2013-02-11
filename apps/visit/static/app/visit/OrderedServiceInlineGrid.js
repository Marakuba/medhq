Ext.ns('App.visit');


App.visit.OrderedServiceInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    loadInstant: false,

    preorders : new Ext.util.MixedCollection({}),

    initComponent : function() {

        this.shortMode = this.type=='material';

        this.deletedRecords = [];

        this.proxy = new Ext.data.HttpProxy({
            url: App.utils.getApiUrl('visit','servicebasket')
        });

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, [
            {name: 'id'},
            {name: 'order'},
            {name: 'service'},
            {name: 'service_name'},
            {name: 'staff'},
            {name: 'staff_name'},
            {name: 'staff_list'},
            {name: 'count', allowBlank: false},
            {name: 'price', allowBlank: false},
            {name: 'execution_place', allowBlank: false},
            {name: 'total'},
            {name: 'assigment'},
            {name: 'preorder'},
            {name: 'resource_uri'}
        ]);

        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        });

        this.store = new Ext.data.Store({
            autoSave:false,
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
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer,
            listeners:{
                add:this.onSumChange.createDelegate(this),
                remove:this.onSumChange.createDelegate(this),
                clear:this.onSumChange.createDelegate(this),
//              load:this.onSumChange.createDelegate(this),
                exception: function(){
                    this.fireEvent('basketexception');
                },
                scope:this
            },
            doTransaction : function(action, rs, batch) {
                function transaction(records) {
                    try{
                        this.execute(action, records, undefined, batch);
                    }catch (e){
                        this.handleException(e);
                    }
                }
                this.batch=true;
                transaction.call(this, rs);
            }
        });

        this.delAllBtn = new Ext.Button({
            iconCls:'silk-delete',
            text:'Удалить все',
            disabled:this.record,
            handler:this.delAllRow.createDelegate(this)
        });

        this.staffStore = new Ext.data.Store({
            autoDestroy:true,
            proxy: new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('staff','position'),
                method:'GET'
            }),
            reader: new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                idProperty: 'id',
                root: 'objects'
            }, [
                {name: 'id'},
                {name: 'staff_name', mapping:'text'}
            ])
        });
        this.columns =  [new Ext.grid.RowNumberer({width: 30}),
            {
                header: "МВ",
                width: 3,
                css:'padding:0px!important;',
                dataIndex: 'execution_place',
                renderer: function(val) {
                    colors = {
                        "5":"black",
                        "1":"green",
                        "7":"green",
                        "4":"red",
                        "6":"green"
                    };
                    var s = val.split('/');
                    return String.format("<span style='font-weight:bolder;font-size:19px;padding:3px 0 0 3px;color:{0}'>+</span>", colors[s[s.length-1]]);
//                  return "<img src='"+MEDIA_URL+"resources/images/state_"+s[s.length-1]+".png'>"
                }
            },{
                header: "Услуга",
                width: 50,
                sortable: true,
                dataIndex: 'service_name'
            },{
                hidden:true,
                dataIndex: 'preorder'
            },{
                header: "Врач",
                width: 30,
                hidden: this.shortMode,
                sortable: true,
                dataIndex: 'staff_name',
                renderer: function(val) {
                    return val; //? val.staff_name : '';
                }
            },{
                header: "Кол-во",
                width: 10,
                sortable: false,
                hidden: this.shortMode,
                dataIndex: 'count',
                editor: new Ext.ux.form.SpinnerField({
                    minValue: 1,
                    maxValue: 20
                })
            },{
                header: "Цена",
                width: 10,
                sortable: false,
                hidden: this.shortMode,
                dataIndex: 'price'
            },{
                header: "Сумма",
                width: 10,
                sortable: false,
                hidden: this.shortMode,
                dataIndex: 'total',
                renderer: function(v,params,rec){
                    return rec.data.count*rec.data.price;
                }
            }
        ];

        this.undoBtn = new Ext.Button({
            text:'Назад',
            disabled:true,
            scope:this,
            handler:function(){
                this.fireEvent('undo');
            }
        });

        this.redoBtn = new Ext.Button({
            text:'Вперед',
            disabled:true,
            scope:this,
            handler:function(){
                this.fireEvent('redo');
            }
        });

        this.delBtn = new Ext.Button({
            iconCls:'silk-delete',
            text:'Удалить',
            disabled:true,
            handler:this.delRow.createDelegate(this)
        });

        this.changeStaffBtn = new Ext.Button({
            text:'Изменить врача',
            disabled:true,
            handler:this.changeStaff.createDelegate(this)
        });

        var config = {
            id:'ordered-service-inline-grid',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            clicksToEdit:1,
            autoDestroy:true,
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : false,
                listeners: {
                    rowselect: function(sm,i,rec) {
                        this.delBtn.setDisabled(!rec.phantom);
                        if (sm.selections.items.length == 1){
                            this.changeStaffBtn.setDisabled(false);
                        } else {
                            this.changeStaffBtn.setDisabled(true);
                        }
                    },
                    rowdeselect: function(sm,i,rec) {
                        this.delBtn.setDisabled(true);
                        this.changeStaffBtn.setDisabled(true);
                    },
                    scope:this
                }
            }),
            tbar:[this.delBtn,this.delAllBtn,this.changeStaffBtn,this.undoBtn,this.redoBtn],
            viewConfig : {
                forceFit : true
                //getRowClass : this.applyRowClass
            },
            listeners:{
                afteredit:this.onSumChange.createDelegate(this),
                scope:this
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.OrderedServiceInlineGrid.superclass.initComponent.apply(this, arguments);
        WebApp.on('visitcreate', this.onVisitCreate, this);
        this.on('destroy', function(){
            WebApp.un('visitcreate', this.onVisitCreate, this);
        },this);
    },

    applyRowClass: function() {
        //TODO: сделать разные цвета для сохраненных, новых и отмененных записей
    },

    staffWindow: function(index, service){
        var t = Ext.getCmp('service-panel');
        var node = t.getNodeById(service);
        if(node){
            var sl = node.attributes.staff;
            // if(sl) {
                var win = new App.visit.StaffWindow({index:index, staffList:sl});
                win.on('validstaff', this.updateStaff, this);
                win.show();

            // }
        }
    },

    updateStaff: function(rec, id, staff_name){
        rec.beginEdit();
        rec.set('staff', App.utils.getApiUrl('staff', 'position', id));
        rec.set('staff_name',staff_name);
        rec.endEdit();
    },

    saveBasket: function(){
        this.store.save();
    },

    onSumChange: function(){
        var c = 0;
        this.store.each(function(item){
            c+=item.data.price*item.data.count;
        });
        this.fireEvent('sumchange',c);
    },

    addRecord: function(attrs){
//      var re = /(.*) \[\d+\]/;
//      var res = re.exec(attrs.text);
        var text = attrs.text;//res[res.length-1];
        var ids = attrs.id.split('-');
        var id = ids[0];
        var place = ids[1];
        var Service = this.store.recordType;
        var s = new Service({
            service:App.utils.getApiUrl('service','baseservice') + '/' + id,
            service_name:text,
            price:attrs.price,
            staff:attrs.staff_id ? App.utils.getApiUrl('staff','staff') + '/'+attrs.staff_id : null,
            staff_name:attrs.staff_name || '',
            count:attrs.c || 1,
            execution_place:App.utils.getApiUrl('state','state') + '/'+place
        });
        this.store.add(s);
        this.getView().focusRow(this.store.getCount()-1);
        this.fireEvent('editstore');
    },

    addRow: function(attrs, can_duplicate, callback, scope) {
        var ids = attrs.id.split('-');
        if(!can_duplicate) {
//          var re = /(.*) \[\d+\]/;
//          res = re.exec(attrs.text);
//          var text = res[res.length-1];
            var has_record = false;
            this.store.each(function(rec){
                var serv_id = App.utils.uriToId(rec.data.service);
                var ex_id = App.utils.uriToId(rec.data.execution_place);
                if ((serv_id == ids[0]) && (ex_id == ids[1])) {
                    has_record = true;
                    return 0;
                }
            });
            if (has_record) {
                if(callback) {
                    Ext.callback(callback,scope, [false]);
                }
                return false;
            }
        }
        // if(attrs.staff){
            var box = new App.visit.StaffWindow({
                state: ids[1],
                service: ids[0],
                height:300,
                width:400,
                service_name:attrs.text,
                fn:function(rec,opts){
                    if(rec) {
                        attrs.staff_id = rec.data.id;
                        attrs.staff_name = rec.data.staff_name;
                        this.addRecord(attrs);
                    }
                    if(callback) {
                        Ext.callback(callback,scope, [true]);
                    }
                    box.close();
                },
                scope:this
            });
            box.getStaff(ids[0], ids[1]);
        // } else {
        //     this.addRecord(attrs);
        //     if(callback) {
        //         Ext.callback(callback,scope, [true]);
        //     }
        // }
    },

    delRow: function() {
        records = this.getSelectionModel().getSelections();
        Ext.each(records,function(rec){
            if(rec.phantom) {
                this.store.remove(rec);
            }
        });
        this.fireEvent('action');
    },

    delAllRow: function() {
        this.store.removeAll();
        this.fireEvent('action');
    },

    changeStaff: function() {
        var rec = this.getSelectionModel().getSelected();
        var box = new App.visit.StaffWindow({
            service:App.utils.uriToId(rec.data.service),
            state:App.utils.uriToId(rec.data.execution_place),
            height:300,
            width:400,
            service_name:rec.data.service_name,
            fn:function(r){
                if(r) {
                    rec.beginEdit();
                    rec.set('staff',App.utils.getApiUrl('staff','position',r.data.id));
                    rec.set('staff_name',r.data.staff_name);
                    rec.endEdit();
                }
                box.close();
            },
            scope:this
        });
        box.show();
    },

    onSave: function() {
        if(this.record) {
            var records = this.store.queryBy(function(rec,id){
                return rec.data.order ? false : true;
            });
            var ps;
            records.each(function(item,idx,len){
                item.beginEdit();
                item.set('order', this.record.data.resource_uri);
                item.endEdit();
                var preorder = this.preorders.get(item.data.preorder);
                if (preorder) {
                    if(!ps) {
                        ps = preorder.store;
                        ps.autoSave = false;
                    }
                    preorder.set('visit',this.record.data.resource_uri);

                }
            }, this);
            if(ps){
                ps.save();
                ps.autoSave = true;
            }
            this.store.save();
        } else {
            Ext.MessageBox.alert('Ошибка','Не задана запись визита!');
        }
    },

    getSteps: function(){
        var steps = 0;
        var m = this.store.getModifiedRecords().length;
        var d = this.deletedRecords ? this.deletedRecords.length : 0;
        steps+=m;
        steps+=d;
        if (steps > 0) {
            steps = 1;
        }
        return steps;
    },

    onVisitCreate: function(record) {
        this.record = record;
        this.onSave();
    },

    setRecord: function(record){
        this.record = record;
        if (this.record) {
            this.delAllBtn.setDisabled(true);
            this.store.setBaseParam('order',this.record.id);
            this.store.load({callback:function(records){
                this.fireEvent('initcomplete');
            },scope:this});
        }
    }

});



Ext.reg('orderedserviceinlinegrid', App.visit.OrderedServiceInlineGrid);
