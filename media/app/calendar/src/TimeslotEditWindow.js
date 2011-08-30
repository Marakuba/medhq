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
Ext.calendar.TimeslotEditWindow = Ext.extend(Ext.Window, {
	initComponent: function() {
    	this.formPanelCfg = new Ext.FormPanel({
	        //xtype: 'form',
    	    labelWidth: 65,
        	frame: false,
	        bodyStyle: 'background:transparent;padding:5px 10px 10px;',
    	    bodyBorder: false,
        	border: false,
        	bubbleEvents:['patientchoice'],
	        items: [{
    	        id: 'timeslot-title',
        	    name: Ext.calendar.EventMappings.Title.name,
            	fieldLabel: 'Заголовок',
	            xtype: 'textfield',
    	        anchor: '100%'
        	},{
        	    xtype: 'hidden',
            	name: 'StartDate'
	        },{
    	        xtype: 'hidden',
        	    name: 'EndDate'
	        },{
    	        xtype: 'hidden',
        	    name: 'CalendarId'
	        },{
    	        xtype: 'hidden',
        	    name: 'Vacant'
	        },{
    	        xtype: 'hidden',
        	    name: 'Preorder'
	        }]
    	});
    	this.preorderModel = new Ext.data.Record.create([
		    {name: 'id'},
		    {name: 'resource_uri'},
		    {name: 'patient'},
		    {name: 'timeslot'},
		    {name: 'comment'}
		]);

    	this.preorderStore = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('preorder'),
			model: this.preorderModel,
			listeners:{
				write:function(store, action, result, res, rs){
		    		console.log('Client created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
		    		if(action=='create') {
			    		this.preorder = rs
		    		}
				},
				scope:this
			}
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
    	    
        	this.formPanelCfg.add({
	            xtype: 'calendarpicker',
    	        id: 'timeslot-calendar',
        	    name: 'calendar',
            	anchor: '100%',
	            store: this.calendarStore
    	    });
    	};
    	
    	this.ttb = [{
    		xtype:'button',
			iconCls:'silk-accept',
			text:'Выбрать пациента',
			handler:this.onChoice.createDelegate(this, [])
		},{
    		xtype:'button',
			iconCls:'silk-add',
			text:'Добавить пациента',
			handler:this.onAddPatient.createDelegate(this, [])
		},{
    		xtype:'button',
			iconCls:'silk-cancel',
			text:'Отменить предзаказ',
			handler:this.onClear.createDelegate(this, [])
		}
		];
    	
	    config = {
    	    titleTextAdd: 'Добавить событие',
        	titleTextEdit: 'Изменить событие',
	        width: 600,
    	    autocreate: true,
        	border: true,
	        closeAction: 'hide',
    	    modal: false,
        	resizable: false,
	        buttonAlign: 'left',
    	    savingMessage: 'Сохранение изменений...',
        	deletingMessage: 'Удаление события...',
        	
        	tbar: this.ttb,

	        fbar: [{
    	        xtype: 'tbtext',
        	    text: '<a href="#" id="tblink">Дополнительно...</a>'
	        },
    	    '->', {
        	    text: 'Сохранить',
            	disabled: false,
	            handler: this.onSave,
    	        scope: this
        	},
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
        	items: this.formPanelCfg
    	};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.calendar.TimeslotEditWindow.superclass.initComponent.apply(this, arguments);
        
        this.formPanelCfg.on('patientchoice',function(){
        	var patientWindow;
        	
        	var patientGrid = new App.calendar.PatientGrid({
        		scope:this,
        		fn:function(record){
        			var name = record.data.last_name+' '+record.data.first_name;
        			this.formPanel.form.findField('Title').setValue(name)
        			this.patient = record;
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
        },this)
    },

    // private
    afterRender: function() {
        Ext.calendar.TimeslotEditWindow.superclass.afterRender.call(this);

        this.el.addClass('ext-cal-event-win');

        Ext.get('tblink').on('click',
        function(e) {
            e.stopEvent();
            this.updateRecord();
            this.fireEvent('editdetails', this, this.activeRecord);
        },
        this);
        
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
            Ext.getCmp('timeslot-title').focus(false, 100);
        });
        //Ext.getCmp('delete-btn')[o.data && o.data[Ext.calendar.EventMappings.EventId.name] ? 'show': 'hide']();

        var rec,
        f = this.formPanel.getForm();
        this.preorder = undefined;

        if (o.data) {
            rec = o;
            this.isAdd = !!rec.data[Ext.calendar.EventMappings.IsNew.name];
            if (this.isAdd) {
                // Enable adding the default record that was passed in
                // if it's new even if the user makes no changes
                rec.markDirty();
                this.setTitle(this.titleTextAdd);
            }
            else {
                this.setTitle(this.titleTextEdit);
            }
            if (rec.data[Ext.calendar.EventMappings.Preorder.name]) {
            	this.preorderStore.setBaseParam('event',rec.data['resource_uri']);
            	this.preorderStore.load({callback:this.setPreorder,scope:this});
            }

            f.loadRecord(rec);
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
            Ext.getCmp('timeslot-calendar').setValue(rec.data[Ext.calendar.EventMappings.CalendarId.name]);
        };
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
        this.cleanup(true);
        this.fireEvent('eventcancel', this);
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

        f.updateRecord(this.activeRecord);
        this.activeRecord.set(M.StartDate.name, this.formPanel.form.findField('StartDate').getValue());
        this.activeRecord.set(M.EndDate.name, this.formPanel.form.findField('EndDate').getValue());
        //this.activeRecord.set(M.IsAllDay.name, dates[2]);
        this.activeRecord.set(M.CalendarId.name, this.formPanel.form.findField('calendar').getValue());
        if (this.staffStore) {
        	this.activeRecord.set(M.StaffId.name, this.formPanel.form.findField('staff').getValue());
        };
        this.activeRecord.set(M.Vacant.name, Ext.getCmp('timeslot-title').getValue()=='');
        this.activeRecord.set(M.Timeslot.name, true);
        var uri = this.activeRecord.data[M.ResourceURI.name];
        if (this.patient && uri){
        	if (this.preorder) {
        		this.preorder.set('patient',this.patient.data.resource_uri);
        		this.preorder.commit();
        	} else {
        		var record = new this.preorderModel();
        		record.set('patient',this.patient.data.resource_uri);
        		record.set('timeslot',uri);
        		this.preorderStore.add(record);
        	}
        }
    },
    
    setPreorder: function(records,opt,success){
		if (records) {
			var rec = records[0];
			this.preorder = rec
		}
	},

    // private
    onSave: function() {
        if (!this.formPanel.form.isValid()) {
            return;
        }
        
        this.updateRecord();

        if (!this.activeRecord.dirty) {
            this.onCancel();
            return;
        }

        this.fireEvent(this.isAdd ? 'eventadd': 'eventupdate', this, this.activeRecord);
    },

    // private
    onDelete: function() {
        this.fireEvent('eventdelete', this, this.activeRecord);
    },
    
    onAddPatient: function() {
        var patientWin = new App.patient.PatientWindow({
			//store:this.store,
			scope:this,
			fn:function(record){
				this.patient = record;
				var name = record.data.last_name+' '+record.data.first_name;
        		this.formPanel.form.findField('Title').setValue(name)
				
			}
		});
		patientWin.show();
		patientWin.on('savecomplete', function(){
			patientWin.close();
		},this);
    },
    
    onChoice: function() {
        var patientWindow;
        	
        	var patientGrid = new App.calendar.PatientGrid({
        		scope:this,
        		fn:function(record){
        			var name = record.data.last_name+' '+record.data.first_name;
        			this.formPanel.form.findField('Title').setValue(name)
        			this.patient = record;
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
    },
    
    onClear: function(){
    	
    }
});