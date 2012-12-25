!(function(){

    Ext.ns('App.lab');

    App.lab.EmailTaskGrid = Ext.extend(Ext.grid.GridPanel, {

        loadInstant: false,

        initComponent : function() {

            this.proxy = new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('lab','emailtask')
            });

            this.reader = new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                idProperty: 'id',
                root: 'objects'
            }, [
                {name: 'id'},
                {name: 'created', type:'date', dateFormat:'c'},
                {name: 'modified', type:'date', dateFormat:'c'},
                {name: 'sent', type:'date', dateFormat:'c'},
                {name: 'resource_uri'},
                {name: 'status'},
                {name: 'patient_name'},
                {name: 'order_id'},
                {name: 'order_created'},
                {name: 'status_text'},
                {name: 'lab_order'}
            ]);

            this.writer = new Ext.data.JsonWriter({
                encode: false
            });

            this.store = new Ext.data.Store({
                autoLoad: true,
                autoSave: false,
                baseParams: {
                    format:'json'
                },
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

            this.statusBtn = new Ext.CycleButton({
                showText: true,
                prependText: 'Статус: ',
                items: [{
                    text:'все',
                    checked:true,
                    filterValue:undefined
                },{
                    text:'нет адреса',
                    filterValue:['noaddr']
                },{
                    text:'ожидание отправки',
                    filterValue:['ready','repeat']
                },{
                    text:'отправленные',
                    filterValue:['sent','resent']
                },{
                    text:'неудачная отправка',
                    filterValue:['failed']
                },{
                    text:'отмененные',
                    filterValue:['canceled']
                }],
                changeHandler:function(btn, item){
                    this.storeFilter('status__in',item.filterValue);
                    // this.manageBtn(item.filterValue);
                },
                scope:this
            });

            var stats = {
                noaddr: 'нет адреса',
                ready: 'готово к отправке',
                repeat: 'повторная отправка',
                sent: 'отправлено',
                resent: 'повторно отправлено',
                failed: 'неудачная отправка',
                canceled: 'отменено'
            };

            this.columns =  [{
                width:80,
                sortable:false,
                header: "№ заказа",
                dataIndex: 'order_id'
            },{
                header: "Дата",
                width: 70,
                sortable: false,
                renderer:Ext.util.Format.dateRenderer('d.m.y'),
                dataIndex: 'order_created'
            },{
                header: "Пациент",
                width: 400,
                sortable: false,
                dataIndex: 'patient_name'
            },{
                header: "Статус",
                width: 150,
                sortable: false,
                dataIndex: 'status',
                renderer:function(v){
                    return stats[v];
                }
            }];

            var config = {
                id:'app-email-task-grid',
                loadMask : {
                    msg : 'Подождите, идет загрузка...'
                },
                title:'Почта',
                closable:true,
                border : false,
                store:this.store,
                columns:this.columns,
                sm : new Ext.grid.RowSelectionModel({
                    singleSelect : true,
                    listeners:{
                        rowselect:this.onRowSelect.createDelegate(this),
                        rowdeselect:this.onRowDeselect.createDelegate(this),
                        scope:this
                    }
                }),
                tbar:[{
                    id:'email-task-send-now-btn',
                    iconCls: 'silk-email-go',
                    text:'Отправить сейчас',
                    disabled:true,
                    handler:this.sendEmailNow.createDelegate(this)
                },{
                    id:'email-task-cancel-btn',
                    iconCls: 'silk-email-delete',
                    text:'Отменить отправку',
                    disabled:true,
                    handler:this.setEmailStatus.createDelegate(this, ['canceled'])
                },{
                    // iconCls: 'silk-email-delete',
                    id:'email-task-repeat-btn',
                    text:'Повторная отправка',
                    disabled:true,
                    handler:this.setEmailStatus.createDelegate(this, ['repeat'])
                },{
                    id:'set-address-btn',
                    text:'Установить адрес',
                    disabled:true,
                    handler:this.setAddress.createDelegate(this)
                },'-',{
                    text:'История отправки',
                    handler:this.openHistory.createDelegate(this)
                },'-',{
                    xtype:'button',
                    iconCls:'silk-printer',
                    text:'Печать',
                    handler:this.onPrint.createDelegate(this, [])
                },'-', {
                    xtype:'button',
                    iconCls:'app-pdf',
                    // text:'Печать',
                    handler:this.onPrint.createDelegate(this, ['pdf'])
                },'->',this.statusBtn],
                listeners: {
                    rowdblclick:this.onPrint.createDelegate(this, [])
                },
                bbar: new Ext.PagingToolbar({
                    pageSize: 50,
                    store: this.store,
                    displayInfo: true,
                    displayMsg: 'Показана запись {0} - {1} из {2}',
                    emptyMsg: "Нет записей"
                }),
                viewConfig : {
                    // forceFit: true,
                    emptyText: 'Нет записей',
                    getRowClass : this.applyRowClass,
                    markDirty: false
                }

            };

            Ext.apply(this, Ext.apply(this.initialConfig, config));
            App.lab.EmailTaskGrid.superclass.initComponent.apply(this, arguments);
        },

        storeFilter: function(field, value){
            if(!value) {
                delete this.store.baseParams[field];
            } else {
                this.store.setBaseParam(field, value);
            }
            this.store.load();
        },

        openHistory: function(){
            var rec = this.getSelected();
            if(!rec) { return; }
            var win = new App.lab.EmailHistoryWindow({
                labOrderId:App.utils.uriToId(rec.data.lab_order),
                barcodeId:rec.data.order_id
            });
            win.show();
        },

        setButtons: function(rec){
            var nowBtn = Ext.getCmp('email-task-send-now-btn');
            var cancelBtn = Ext.getCmp('email-task-cancel-btn');
            var repeatBtn = Ext.getCmp('email-task-repeat-btn');
            var setBtn = Ext.getCmp('set-address-btn');
            if(rec.data.status=='ready' || rec.data.status=='repeat'){
                nowBtn.enable();
                cancelBtn.enable();
            } else {
                if(rec.data.status!='noaddr'){
                    repeatBtn.enable();
                } else {
                    setBtn.enable();
                }
            }
        },

        resetButtons: function(rec) {
            var nowBtn = Ext.getCmp('email-task-send-now-btn');
            var cancelBtn = Ext.getCmp('email-task-cancel-btn');
            var repeatBtn = Ext.getCmp('email-task-repeat-btn');
            var setBtn = Ext.getCmp('set-address-btn');
            nowBtn.disable();
            cancelBtn.disable();
            repeatBtn.disable();
            setBtn.disable();
        },

        onRowSelect: function(sm, idx, rec){
            this.setButtons(rec);
        },

        onRowDeselect: function(sm, idx, rec){
            this.resetButtons();
        },

        setAddress: function(){
            var rec = this.getSelected();
            if(!rec) { return; }

            Ext.MessageBox.prompt(
                '',
                'Введите корректный адрес электронной почты для пациента '+rec.data.patient_name,
                function(btn, text){
                    var email = /^(\w+)([\-+.][\w]+)*@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/;
                    (function(btn, text){
                        if(btn=='ok'){
                            if(!email.test(text)){
                                Ext.MessageBox.prompt(
                                    'Ошибка!',
                                    String.format('Введенное значение "{0}" не является корректным адресом!', text),
                                    arguments.callee,
                                    this,
                                    false,
                                    text
                                );
                            } else {
                                App.direct.lab.setAddress(rec.data.id, text, function(res){
                                    rec.set('status', res.status);
                                    this.resetButtons();
                                    this.setButtons(rec);
                                }, this);
                            }
                        } else {
                            Ext.MessageBox.alert(
                                'Предупреждение',
                                'Отправка результатов будет произведена только после установки email в карточке пациента!'
                            );
                        }
                    }).call(this, btn, text);
                },
                this
            );
        },

        setEmailStatus: function(status){
            var rec = this.getSelected();
            if(!rec) { return; }
            rec.set('status', status);
            this.store.save();
            this.resetButtons();
            this.setButtons(rec);
        },

        sendEmailNow: function(){
            var rec = this.getSelected();
            if(!rec) { return; }
            this.resetButtons();
            App.direct.lab.sendEmailNow(App.utils.uriToId(rec.data.lab_order), function(res, e){
            });
        },

        applyRowClass : function(record, index){
            if(record.data.is_completed){
                return "x-grid-row-normal";
            }
            return "";
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
        }

    });



    Ext.reg('labemailtaskgrid', App.lab.EmailTaskGrid);


    App.webapp.actions.add('labemailtaskgrid', new Ext.Action({
        text: 'Почта',
        scale: 'medium',
        handler: function(){
            WebApp.fireEvent('launchapp','labemailtaskgrid');
        }
    }));


})();