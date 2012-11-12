Ext.ns('Ext.calendar');
Ext.ns('App.visit');
Ext.ns('App');
Ext.calendar.TimeslotInfoWindow = Ext.extend(Ext.Window, {
	initComponent: function() {

    	this.preorderModel = new Ext.data.Record.create([
		    {name: 'id'},
			{name: 'resource_uri'},
			{name: 'patient'},
			{name: 'patient_name'},
			{name: 'patient_birthday'},
			{name: 'timeslot'},
			{name: 'comment'},
			{name: 'visit'},
			{name: 'service'},
			{name: 'base_service'},
			{name: 'service_name'},
			{name: 'price'},
			{name: 'department'},
			{name: 'staff'},
			{name: 'staff_name'},
			{name: 'payment_type'},
			{name: 'ptype_name'},
			{name: 'execution_place'},
			{name: 'execution_place_name'},
			{name: 'patient_phone'},
			{name: 'start', type: 'date',format:'c'}
		]);

    	this.preorderStore = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : App.getApiUrl('scheduler','extpreorder'),
			model: this.preorderModel,
			listeners:{
				load: function(store,records){
					if(records.length){
						this.tpl.overwrite(this.preorderPanel.body,records[0].data);
					}
				},
				scope:this
			}
    	});

		this.tpl = new Ext.XTemplate(
    		'<tpl for=".">',
	        	'<font size = 5> Пациент: ','<span id="patient_name"> <b>{patient_name:this.nullFormatter}</b></span>',
	        	'<br>',' Дата рождения: ','<span id="start" class = "start">','<b>{patient_birthday:date("d.m.Y")}</b>','</span>',
	        	'<br>',' Услуга: ','<span id="service_name"> <b>{service_name:this.nullFormatter}</b></span>',
	        	'<br>',' Форма оплаты: ','<span id="ptype_name"> <b>{ptype_name:this.nullFormatter}</b></span>',
	        	'<br>',' Время начала: ','<span id="start" class = "start">','<b>{start:date("H:i")}</b>','</span>',
	    	'</tpl>',
	    	{nullFormatter: function(v)
	    		{ return v ? v : 'не указано'; }
	    	}
		);

	    this.preorderPanel = new Ext.Panel({
	    	id : this.id + 'preorder-panel',
	    	region:'south',
	    	frame: false,
	    	html:'Свободно',
	    	bodyBorder: false,
	    	bodyStyle: 'background:transparent'
	    })

    	this.formPanelCfg = new Ext.FormPanel({
        	layout:'fit',
	        bodyStyle: 'background:transparent;padding:5px 10px 10px;',
    	    bodyBorder: false,
        	border: false,
        	height:300,
	        items: [this.preorderPanel]
    	});

        this.formPanel = this.formPanelCfg;

        if (this.calendarStore) {

        	this.calendarPicker = new Ext.calendar.CalendarPicker({
        		name: 'calendar',
        		hidden:true,
        	    fieldLabel:'Врач',
            	anchor: '100%',
	            store: this.calendarStore
        	})

        	this.fieldSet.add(this.calendarPicker);
    	};

	    config = {
	        width: 600,
	        height:400,
    	    autocreate: true,
        	border: true,
        	title:'Предзаказ',
	        //closeAction: 'hide',
    	    modal: true,
        	resizable: false,
	        buttonAlign: 'left',

        	tbar: this.ttb,

	        fbar: [
    	    '->',
    	    	{
    	        text: 'Закрыть',
        	    disabled: false,
            	handler: this.onCancel,
	            scope: this
    	    }],
        	items:[this.formPanelCfg]
    	};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.calendar.TimeslotInfoWindow.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
        	 var rec,
	        f = this.formPanel.getForm();

	        this.preorderStore.on('load',function(store,records,obj){
            	if (records.length){
            		this.tpl.overwrite(this.preorderPanel.body,records[0].data);
            	};
            },this,{single:true});

	        if (this.event) {
	           	this.preorderStore.setBaseParam('timeslot',App.uriToId(this.event.data['ResourceURI']));
	           	this.preorderStore.load();
	        };
        })
    },

    // private
    onCancel: function() {
        //this.cleanup(true);
        //this.fireEvent('eventcancel', this);
        this.close()
    }

});
