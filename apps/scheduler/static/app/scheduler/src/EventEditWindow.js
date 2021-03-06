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
Ext.calendar.EventEditWindow = Ext.extend(Ext.Window, {
    initComponent: function(){
    	this.startHour = this.startHour ? this.startHour : 0;
		this.endHour = this.endHour ? this.endHour : 23;
		
		this.titleField = new Ext.form.TextField({
			name: Ext.calendar.EventMappings.Title.name,
			fieldLabel: 'Заголовок',
			anchor: '100%'
		});
		this.dateRangeField = new Ext.calendar.DateRangeField({
			startHour: this.startHour,
			endHour: this.endHour,
			anchor: '100%',
	        fieldLabel: 'Когда'
		});
		
	    this.formPanelCfg = new Ext.form.FormPanel({
	        xtype: 'form',
	        labelWidth: 65,
	        frame: false,
	        bodyStyle: 'background:transparent;padding:5px 10px 10px;',
	        bodyBorder: false,
	        border: false,
	        items: [this.titleField, this.dateRangeField]
	    });
	
	    if (this.calendarStore) {
	        
	        this.doctor = new Ext.calendar.CalendarPicker({
				name: 'calendar',
		        anchor: '100%',
		        store: this.calendarStore
			});
	
	        this.formPanelCfg.add(this.doctor);
	    };
	    
	    if (this.staffStore) {
			this.staffPicker = new Ext.calendar.StaffPicker({
				name: 'staff',
	            anchor: '100%',
	            store: this.staffStore
			})
	        this.formPanelCfg.add(this.staffPicker);
	    };
	    
        this.addEvents({
            /**
             * @event eventadd
             * Fires after a new event is added
             * @param {Ext.calendar.EventEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was added
             */
            eventadd: true,
            /**
             * @event eventupdate
             * Fires after an existing event is updated
             * @param {Ext.calendar.EventEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was updated
             */
            eventupdate: true,
            /**
             * @event eventdelete
             * Fires after an event is deleted
             * @param {Ext.calendar.EventEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was deleted
             */
            eventdelete: true,
            /**
             * @event eventcancel
             * Fires after an event add/edit operation is canceled by the user and no store update took place
             * @param {Ext.calendar.EventEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The new {@link Ext.calendar.EventRecord record} that was canceled
             */
            eventcancel: true,
            /**
             * @event editdetails
             * Fires when the user selects the option in this window to continue editing in the detailed edit form
             * (by default, an instance of {@link Ext.calendar.EventEditForm}. Handling code should hide this window
             * and transfer the current event record to the appropriate instance of the detailed form by showing it
             * and calling {@link Ext.calendar.EventEditForm#loadRecord loadRecord}.
             * @param {Ext.calendar.EventEditWindow} this
             * @param {Ext.calendar.EventRecord} rec The {@link Ext.calendar.EventRecord record} that is currently being edited
             */
            editdetails: true
        });
        
        this.deleteBtn = new Ext.Button({
        	text: 'Удалить',
            disabled: false,
            hidden:this.o.data ? false : true,
            disabled: this.doctorMode ? true : false,
            handler: this.onDelete,
            scope: this,
            hideMode: 'offsets'
        })
        
	    config = {
	        titleTextAdd: 'Добавить событие',
	        titleTextEdit: 'Изменить событие',
	        width: 600,
	        autocreate: true,
	        border: true,
	        closeAction: 'close',
	        modal: true,
	        resizable: false,
	        buttonAlign: 'left',
	        savingMessage: 'Сохранение изменений...',
	        deletingMessage: 'Удаление события...',
	
	        fbar: [/*{
	            xtype: 'tbtext',
	            text: '<a href="#" id="tblink">Дополнительно...</a>'
	        },*/
	        '->', {
	            text: 'Сохранить',
	            disabled: false,
	            handler: this.onSave,
	            scope: this
	        },
	        this.deleteBtn,
	        {
	            text: 'Отмена',
	            disabled: false,
	            handler: this.onCancel,
	            scope: this
	        }],
	        items: this.formPanelCfg
	    };
	    
	    Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.EventEditWindow.superclass.initComponent.apply(this, arguments);
    },
    // private
    afterRender: function() {
        Ext.calendar.EventEditWindow.superclass.afterRender.call(this);

        this.el.addClass('ext-cal-event-win');
        
        this.formPanel = this.formPanelCfg;

        // Work around the CSS day cell height hack needed for initial render in IE8/strict:
        
//        this.deleteBtn[this.o.data && this.o.data[Ext.calendar.EventMappings.EventId.name] ? 'show': 'hide']();

        var rec,
        f = this.formPanel.getForm();

        if (this.o.data) {
        	this.dateRangeField.disable();
            rec = this.o;
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

            f.loadRecord(rec);
        }
        else {
        	this.dateRangeField.enable();
            this.isAdd = true;
            this.setTitle(this.titleTextAdd);

            var M = Ext.calendar.EventMappings,
            eventId = M.EventId.name,
            start = this.o[M.StartDate.name],
            end = this.o[M.EndDate.name] || start.add('h', 1);
            if (start.getHours() < this.startHour) {
            	start.setHours(this.startHour);
            	start.setMinutes(0);
            }
            if (end.getHours() > this.endHour) {
            	end.setHours(this.endHour);
            	end.setMinutes(0);
            }
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
            this.doctor.setValue(rec.data[Ext.calendar.EventMappings.CalendarId.name]);
        };
        if (this.staffStore) {
            this.staffPicker.setValue(rec.data[Ext.calendar.EventMappings.StaffId.name]);
        }
        
        this.dateRangeField.setValue(rec.data);
        this.activeRecord = rec;

/*        Ext.get('tblink').on('click',
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
    show: function(o, animateTarget) {
    	
    	var anim = (Ext.isIE8 && Ext.isStrict) ? null: animateTarget;

        Ext.calendar.EventEditWindow.superclass.show.call(this, anim,
        function() {
            this.titleField.focus(false, 100);
        });

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
    	this.close();
//        this.cleanup(true);
//        this.fireEvent('eventcancel', this);
    },

    // private
    cleanup: function(hide) {
        if (this.activeRecord && this.activeRecord.dirty) {
            this.activeRecord.reject();
        }
        delete this.activeRecord;

        /*if (hide === true) {
            // Work around the CSS day cell height hack needed for initial render in IE8/strict:
            //var anim = afterDelete || (Ext.isIE8 && Ext.isStrict) ? null : this.animateTarget;
            this.hide();
        }*/
        this.close;
    },

    // private
    updateRecord: function() {
        var f = this.formPanel.form,
        dates = this.dateRangeField.getValue(),
        M = Ext.calendar.EventMappings;

        f.updateRecord(this.activeRecord);
        this.activeRecord.set(M.StartDate.name, dates[0]);
        this.activeRecord.set(M.EndDate.name, dates[1]);
        //this.activeRecord.set(M.IsAllDay.name, dates[2]);
        this.activeRecord.set(M.CalendarId.name, this.formPanel.form.findField('calendar').getValue());
        if (this.staffStore) {
        	this.activeRecord.set(M.StaffId.name, this.formPanel.form.findField('staff').getValue());
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
        App.direct.scheduler.hasPreorder(this.activeRecord.data.EventId, function(res, e){
            if (res.hasPreorder){
                Ext.Msg.confirm('Внимание!','В выбранной смене есть предварительная запись. Всё равно удалить?',
                    function(btn){
                        if (btn=='yes'){
                            this.fireEvent('eventdelete', this, this.activeRecord);
                        }
                    },
                this)
            } else {
                this.fireEvent('eventdelete', this, this.activeRecord);
            }
        }, this)
    }
});