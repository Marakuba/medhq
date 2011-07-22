Ext.ns('Ext.calendar');

Ext.calendar.DoctorCalendar = Ext.extend(Ext.calendar.CalendarPanel,{
	initComponent: function(){
		config = {
			
            activeItem: 2, // month view
			    
			monthViewCfg: {
			    showHeader: true,
			    showWeekLinks: true,
			    showWeekNumbers: true
			},
            listeners: {
			    'eventclick': {
			        fn: function(vw, rec, el){
			            this.showEditWindow(rec, el);
			            this.clearMsg();
			        },
			        scope: this
			    },
			    'eventover': function(vw, rec, el){
			        //console.log('Entered evt rec='+rec.data.Title+', view='+ vw.id +', el='+el.id);
			    },
			    'eventout': function(vw, rec, el){
			        //console.log('Leaving evt rec='+rec.data.Title+', view='+ vw.id +', el='+el.id);
			    },
			    'eventadd': {
			        fn: function(cp, rec){
			            this.showMsg('Event '+ rec.data.Title +' was added');
			        },
			        scope: this
			    },
			    'eventupdate': {
			        fn: function(cp, rec){
			            this.showMsg('Event '+ rec.data.Title +' was updated');
			        },
			        scope: this
			    },
			    'eventdelete': {
			        fn: function(cp, rec){
			            this.showMsg('Event '+ rec.data.Title +' was deleted');
			        },
			        scope: this
			    },
			    'eventcancel': {
			        fn: function(cp, rec){
			            // edit canceled
			        },
			        scope: this
			    },
			    'dayclick': {
			        fn: function(vw, dt, ad, el){
			        	var day = dt.getDay();
			           	var date = dt.getDate();
			           	var time = dt.getTime();
			           	var ind = this.calendarStore.find("CalendarId",this.staff_id);
			           	var staff = this.calendarStore.getAt(ind);
			           	var routine = staff.data.Routine;
			           	var start;
			           	var end;
			           	
			          	//Устанавливаем начальное и конечное время сегодняшней смены
			           	//Если у врача не указаны соответствующие поля, то берется рабочий день
			           	//из настроек в календаре
			           	switch (routine[1]) {
			           		//любая смена
			           		case '0':
			           			//Устанавливаем время работы, какое есть
			           			start = staff.data.AmSessionStarts || staff.data.PmSessionStarts;
			           			end = staff.data.AmSessionEnds || staff.data.PmSessionEnds;
			           			break;
			           		//первая смена
			               	case '1':
			               		start = staff.data.AmSessionStarts;
			           			end = staff.data.AmSessionEnds;
			           			break;
			           		//вторая смена
			           		case '2':
			               		start = staff.data.PmSessionStarts;
			           			end = staff.data.PmSessionEnds;
			           			break;
			           		default: 
			           			start = undefined;
			           			start = undefined;
			           			break;
			           	};
			           	//Проверяем, работает ли сегодня врач
			           	//смотрим список дней в тэгах work_days
			           	var isWorking = true;
			           	var work_days = staff.data.work_days;
			           	if (work_days) {
			           		if (work_days.search(day) === -1) {
			           			isWorking = false;
			           		}
			           	};
			           	//смотрим четность/нечетность дня в routine
			           	//0 - любые дни
			           	//1 - четные
			           	//2 - нечетные
			           	switch (routine[0]) {
			           		case '1':
			           			if (date % 2 > 0) {
			           				isWorking = false;
			           			};
			           			break;
			           		case '2':
			           			if (date % 2 === 0) {
			           				isWorking = false;
			           			};
			           			break;
				           	}
                	               	
			           	if (start) {
			           		start = this.setTimeToDate(start,dt);
			           	} else {
			           		start = new Date();
			           	};
			       		if (end) {
			    			end = this.setTimeToDate(end,dt);
			    		} else {
			    			end = new Date();
			    			end.add('h',1);
			    		};
			      			
			    		if (isWorking) {
			    			this.showEditWindow({
			                  	StartDate: start,
				           		EndDate: end,
    				            IsAllDay: ad
        				    }, el);
			    		} else {
			    			Ext.Msg.confirm('Предупреждение',staff.data.Title + 
            						'в этот день не работает. Продолжить?',
              							function(btn){
    										if (btn=='yes') {
    											this.showEditWindow({
			       							StartDate: start,
			       							EndDate: end,
			       							IsAllDay: ad
			   							}, el);
    										}
    									},
               						this);
			       		}
			            this.clearMsg();
			        },
			        scope: this
			    },
			    'rangeselect': {
			        fn: function(win, dates, onComplete){
			            this.showEditWindow(dates);
			            this.editWin.on('hide', onComplete, this, {single:true});
			            this.clearMsg();
			        },
			        scope: this
			    },
			    'eventmove': {
			        fn: function(vw, rec){
			            rec.commit();
			            var time = rec.data.IsAllDay ? '' : ' \\a\\t g:i a';
			            this.showMsg('Event '+ rec.data.Title +' was moved to '+rec.data.StartDate.format('F jS'+time));
			        },
			        scope: this
			    },
			    'eventresize': {
			        fn: function(vw, rec){
			            rec.commit();
			            this.showMsg('Event '+ rec.data.Title +' was updated');
			        },
			        scope: this
			    },
			    'eventdelete': {
			        fn: function(win, rec){
			            this.eventStore.remove(rec);
			            this.showMsg('Event '+ rec.data.Title +' was deleted');
			        },
			        scope: this
			    },
			    'initdrag': {
			        fn: function(vw){
			            if(this.editWin && this.editWin.isVisible()){
			                this.editWin.hide();
			            }
			        },
			        scope: this
			    }
			}
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.DoctorCalendar.superclass.initComponent.apply(this, arguments);
	},
	
	       // This is an application-specific way to communicate CalendarPanel event messages back to the user.
        // This could be replaced with a function to do "toast" style messages, growl messages, etc. This will
        // vary based on application requirements, which is why it's not baked into the CalendarPanel.
    showMsg: function(msg){
          //  Ext.fly('app-msg').update(msg).removeClass('x-hidden');
    },
        
    clearMsg: function(){
            //Ext.fly('app-msg').update('').addClass('x-hidden');
    },
        
    setTimeToDate: function(value,dt) {
		dt.setHours(value.substring(0,2));
		dt.setMinutes(value.substring(3,5));
        dt.setSeconds(0);
        return dt;
    },
    confirmMsg: function(staff,start,end,el){
       	Ext.Msg.confirm('Предупреждение',staff.data.Title + 
        'в этот день не работает. Продолжить?',
           	function(btn){
    			if (btn=='yes') {
    				this.showEditWindow({
                       	StartDate: start,
                       	EndDate: end
                   	}, el);
    			}
           	}
        );
    },
    
    showEditWindow : function(rec, animateTarget){
	    if(!this.editWin){
	        this.editWin = new Ext.calendar.EventEditWindow({
                calendarStore: this.calendarStore,
			listeners: {
					'eventadd': {
						fn: function(win, rec){
							win.hide();
							rec.data.IsNew = false;
							this.eventStore.add(rec);
                            this.showMsg('Event '+ rec.data.Title +' was added');
						},
						scope: this
					},
					'eventupdate': {
						fn: function(win, rec){
							win.hide();
							rec.commit();
                            this.showMsg('Event '+ rec.data.Title +' was updated');
						},
						scope: this
					},
					'eventdelete': {
						fn: function(win, rec){
							this.eventStore.remove(rec);
							win.hide();
                            this.showMsg('Event '+ rec.data.Title +' was deleted');
						},
						scope: this
					},
                    'editdetails': {
                        fn: function(win, rec){
                            win.hide();
                            App.calendarPanel.showEditForm(rec);
                        }
                    }
				}
            });
	    }
        this.editWin.show(rec, animateTarget);
	}

    
})

Ext.calendar.DoctorScheduler = Ext.extend(Ext.Panel, {
	initComponent: function(){
		this.calendarStore = new Ext.data.JsonStore({
	    	storeId: 'calendarStore',
    	    root: 'objects',
	        idProperty: 'id',
    	    restful: true,
	        baseParams: {
    			format:'json'
			},
			autoSave:true,
			writer: new Ext.data.JsonWriter({
				encode: false,
				writeAllFields: true
			}),
			paramNames: {
				start : 'offset',
				limit : 'limit',
				sort : 'sort',
				dir : 'dir'
			},
			proxy: new Ext.data.HttpProxy({
				url: get_api_url('staffsched'),
				method:'GET'
			}),
        	autoLoad: true,
	        fields: [
	        	{name:'CalendarId', mapping: 'id', type: 'int'},
    	        {name:'Title', mapping: 'title', type: 'string'},
        	    {name:'Timeslot', mapping: 'timeslot', type: 'int'},
            	{name:'AmSessionStarts', mapping: 'am_session_starts'},
	            {name:'AmSessionEnds', mapping: 'am_session_ends'},
    	        {name:'PmSessionStarts', mapping: 'pm_session_starts'},
        	    {name:'PmSessionEnds', mapping: 'pm_session_ends'},
	            {name:'Routine', mapping: 'routine', type: 'string'},
    	        {name:'work_days', type: 'string'},
        	    {name:'Room', mapping: 'room'}
        	],
            sortInfo: {
                field: 'CalendarId',
                direction: 'ASC'
            }
        });
            
        this.staffStore = new Ext.data.JsonStore({
            storeId: 'staffStore',
            root: 'objects',
            idProperty: 'id',
            restful: true,
            baseParams: {
				format:'json'
		    },
		    autoSave:true,
		    writer: new Ext.data.JsonWriter({
		    	encode: false,
			    writeAllFields: true
			}),
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
		    	sort : 'sort',
			    dir : 'dir'
			},
            proxy: new Ext.data.HttpProxy({
		    	url: get_api_url('staff'),
		    	method:'GET'
			}),
            autoLoad: true,
            fields: [
                {name:'StaffId', mapping: 'id', type: 'int'},
                {name:'Name', mapping: 'name', type: 'string'}
            ],
            sortInfo: {
                field: 'StaffId',
                direction: 'ASC'
            }
        });

	    this.eventStore = new Ext.data.Store({
	        id: 'eventStore',
	        baseParams: {
	    		format:'json'
		    },
		    restful: true,
		    autoSave:true,
		    autoLoad:false,
		    reader: new Ext.data.JsonReader({
			    idProperty: 'id',
		        root: 'objects',
		        successProperty: 'success',
		        messageProperty: 'message'
		    }, Ext.calendar.EventRecord),
		    writer: new Ext.data.JsonWriter({
		    	encode: false,
			    writeAllFields: true
			}),
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
		    	sort : 'sort',
			    dir : 'dir'
			},
			proxy: new Ext.data.HttpProxy({
		    	url: get_api_url('event'),
		    	method:'GET'
			}),
	        sortInfo: {
	            field: 'StartDate',
	            direction: 'ASC'
	        }
	    });
		    
	    this.datePicker = new Ext.DatePicker ({
	    	id: 'app-nav-picker',
   	        //region:'north',
            //height:190,
            //width:130,
   	        cls: 'ext-cal-nav-picker',
       	    listeners: {
           		'select': {
                   	fn: function(dp, dt){
               	    	this.calendarPanel.setStartDate(dt);
                   	},
                    scope: this
                }
            }
        });
             
        this.staffGrid = new Ext.calendar.StaffGrid({
           	id: 'app-staff-picker',
	        //region:'center',
	        //height:190,
	    	//autoSize:true,
           	//anchor:'100% 100%',
           	autoScroll:true,
           	autoHeight:true,
            sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					'rowselect': {
       	           		fn: function(model,ind,rec){
                    		this.staff_id = rec.data.id;
           	            	var start = new Date();
	               	        this.calendarStore.setBaseParam('id',this.staff_id);
		               	    this.eventStore.setBaseParam('cid',this.staff_id);
   	                    	this.calendarStore.load();
	                        this.calendarPanel.setStartDate(start);
    	       	        },
	               	scope: this
    	           	}	
				}
			})
		});
		
		this.calendarPanel = new Ext.calendar.DoctorCalendar({
			eventStore: this.eventStore,
            calendarStore: this.calendarStore,
            border: false,
            id:'app-calendar',
            region: 'center',
            listeners: {
            	'viewchange': {
			        fn: function(p, vw, dateInfo){
			            if(this.editWin){
			                this.editWin.hide();
			            };
			            if(dateInfo !== null){
			                // will be null when switching to the event edit form so ignore
			                Ext.getCmp('app-nav-picker').setValue(dateInfo.activeDate);
			                this.updateTitle(dateInfo.viewStart, dateInfo.viewEnd);
			            }
			        },
			        scope: this
			    }
            }
		});
            
        config = {
            layout: 'border',
            //renderTo: 'calendar-ct',
            items: [{
                id: 'app-center',
                title: '...', // will be updated to view date range
                region: 'center',
                layout: 'border',
                items: [{
                    id:'app-west',
                    region: 'west',
                    layout: 'border',
                    trackResetOnLoad:true,
                    width: 176,
                    border: false,
                    defaults:{
                      border:false
                    },
                    items: [{
                        region:'north',
                        height:190,
                        items:this.datePicker
                    },{
                        region:'center',
                        autoScroll:true,
                        items:this.staffGrid
                    }] 
                },{
                    region:'center',
                    items:this.calendarPanel
                }]
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.DoctorScheduler.superclass.initComponent.apply(this, arguments);
    },
    
    updateTitle: function(startDt, endDt){
        var p = Ext.getCmp('app-center');
           
        if(startDt.clearTime().getTime() == endDt.clearTime().getTime()){
            p.setTitle(startDt.format('F j, Y'));
        }
        else if(startDt.getFullYear() == endDt.getFullYear()){
            if(startDt.getMonth() == endDt.getMonth()){
                p.setTitle(startDt.format('F j') + ' - ' + endDt.format('j, Y'));
            }
            else{
                p.setTitle(startDt.format('F j') + ' - ' + endDt.format('F j, Y'));
            }
        }
        else{
            p.setTitle(startDt.format('F j, Y') + ' - ' + endDt.format('F j, Y'));
        }
    }
       
	
});

Ext.reg('doctorscheduler',Ext.calendar.DoctorScheduler);
