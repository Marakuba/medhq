!(function(){

    Ext.ns('App.lab');

    App.lab.LabOrderGrid = Ext.extend(Ext.grid.GridPanel, {

        loadInstant: false,

        initComponent : function() {

            // Create a standard HttpProxy instance.
            this.proxy = new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('lab','laborder')
            });

            // Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
            this.reader = new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                //successProperty: 'success',
                idProperty: 'id',
                root: 'objects'
                //messageProperty: 'message'  // <-- New "messageProperty" meta-data
            }, [
                {name: 'id'},
                {name: 'created', allowBlank: false, type:'date'},
                {name: 'is_completed', allowBlank: false, type:'boolean'},
                {name: 'is_printed', allowBlank: false, type:'boolean'},
                {name: 'print_date', allowBlank: false, type:'date'},
                {name: 'send_to_email'},
                {name: 'barcode'},
                {name: 'manual_service'},
                {name: 'laboratory_name'},
                {name: 'staff_name'},
                {name: 'payer_name'}
            ]);

            // The new DataWriter component.
            this.writer = new Ext.data.JsonWriter({
                encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
            });

            this.store = new Ext.data.Store({
                id: 'laborder-store',
                baseParams: {
                    format:'json',
    //              is_manual:false
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
                width: 90,
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
                    header: "Лаборатория",
                    width: 130,
                    sortable: true,
                    dataIndex: 'laboratory_name'
                },{
                    header: "Исследование",
                    width: 170,
                    sortable: true,
                    dataIndex: 'manual_service'
                },{
                    width: 130,
                    sortable: true,
                    header:'Напечатано',
                    dataIndex: 'is_printed',
                    renderer: function(val,opts,rec) {
                        if(val){
                            time = Ext.util.Format.date(rec.data.print_date, 'd.m.y / H:i');
                            return String.format('{0}&nbsp;&nbsp;<img src="{1}admin/img/admin/icon-yes.gif">', time, WebApp.MEDIA_URL)
                        }
                    }
                },{
                    header: "Врач",
                    width: 160,
                    sortable: true,
                    dataIndex: 'staff_name'
                },{
                    header: "Плательщик",
                    width: 130,
                    sortable: true,
                    dataIndex: 'payer_name'
                }
            ];

            this.emailBtn = new Ext.Button({
                iconCls:'silk-email',
                text:'Отправить по email',
                disabled:true,
                handler:this.makeEmailTask.createDelegate(this)
            });

            var config = {
                loadMask : {
                    msg : 'Подождите, идет загрузка...'
                },
                title:'Результаты',
                border : false,
                store:this.store,
                columns:this.columns,
                sm : new Ext.grid.RowSelectionModel({
                            singleSelect : true,
                            listeners: {
                                rowselect:function(sm, i, rec){
                                    if(rec.data.is_completed){
                                        this.emailBtn.enable();
                                    }
                                },
                                rowdeselect: function(sm, i, rec){
                                    this.emailBtn.disable();
                                },
                                scope:this
                            }
                        }),
                tbar:[{
                    xtype:'button',
                    iconCls:'silk-printer',
                    text:'Печать',
                    handler:this.onPrint.createDelegate(this, [])
                },'-',{
                    xtype:'button',
                    iconCls:'app-pdf',
                    // text:'Печать',
                    handler:this.onPrint.createDelegate(this, ['pdf'])
                },'-', this.emailBtn],
                listeners: {
                    rowdblclick:this.onPrint.createDelegate(this, [])
                },
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: this.store,
                    displayInfo: true,
                    displayMsg: 'Показана запись {0} - {1} из {2}',
                    emptyMsg: "Нет записей"
                }),
                viewConfig : {
                    emptyText: 'Нет записей',
                    getRowClass : this.applyRowClass
                }

            };

            Ext.apply(this, Ext.apply(this.initialConfig, config));
            App.lab.LabOrderGrid.superclass.initComponent.apply(this, arguments);
        },

        makeEmailTask: function(){
            var rec = this.getSelected();
            if(!rec) { return; }
            if(!this.patientRecord.data.email) {
                Ext.MessageBox.prompt(
                    'Отсутствует email!',
                    'Введите корректный адрес электронной почты для пациента '+this.patientRecord.data.short_name,
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
                                    this._makeEmailTask(rec.data.id, text);
                                }
                            } else {
                                Ext.MessageBox.alert(
                                    'Предупреждение',
                                    'Отправка результатов будет произведена только после установки email в карточке пациента!'
                                );
                                this._makeEmailTask(rec.data.id);
                            }
                        }).call(this, btn, text);
                    },
                    this
                );
            } else {
                this._makeEmailTask(rec.data.id);
            }
        },

        _makeEmailTask: function(id, email){
            App.direct.lab.makeEmailTask(id, email, function(res){
                Ext.ux.Growl.notify({
                    title: res.success ? "Успешная операция" : "Ошибка",
                    message: res.message,
                    iconCls: res.success ? "x-growl-accept" : "x-growl-error",
                    alignment: "tr-tr",
                    offset: [-10, 10]
                });
            });
        },

        applyRowClass : function(record, index){
            if(record.data.is_completed){
                return "x-grid-row-normal";
            }
            return "";
        },

        setActivePatient: function(rec) {
            id = rec.id;
            this.patientId = id;
            this.patientRecord = rec;
            var s = this.store;
            s.setBaseParam('visit__patient', id);
            s.load();
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



    Ext.reg('cardlabordergrid',App.lab.LabOrderGrid);


    if(!window['PatientCard']){
        window['PatientCard'] = [];
    }
    window.PatientCard.push(['cardlabordergrid', {}, 1]);

})();