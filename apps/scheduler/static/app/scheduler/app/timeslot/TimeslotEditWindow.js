/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.calendar.EventEditWindow
 * @extends Ext.Window
 * <p>A custom window containing a basic edit form used for quick editing of events.</p>
 * <p>This window also provides custom events specific to the calendar so that other calendar components can be easily
 * notified when an event has been edited via this component.</p>
 * @constructor
 * @param {Object} config The config object
 */
Ext.ns('Ext.calendar');
Ext.ns('App.visit');
Ext.ns('App.choices');
Ext.ns('App');
Ext.calendar.TimeslotEditWindow = Ext.extend(Ext.Window, {
    initComponent: function() {

        this.inlines = new Ext.util.MixedCollection({});

        /*this.preorderedService = new Ext.calendar.PreorderedServiceInlineGrid({
            //record:this.preorder,
            type:this.type,
            region:'south',
            height:200,
            margins:'0 0 5 5'
        });*/

        /*this.preorderedService.store.on('write', function(){
            this.popStep();
        }, this);*/

        this.patientFields = new Array("mobile_phone","email","birth_day");

        this.serviceStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave: false,
            apiUrl : App.utils.getApiUrl('service','extendedservice'),
            model: [
                    {name: 'id'},
                    {name: 'resource_uri'},
                    {name: 'service_name'},
                    {name: 'state_name'},
                    {name: 'state'},
                    {name: 'is_active'},
                    {name: 'price'}
                ]
        });

        this.patientStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : true,
            apiUrl : App.utils.getApiUrl('patient','patient'),
            model: [
                    {name: 'resource_uri'},
                    {name: 'short_name'},
                    {name: 'full_name'},
                    {name: 'mobile_phone'},
                    {name: 'email'},
                    {name: 'birth_day',type:'date',format:'d.m.Y'}
                ]
        });

        this.patientSelectedStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : true,
            apiUrl : App.utils.getApiUrl('patient','patient'),
            model: [
                    {name: 'resource_uri'},
                    {name: 'short_name'},
                    {name: 'full_name'},
                    {name: 'mobile_phone'},
                    {name: 'email'},
                    {name: 'birth_day',type:'date',format:'d.m.Y'}
                ]
        });

        this.freeTimeslotStore = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : true,
            apiUrl : App.utils.getApiUrl('scheduler','event'),
            model: [
                    {name: 'resource_uri'},
                    {name: 'start',type:'date',format:'c'},
                    {name: 'end',type:'date',format:'c'},
                    {name: 'status'},
                    {name: 'timeslot'},
                    {name: 'cid'},
                    {name: 'staff'}
                ]
        });

        this.serviceCombo = new Ext.form.LazyClearableComboBox({
            fieldLabel:'Услуга',
            disabled:true,
            anchor:'98%',
            store:this.serviceStore,
            queryParam:'base_service__name__icontains',
            displayField: 'service_name',
            listeners:{
                'render': function(f){
                    var el = f.getEl();
                    el.on('click',this.onServiceChoice.createDelegate(this, []),this);
                },
                'select':function(combo,record,index){
                    this.service = record.data.resource_uri;
                },
                scope:this
            },
            onTriggerClick:this.onServiceChoice.createDelegate(this, [])
        });

        this.patientCombo = new Ext.form.LazyComboBox({
            fieldLabel:'Пациент',
            name: 'patient',
            anchor:'98%',
            hideTrigger:true,
            allowBlank:false,
            autoSelect:false,
            store:this.patientStore,
            displayField: 'full_name',
            queryParam:'search',
            listeners:{
                'render': function(f){
                    var el = f.getEl();
                    el.on('click',this.onPatientChoice.createDelegate(this, []),this);
                },
                'select':function(combo,record,index){
                    this.formPanel.form.findField('Title').setValue(' ');
                    this.formPanel.form.findField('Status').setValue('з');
                    this.setPatient(record.data.resource_uri);
                    this.serviceCombo.enable();
                    this.serviceButton.setDisabled(false);
                    this.paymentTypeCB.enable();
                    this.tpl.overwrite(this.patientPanel.body,record.data);
//                  this.patientPanel.body.highlight('#c3daf9', {block:false})
                },
                scope:this
            },
            onTriggerClick:this.onPatientChoice.createDelegate(this, [])
        });


        this.preorderModel = App.models.Preorder;

        this.preorderStore = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('scheduler','preorder'),
            model: this.preorderModel
        });

        this.preorderStore.on('write', function(store, action, result, res, rs){
            if(action=='create') {
                this.preorder = rs;
                //WebApp.fireEvent('preordercreate',rs);
            }
            // App.calendar.eventManager.fireEvent('preorderwrite',rs);
        }, this);

        this.lockButton = new Ext.Button({
            text:'Заблокировать',
            disabled:false,
            handler:this.onLock.createDelegate(this, [])
        });

        this.clearButton = new Ext.Button({
            iconCls:'silk-cancel',
            text:'Отменить предзаказ',
            disabled:true,
            handler:this.onClear.createDelegate(this, [])
        });

        this.saveButton = new Ext.Button({
            text: 'Сохранить',
            disabled: false,
            handler: this.onSave.createDelegate(this,[]),
            scope: this
        });

        this.moveButton = new Ext.Button({
//          iconCls:'silk-cancel',
            text:'Перенести предзаказ',
            disabled:false,
            handler:this.onMovePreorder.createDelegate(this, [])
        });

        this.serviceButton = new Ext.Button({
            disabled:true,
            iconCls:'silk-accept',
            text:'Выбрать услугу',
            handler:this.onServiceChoice.createDelegate(this, [])
        });

        this.paymentTypeCB = new Ext.form.ComboBox({
            fieldLabel:'Форма оплаты',
            disabled:true,
            name:'payment_type',
            store:new Ext.data.ArrayStore({
                fields:['id','title'],
                data: [
                    ['н','Наличная оплата'],
                    ['б','Безналичный перевод'],
                    ['д','ДМС']]
            }),
            typeAhead: true,
            triggerAction: 'all',
            valueField:'id',
            displayField:'title',
            mode: 'local',
            forceSelection:true,
            selectOnFocus:true,
            editable:false,
            anchor:'98%',
            value:'н'
        });

        this.editorCfg = {
                    shadow: false,
                    completeOnEnter: true,
                    cancelOnEsc: true,
                    updateEl: true,
                    ignoreNoChange: true
                };

        this.patientEditor = new Ext.Editor(Ext.apply({
                alignment: 'l-l',
                field: {
                    allowBlank: true,
                    xtype: 'textfield',
                    width: 90,
                    selectOnFocus: true
                },
                listeners: {
                        complete: function(ed, value){
                            var fieldName = ed.boundEl.id;
                            this.patient.set(fieldName,value);
                            return true;
                        },
                        scope:this
                }
            }, this.editorCfg));

         this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                ' тел.: ','<span id="mobile_phone" class = "mobile_phone"> {mobile_phone:this.nullFormatter}</span>',
                ' email: ','<span id="email" class = "email">{email:this.nullFormatter}</span>',
                ' дата рождения: ','<span id="birth_day" class = "birth_day">','{birth_day:date("d.m.Y")}','</span>',
            '</tpl>',
            {nullFormatter: function(v)
                { return v ? v : 'не указано'; }
            }
        );

        this.dw =  new Ext.DataView({
            store: this.patientSelectedStore,
            //tpl: this.tpl,
            id:'patient-dw',
            autoHeight:true,
            multiSelect: true,
            //overClass:'x-view-over',
            //itemSelector:'div.thumb-wrap',
            emptyText: 'Нет данных',
            listeners:{
                'click':function(e,num, t){
                    if (t.id !== 'patient-dw') {
                        this.patientEditor.startEdit(t);
                    }
                },
            scope:this
            }
        });

        this.fieldSet = new Ext.Panel({
            baseCls:'x-border-layout-ct',
            labelWidth: 100,
            frame: false,
            region:'center',
            margins:'5 0 5 5',
            defaults:{
                anchor:'100%'
            },
            layout:'form',
            items:[
        {
           xtype: 'hidden',
           name: 'Title'
        },{
            xtype: 'datefield',
            hidden:true,
            name: 'StartDate',
            format:'d.m.Y'
        },{
           xtype: 'hidden',
           name: 'EndDate'
        },{
            xtype: 'hidden',
            name: 'CalendarId'
        },{
            xtype: 'hidden',
            name: 'Status'
        },{
            xtype: 'hidden',
            name: 'Preorder'
        },
        this.patientCombo,
        this.serviceCombo,
        this.paymentTypeCB,
        {
            xtype: 'textarea',
            fieldLabel:'Комментарий',
            name: 'comment'
        }

        ]});

        this.patientPanel = new Ext.Panel({
            id : this.id + 'patient-panel',
            region:'south',
            frame: false,
            html:'нет данных',
            bodyBorder: false,
            bodyStyle: 'background:transparent',
            listeners: {
                render: function(p) {
                    // Append the Panel to the click handler's argument list.
                    p.getEl().on('click', this.onPatientPanelClick.createDelegate(this, [p], true));
                },
                scope:this
            }
        });

        this.formPanelCfg = new Ext.FormPanel({
            layout:'border',
            bodyStyle: 'background:transparent;padding:5px 10px 10px;',
            bodyBorder: false,
            border: false,
            height:200,
            bubbleEvents:['patientchoice'],
            items: [this.fieldSet,this.patientPanel]
        });

        this.addEvents({
            /**
             * @event eventadd
             * Fires after a new event is added
             * @param {Ext.calendar.TimeslotEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was added
             */
            eventadd: true,
            /**
             * @event eventupdate
             * Fires after an existing event is updated
             * @param {Ext.calendar.TimeslotEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was updated
             */
            eventupdate: true,
            /**
             * @event eventdelete
             * Fires after an event is deleted
             * @param {Ext.calendar.TimeslotEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was deleted
             */
            eventdelete: true,
            /**
             * @event eventcancel
             * Fires after an event add/edit operation is canceled by the user and no store update took place
             * @param {Ext.calendar.TimeslotEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was canceled
             */
            eventcancel: true,
            /**
             * @event editdetails
             * Fires when the user selects the option in this window to continue editing in the detailed edit form
             * (by default, an instance of {@link Ext.calendar.TimeslotEditForm}. Handling code should hide this window
             * and transfer the current event record to the appropriate instance of the detailed form by showing it
             * and calling {@link Ext.calendar.TimeslotEditForm#loadRecord loadRecord}.
             * @param {Ext.calendar.TimeslotEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The {@link Ext.calendar.EventRecord record} that is currently being edited
             */
            editdetails: true
        });

        this.formPanel = this.formPanelCfg;

        if (this.calendarStore) {

            this.calendarPicker = new Ext.calendar.CalendarPicker({
                name: 'calendar',
                hidden:true,
                fieldLabel:'Врач',
                anchor: '100%',
                store: this.calendarStore
            });

            this.fieldSet.add(this.calendarPicker);
        }

        this.ttb = new Ext.Toolbar({
            items:[{
                    xtype:'button',
                    iconCls:'silk-accept',
                    text:'Выбрать пациента',
                    handler:this.onPatientChoice.createDelegate(this, [])
                },{
                    xtype:'button',
                    iconCls:'silk-add',
                    text:'Добавить пациента',
                    handler:this.onAddPatient.createDelegate(this, [])
                },this.serviceButton,'->'
            ]
        });


        config = {
            titleTextAdd: 'Добавить событие',
            titleTextEdit: 'Изменить событие',
            width: 600,
            autocreate: true,
            border: true,
            //closeAction: 'hide',
            modal: true,
            resizable: false,
            buttonAlign: 'left',
            savingMessage: 'Сохранение изменений...',
            deletingMessage: 'Удаление события...',

            tbar: this.ttb,

            fbar: [this.lockButton,
            '->',this.moveButton, this.clearButton,'-',this.saveButton,
        /*{
            id: 'delete-btn',
            text: 'Удалить',
            disabled: false,
            handler: this.onDelete,
            scope: this,
            hideMode: 'offsets'
        },*/
            {
                text: 'Отмена',
                disabled: false,
                handler: this.onCancel,
                scope: this
            }],
            items:[this.formPanelCfg]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.calendar.TimeslotEditWindow.superclass.initComponent.apply(this, arguments);
//        this.servicePanel.on('serviceclick', this.onServiceClick, this);

        this.formPanelCfg.on('afterrender',function(form){

            var labelEditor = new Ext.Editor(Ext.apply({
                alignment: 'l-l',
                field: {
                    allowBlank: false,
                    xtype: 'textfield',
                    width: 90,
                    selectOnFocus: true
                }
            }, this.editorCfg));

            form.body.on('dblclick', function(e, t){
                labelEditor.startEdit(t);
            }, null, {
                delegate: 'label.x-form-item-label'
            });

        },this);

        /*this.formPanelCfg.on('patientchoice',function(){
            var patientWindow;

            var patientGrid = new App.calendar.PatientGrid({
                scope:this,
                fn:function(record){
                    var name = record.data.last_name+' '+record.data.first_name;
                    this.formPanel.form.findField('Title').setValue(' ')
                    this.patient = record;
                    this.dw.show();
                    patientWindow.close();
                }
            });

            patientWindow = new Ext.Window ({
                width:700,
                height:500,
                layout:'fit',
                title:'Пациенты',
                items:[patientGrid],
                modal:true,
                border:false
            });
            patientWindow.show();
        },this);*/

        this.formPanelCfg.on('servicechoice',function(){
            var serviceWindow;

            var serviceGrid = new App.calendar.serviceGrid({
                scope:this,
                fn:function(record){
                    this.serviceCombo.forceValue(record.data.resource_uri);
                    serviceWindow.close();
                }
            });

            serviceWindow = new Ext.Window ({
                width:700,
                height:500,
                layout:'fit',
                title:'Услуги клиники',
                items:[serviceGrid],
                modal:true,
                border:false
            });
            patientWindow.show();
        },this);
    },

    // private
    afterRender: function() {
        Ext.calendar.TimeslotEditWindow.superclass.afterRender.call(this);

        this.el.addClass('ext-cal-event-win');

        /*Ext.get('tblink').on('click',
        function(e) {
            e.stopEvent();
            this.updateRecord();
            this.fireEvent('editdetails', this, this.activeRecord);
        },
        this);*/

    },

    /**
     * Shows the window, rendering it first if necessary, or activates it and brings it to front if hidden.
     * @param {Ext.data.Record/Object} o Either a {@link Ext.data.Record} if showing the form
     * for an existing event in edit mode, or a plain object containing a StartDate property (and
     * optionally an EndDate property) for showing the form in add mode.
     * @param {String/Element} animateTarget (optional) The target element or id from which the window should
     * animate while opening (defaults to null with no animation)
     * @return {Ext.Window} this
     */
    show: function(o, animateTarget, vw) {
        // Work around the CSS day cell height hack needed for initial render in IE8/strict:
        var anim = (Ext.isIE8 && Ext.isStrict) ? null: animateTarget;

        Ext.calendar.TimeslotEditWindow.superclass.show.call(this, anim,
        function() {
//            this.titleField.focus(false, 100);
        });
        //Ext.getCmp('delete-btn')[o.data && o.data[Ext.calendar.EventMappings.EventId.name] ? 'show': 'hide']();

        var rec,
        f = this.formPanel.getForm();
        this.preorder = undefined;
        this.patient = undefined;


        this.serviceStore.setBaseParam('staff',this.staff_id);
        this.serviceStore.setBaseParam('is_active',true);
//        this.serviceStore.load();

        var today = new Date();

        if (o.data) {
            rec = o;
            this.freeTimeslotStore.setBaseParam('cid',rec.data.CalendarId);
            this.isAdd = !!rec.data[Ext.calendar.EventMappings.IsNew.name];
            this.patientStore.on('load',function(store,records,obj){
                if (records.length){
                    this.tpl.overwrite(this.patientPanel.body,records[0].data);
                }
            },this,{single:true});
            if (this.isAdd) {
                // Enable adding the default record that was passed in
                // if it's new even if the user makes no changes
                rec.markDirty();
                this.setTitle(this.titleTextAdd);
            }
            else {
                this.setTitle(this.titleTextEdit);
            }
            this.preorderStore.setBaseParam('timeslot',App.utils.uriToId(rec.data['ResourceURI']));
            this.preorderStore.load({callback:this.setPreorder,scope:this});

            f.loadRecord(rec);
            if(rec.data.Status == 'б' || rec.data.Status == 'о' || (rec.data.StartDate < today && rec.data.Status != 'з')){
                this.lockForm();
            }
            if (rec.data.Status != 'б' && (rec.data.Status != 'с' || rec.data.StartDate < today)){
                    this.lockButton.setDisabled(true);
            }
            //this.getForm().findField('start').originalValue = o.data['start']
        }
        else {
            this.isAdd = true;
            this.setTitle(this.titleTextAdd);

            var M = Ext.calendar.EventMappings,
            eventId = M.EventId.name,
            start = o[M.StartDate.name],
            end = o[M.EndDate.name] || start.add('h', 1);

            rec = new Ext.calendar.EventRecord();
            //rec.data[M.EventId.name] = this.newId++;
            rec.data[M.StartDate.name] = start;
            rec.data[M.EndDate.name] = end;
            //rec.data[M.IsAllDay.name] = !!o[M.IsAllDay.name] || start.getDate() != end.clone().add(Date.MILLI, 1).getDate();
            rec.data[M.IsNew.name] = true;

            f.reset();
            f.loadRecord(rec);
        }

        if (this.calendarStore) {
            this.calendarPicker.setValue(rec.data[Ext.calendar.EventMappings.CalendarId.name]);
        }
        if (this.staffStore) {
            Ext.getCmp('staff').setValue(rec.data[Ext.calendar.EventMappings.StaffId.name]);
        }
        //Ext.getCmp('date-range').setValue(rec.data);
        this.activeRecord = rec;
        return this;
    },

    // private
    roundTime: function(dt, incr) {
        incr = incr || 15;
        var m = parseInt(dt.getMinutes(), 10);
        return dt.add('mi', incr - (m % incr));
    },

    // private
    onCancel: function() {
        //this.cleanup(true);
        //this.fireEvent('eventcancel', this);
        this.close();
    },

    // private
    cleanup: function(hide) {
        if (this.activeRecord && this.activeRecord.dirty) {
            this.activeRecord.reject();
        }
        delete this.activeRecord;

        if (hide === true) {
            // Work around the CSS day cell height hack needed for initial render in IE8/strict:
            //var anim = afterDelete || (Ext.isIE8 && Ext.isStrict) ? null : this.animateTarget;
            this.hide();
        }
    },

    // private
    updateRecord: function() {
        var f = this.formPanel.form,
        //dates = Ext.getCmp('date-range').getValue(),
        M = Ext.calendar.EventMappings;
//        f.updateRecord(this.activeRecord);
//        this.activeRecord.set(M.StartDate.name, this.formPanel.form.findField('StartDate').getValue());
//        this.activeRecord.set(M.EndDate.name, this.formPanel.form.findField('EndDate').getValue());
//        //this.activeRecord.set(M.IsAllDay.name, dates[2]);
//        this.activeRecord.set(M.CalendarId.name, this.formPanel.form.findField('calendar').getValue());
//        if (this.staffStore) {
//          this.activeRecord.set(M.StaffId.name, this.formPanel.form.findField('staff').getValue());
//        };
////        this.activeRecord.set(M.vacant.name, this.formPanel.form.findField('Title')=='');
        var status = this.formPanel.form.findField('Status').getValue();
        this.activeRecord.set('Status',status);
//        this.activeRecord.set(M.Timeslot.name, true);

        var uri = this.activeRecord.data[M.ResourceURI.name];
        //Если мы выбрали пациента
        if (this.patient && uri){
            if (this.preorder) {
                //Если была нажата кнопка Отменить предзаказ
                if (this.setRemovePreorder) {
                    this.setRemovePreorder = false;
                    this.preorder.beginEdit();
//                      this.preorder.store.autoSave = false;
                    this.preorder.set('deleted',true);
                    this.preorder.set('rejection_cause',this.cause_uri);
//                  this.preorder.store.autoSave = true;
//                  this.preorder.store.save();
//                  this.preorder.commit();
                    this.preorder.endEdit();
                } else {
                    this.preorder.set('patient',this.patient.data.resource_uri);
                    this.preorder.set('service',this.serviceCombo.getValue());
                    this.preorder.set('payment_type',this.paymentTypeCB.getValue());
                    this.preorder.set('comment',this.formPanel.form.findField('comment').getValue());
                    this.preorder.commit();
                }
            } else {
                var record = new this.preorderModel();
                record.set('patient',this.patient.data.resource_uri);
                record.set('service',this.serviceCombo.getValue());
                record.set('payment_type',this.paymentTypeCB.getValue());
                record.set('comment',this.formPanel.form.findField('comment').getValue());
                record.set('timeslot',uri);
                var end = this.activeRecord.data[M.EndDate.name];
                var day = end.add('d',2);
                record.set('expiration', end);
                this.preorderStore.add(record);
            }
        } else {
            if (this.preorder){
                this.preorder.set('service',this.serviceCombo.getValue());
                this.preorder.set('payment_type',this.paymentTypeCB.getValue());
                this.preorder.set('comment',this.formPanel.form.findField('comment').getValue());
                //this.preorderStore.commitChanges();
                this.preorder.commit();
            }
        }
    },

    setPreorder: function(records,opt,success){
        if (records[0]) {
            this.preorder = records[0];
            this.clearButton.setDisabled(this.locked);
            this.moveButton.setDisabled(this.locked);
            this.serviceButton.setDisabled(false);
            if (this.preorder.data.service) {
                this.serviceCombo.forceValue(this.preorder.data.service);
                this.service = this.preorder.data.service;
            }
            this.patientCombo.setValue(records[0].data.patient);
            this.setPatient(records[0].data.patient);
            this.paymentTypeCB.setValue(this.preorder.data.payment_type);
            this.formPanel.form.findField('comment').setValue(this.preorder.data.comment);
            this.serviceCombo.enable();
            this.paymentTypeCB.enable();
        } else {
            this.clearButton.setDisabled(true);
            this.moveButton.setDisabled(true);
            this.serviceButton.setDisabled(true);
            this.serviceCombo.disable();
            this.paymentTypeCB.disable();
        }
    },

    // private
    onSave: function() {
        if (!this.patient || (this.patient.data.resource_uri != this.patientCombo.getValue())) {
            Ext.Msg.alert('Предупреждение!','Пациент не выбран или введён некорректно!');
            return false;
        } else {
            var serv = this.serviceCombo.getValue();
            if (serv && !this.service && !this.setRemovePreorder){
                Ext.Msg.alert('Предупреждение!','Выбрана некорректная услуга!');
                return false;
            }
        }
        //console.log('Dirty ',this.formPanel.form.isDirty());

        this.updateRecord();
        this.steps = this.getSteps();
        this.tSteps = this.steps;

        if(this.steps>0) {
            this.msgBox = Ext.MessageBox.progress('Подождите','Идет сохранение документа!');
        } else {
            //this.onClose(true);
            this.fireEvent(this.isAdd ? 'eventadd': 'eventupdate', this, this.activeRecord);
        }



//        if (!this.activeRecord.dirty) {
//            this.onCancel();
//            return;
//        }


    },

    // private
    onDelete: function() {
        this.fireEvent('eventdelete', this, this.activeRecord);
    },

    onAddPatient: function() {
        var patientWin = new App.patient.PatientWindow({
            scope:this,
            model:App.models.patientModel,
            fn:function(record){
                if (!record){
                    return 0;
                }
                this.setPatient(record.data.resource_uri);
                this.patientCombo.forceValue(record.data.resource_uri);
//              this.formPanel.form.findField('Title').setValue(' ');
                this.formPanel.form.findField('Status').setValue('з');
                this.serviceButton.setDisabled(false);
                this.serviceCombo.enable();
                this.paymentTypeCB.enable();

            }
        });
        patientWin.show();
        patientWin.on('savecomplete', function(){
            patientWin.close();
        },this);
    },

    onPatientChoice: function() {
        var patientWindow = new App.choices.PatientChoiceWindow({
            title:'Пациенты',
            scope:this,
            fn:function(record){
                if (!record){
                    return 0;
                }
                this.patientCombo.forceValue(record.data.resource_uri);
                this.formPanel.form.findField('Title').setValue(' ');
                this.formPanel.form.findField('Status').setValue('з');
                this.setPatient(record.data.resource_uri);
                this.serviceCombo.enable();
                this.paymentTypeCB.enable();
                this.serviceButton.setDisabled(false);
                patientWindow.close();
            }
         });
        patientWindow.show();
    },

    onClear: function(){
        var causeWin = new App.assignment.DeletePromptWindow({
            fn: function(cause_uri){
                if (!cause_uri) return false;
                this.cause_uri = cause_uri;
                if (this.preorder){
                    this.clearButton.setDisabled(true);
                    this.moveButton.setDisabled(true);
                    this.setRemovePreorder = true;
                    this.formPanel.form.findField('Title').setValue('');
                    this.formPanel.form.findField('Status').setValue('с');
                    this.onSave();
                }
            },
            scope:this
        });
        causeWin.show();

    },

    onMovePreorder: function(){
        var freeTimeslotWindow;

        var freeTimeslotGrid = new App.calendar.VacantTimeslotGrid({
            scope:this,
            store:this.freeTimeslotStore,
            fn:function(record){
                if (!record){
                    return false;
                }
                this.activeRecord.set('Status','с');
                this.preorder.set('timeslot',record.data.resource_uri);
                record.set('Status','з');
                this.activeRecord.store.load();
                freeTimeslotWindow.close();
                this.fireEvent(this.isAdd ? 'eventadd': 'eventupdate', this, this.activeRecord);
            }
         });

        freeTimeslotWindow = new Ext.Window ({
            width:700,
            height:500,
            layout:'fit',
            title:'Свободные часы работы',
            items:[freeTimeslotGrid],
            modal:true,
            border:false
        });
        freeTimeslotWindow.show();
    },

    setPatient : function(patient_uri){
        if (!patient_uri){
            return 0;
        }
        this.patientSelectedStore.setBaseParam('id',App.utils.uriToId(patient_uri));
        this.patientSelectedStore.load(
            {
                callback: function(records){
                    if (records.length){
                        this.patient = records[0];
                    }
                },
                scope:this
            });
    },

    popStep: function() {
        this.steps-=1;
        if(this.msgBox) {
            var progress = (this.tSteps-this.steps) / this.tSteps;
            this.msgBox.updateProgress(progress);
        }
        if(this.steps===0) {
            if(this.msgBox) {
                this.msgBox.hide();
            }
            //this.onClose(true);
            this.fireEvent(this.isAdd ? 'eventadd': 'eventupdate', this, this.activeRecord);
        }
    },

    getSteps : function() {
        var steps = 0;

        this.inlines.each(function(inline,i,l){
            var s = inline.getSteps();
            steps+=s;
        });
        return steps;
    },

    onServiceChoice : function() {
        var serviceWindow;
        var ptype = this.paymentTypeCB.getValue();
        ptype_ind = this.paymentTypeCB.store.find('id',ptype);
        ptype_title = this.paymentTypeCB.store.getAt(ptype_ind).data.title;
        var on_date = this.formPanel.getForm().findField('StartDate').getValue();
        this.serviceStore.setBaseParam('payment_type',ptype);
        this.serviceStore.setBaseParam('on_date',on_date);

        var serviceGrid = new App.calendar.ServiceChoiceGrid({
            scope:this,
            store:this.serviceStore,
            ptype_title: ptype_title,
            fn:function(record){
                this.serviceCombo.forceValue(record.data.resource_uri);
                this.service = record.data.resource_uri;
                serviceWindow.close();
            }
         });

        serviceWindow = new Ext.Window ({
            width:800,
            height:500,
            layout:'fit',
            title:'Услуги клиники',
            items:[serviceGrid],
            modal:true,
            border:false
        });
        serviceWindow.show();
    },

    onPatientPanelClick : function(a,p,c) {
        if (!p.classList.length){
            return false;
        }
        var g = p.classList[0];
        for(var i = 0; i < this.patientFields.length; i++) {
            if (g == this.patientFields[i]){
                this.patientEditor.startEdit(p);
            }
        }
    },

    onLock: function(){
        var status = this.formPanel.form.findField('Status').getValue();
        if (status == 'с'){
            this.activeRecord.set('Status','б');
        } else if (status == 'б'){
            this.activeRecord.set('Status','с');
        }
        this.activeRecord.store.load();
        this.fireEvent('eventupdate', this, this.activeRecord);
    },

    lockForm: function(){
        this.formPanel.disable();
        this.ttb.disable();
        this.saveButton.setDisabled(true);
        this.lockButton.setText('Разблокировать');
        this.locked = true;
    }
});
