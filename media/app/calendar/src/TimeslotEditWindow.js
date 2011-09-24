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
Ext.ns('App');
Ext.calendar.TimeslotEditWindow = Ext.extend(Ext.Window, {
	initComponent: function() {

		this.inlines = new Ext.util.MixedCollection({});
		
	    this.preorderedService = new Ext.calendar.PreorderedServiceInlineGrid({
			//record:this.preorder,
			type:this.type,
			region:'south',
			height:200,
			margins:'0 0 5 5'
		});
		
		this.preorderedService.store.on('write', function(){
			this.popStep();
		}, this);
		
		this.inlines.add('preorderedservice', this.preorderedService);
		
		this.servicePanel = new App.visit.VisitServicePanel({
	        region: 'east',
		    collapsible: true,
		    collapseMode: 'mini',
		    margins:'5 5 5 0',
	        width: 200,
	        split: true
	    });
	    
	    this.fieldSet = new Ext.FormPanel({
	    	//layout:'column',
	    	baseCls:'x-border-layout-ct',
	    	labelWidth: 65,
	    	frame: false,
	    	region:'center',
	    	margins:'5 0 5 5',
	    	//width:'400',
	    	defaults:{
	    		anchor:'100%'
	    	},
	    	items:[{
    	    id: 'timeslot-title',
        	name: Ext.calendar.EventMappings.Title.name,
            fieldLabel: 'Пациент',
	      	xtype: 'textfield'
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
	    }]});
    	
    	this.formPanelCfg = new Ext.FormPanel({
	        //xtype: 'form',
        	layout:'border',
	        bodyStyle: 'background:transparent;padding:5px 10px 10px;',
    	    bodyBorder: false,
        	border: false,
        	height:300,
        	bubbleEvents:['patientchoice'],
	        items: [{
	        	region:'center',
	        	layout:'border',
	        	baseCls:'x-border-layout-ct',
	        	margins:'5 0 5 5',
	        	defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
	        	items:[this.fieldSet,this.preorderedService]
	       	 },this.servicePanel]
    	});
    	

    	this.preorderModel = new Ext.data.Record.create([
		    {name: 'id'},
		    {name: 'resource_uri'},
		    {name: 'patient'},
		    {name: 'timeslot'},
		    {name: 'comment'},
		    {name: 'expiration'}
		]);

    	this.preorderStore = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('preorder'),
			model: this.preorderModel
		});
		
		this.preorderStore.on('write', function(store, action, result, res, rs){
			if(action=='create') {
			    this.preorder = rs;
			    App.eventManager.fireEvent('preordercreate',rs);
		    }
		}, this);
		
		this.clearButton = new Ext.Button({
			iconCls:'silk-cancel',
			text:'Отменить предзаказ',
			disabled:true,
			handler:this.onClear.createDelegate(this, [])
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
    	    
        	this.fieldSet.add({
	            xtype: 'calendarpicker',
    	        id: 'timeslot-calendar',
        	    name: 'calendar',
        	    fieldLabel:'Врач',
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
		}
		];
    	
	    config = {
    	    titleTextAdd: 'Добавить событие',
        	titleTextEdit: 'Изменить событие',
	        width: 800,
    	    autocreate: true,
        	border: true,
	        closeAction: 'hide',
    	    modal: false,
        	resizable: false,
	        buttonAlign: 'left',
    	    savingMessage: 'Сохранение изменений...',
        	deletingMessage: 'Удаление события...',
        	
        	tbar: this.ttb,

	        fbar: [
    	    '->', this.clearButton,'-',{
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
        	items:[this.formPanelCfg]
    	};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.calendar.TimeslotEditWindow.superclass.initComponent.apply(this, arguments);
        this.servicePanel.on('serviceclick', this.onServiceClick, this);
        
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

        /*Ext.get('tblink').on('click',
        function(e) {
            e.stopEvent();
            this.updateRecord();
            this.fireEvent('editdetails', this, this.activeRecord);
        },
        this);*/
        
    },

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
        this.patient = undefined;

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
           	this.preorderStore.setBaseParam('timeslot',App.uriToId(rec.data['ResourceURI']));
           	this.preorderStore.load({callback:this.setPreorder,scope:this});

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
        //Если мы выбрали пациента
        if (this.patient && uri){
        	if (this.preorder) {
        		this.preorder.set('patient',this.patient.data.resource_uri);
        		this.preorder.commit();
        		this.preorderedService.onPreorderCreate(this.preorder);
        	} else {
        		var record = new this.preorderModel();
        		record.set('patient',this.patient.data.resource_uri);
        		record.set('timeslot',uri);
        		var end = this.activeRecord.data[M.EndDate.name];
        		var day = end.add('d',2);
        		record.set('expiration', end);
        		this.preorderStore.add(record);
        	}
        } else {
        	if (this.preorder){
        		this.preorderedService.onPreorderCreate(this.preorder);
        	}
        }
    },
    
    setPreorder: function(records,opt,success){
		if (records[0]) {
			this.preorder = records[0];
			this.clearButton.setDisabled(false);
			this.preorderedService.record = this.preorder; 
            this.preorderedService.store.setBaseParam('preorder',App.uriToId(this.preorder.data.resource_uri));
            this.preorderedService.store.load();
            this.servicePanel.enable();
		} else {
			this.clearButton.setDisabled(true);
			this.servicePanel.disable();
		}
	},

    // private
    onSave: function() {
        if (!this.formPanel.form.isValid()) {
            return;
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
		
        //Если была нажата кнопка Отменить предзаказ
        if (this.setRemovePreorder) {
        	this.setRemovePreorder = false;
        	this.preorderStore.remove(this.preorder);
        	
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
			//store:this.store,
			scope:this,
			fn:function(record){
				this.patient = record;
				var name = record.data.last_name+' '+record.data.first_name;
        		this.formPanel.form.findField('Title').setValue(name);
        		this.servicePanel.enable();
				
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
        			this.servicePanel.enable();
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
       	Ext.Msg.confirm('Предупреждение','Отменить предзаказ?',
              function(btn){
    			if (btn=='yes') {
    				if (this.preorder){
    					this.clearButton.setDisabled(true);
   						this.setRemovePreorder = true;
   						this.formPanel.form.findField('Title').setValue('');
   						this.onSave();
   					}
    			}
            },this
        );
    	
    	
    },
    
    onServiceClick : function(node) {
		var a = node.attributes;
		this.preorderedService.addRow.createDelegate(this.preorderedService, [a])();
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
		return steps
	}
});