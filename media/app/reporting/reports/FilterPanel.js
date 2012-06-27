Ext.ns('App.reporting');

App.reporting.FilterPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.startDateField = new Ext.form.DateField({
			name:'start_date',
			format:'d.m.Y',
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
			minValue:new Date(1901,1,1),
        	fieldLabel: 'Дата с',
        	allowBlank:false
		}),
    	this.endDateField = new Ext.form.DateField({		
			name:'end_date',
			format:'d.m.Y',
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
			minValue:new Date(1901,1,1),
        	fieldLabel: 'Дата по',
        	allowBlank:false
		}),
    	
    	this.clsCmb = new Ext.form.LazyClearableComboBox({
		    typeAhead: true,
		    fieldLabel:'Форма обслуживания',
		    name:'order__cls',
		    triggerAction: 'all',
		    lazyRender:true,
		    mode: 'local',
		    store: new Ext.data.ArrayStore({
		        id: 0,
		        fields: [
		            'id',
		            'displayText'
		        ],
		        data: [['п','Посещение'], 
		        	['б','Прием биоматериала'],
		        	['н','Внутреннее направление'],
		        	['з','Предварительная запись'],
		        	['в','Возврат']]
		    }),
		    valueField: 'id',
		    displayField: 'displayText'
		});
    	
    	this.patientStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('patient'),
			model: [
				    {name: 'resource_uri'},
				    {name: 'short_name'},
				    {name: 'full_name'},
					{name: 'mobile_phone'},
				    {name: 'email'},
				    {name: 'birth_day',type:'date',format:'d.m.Y'}
				]
		});
		
		this.PatientCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Пациент',
        	name: 'order__patient',
			anchor:'98%',
			hideTrigger:false,
        	store:this.patientStore,
		    displayField: 'full_name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['Patient']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.staffStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('position'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'first_name', allowBlank: false},
				    {name: 'mid_name'},
				    {name: 'short_name'},
				    {name: 'last_name', allowBlank: false},
				    {name: 'gender', allowBlank: false},
				    {name: 'mobile_phone'},
				    {name: 'home_address_street'},
				    {name: 'email'},
				    {name: 'birth_day', allowBlank: false, type:'date'},
				    {name: 'name'},
				    {name: 'title'},
				    {name: 'department'}
				]
		});
		
		this.StaffCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Врач',
        	name: 'staff__staff',
			anchor:'98%',
			hideTrigger:false,
        	store:this.staffStore,
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['Staff']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.departmentStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('department'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'state'},
				    {name: 'name'}
				]
		});
		
		this.DepartmentCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Отделение',
        	name: 'staff__department',
			anchor:'98%',
			hideTrigger:false,
        	store:this.departmentStore,
		    displayField: 'name'
		    
		});
		
		this.referralStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : get_api_url('referral'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'referral_type'},
				    {name: 'name'}
				]
		});
		
		this.ReferralCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Кто направил',
        	name: 'order__referral',
			anchor:'98%',
			hideTrigger:false,
        	store:this.referralStore,
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['Referral']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.fromPlaceCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Место первичной регистрации (филиал)',
        	name: 'from_place_filial',
			anchor:'98%',
			hideTrigger:false,
        	store: new Ext.data.RESTStore({
				autoLoad : false,
				autoSave : true,
				apiUrl : get_api_url('state'),
				model: [
					    {name: 'id'},
					    {name: 'resource_uri'},
					    {name: 'name'}
					]
			}),
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['State','fromPlace']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
    	
		this.fromLabCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Лаборатория (плательщик)',
        	name: 'from_lab',
			anchor:'98%',
			hideTrigger:false,
        	store: new Ext.data.RESTStore({
				autoLoad : false,
				autoSave : true,
				apiUrl : get_api_url('state'),
				model: [
					    {name: 'id'},
					    {name: 'resource_uri'},
					    {name: 'name'}
					]
			}),
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['State','fromLab']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.exPlOfficeCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Место выполнения (ОФИС)',
        	name: 'execution_place_office',
			anchor:'98%',
			hideTrigger:false,
        	store: new Ext.data.RESTStore({
				autoLoad : false,
				autoSave : true,
				apiUrl : get_api_url('state'),
				model: [
					    {name: 'id'},
					    {name: 'resource_uri'},
					    {name: 'name'}
					]
			}),
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['State','exPlOffice']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.exPlFilialCombo = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Место выполнения (ФИЛИАЛ)',
        	name: 'execution_place_filial',
			anchor:'98%',
			hideTrigger:false,
        	store: new Ext.data.RESTStore({
				autoLoad : false,
				autoSave : true,
				apiUrl : get_api_url('state'),
				model: [
					    {name: 'id'},
					    {name: 'resource_uri'},
					    {name: 'name'}
					]
			}),
		    displayField: 'name',
		    listeners:{
		    	'render': function(f){
		    		var el = f.getEl()
		    		el.on('click',this.onChoice.createDelegate(this,['State','exPlFilial']),this)
		    	},
		    	'select':function(combo,record,index){
		    	},
		    	scope:this
		    }
		});
		
		this.paymentTypeCB = new Ext.form.ClearableComboBox({
			fieldLabel:'Форма оплаты',
			name:'order__payment_type',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['н','Касса'],
					['б','Юридическое лицо'],
					['д','ДМС']]
			}),
			typeAhead: true,
			triggerAction: 'all',
			baseCls:'x-border-layout-ct',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'98%'
		});
		
		this.priceTypeCB = new Ext.form.ClearableComboBox({
			fieldLabel:'Тип цены',
			name:'price_type',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['r','Розничная'],
					['z','Закупочная']]
			}),
			typeAhead: true,
			triggerAction: 'all',
			baseCls:'x-border-layout-ct',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'98%'
		});
		
    	var config = {
			layout: 'form',
			labelWidth:150,
            items: [
            	this.startDateField,
            	this.endDateField,
				this.clsCmb,
            	this.PatientCombo,
            	this.StaffCombo,
            	this.DepartmentCombo,
            	this.ReferralCombo,
            	this.fromPlaceCombo,
            	this.fromLabCombo,
//            	this.exPlOfficeCombo,
            	this.exPlFilialCombo,
            	this.paymentTypeCB,
            	this.priceTypeCB
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.FilterPanel.superclass.initComponent.call(this);
        
        this.on('afterrender',function(){
        	this.today = new Date();
        	this.startDateField.setValue(this.today);
        	this.endDateField.setValue(this.today);
		},this)
    },
    
    onPrint:function(){},
    
    onClearForm: function(){
    	Ext.each(this.items.items,function(item){
    		if (item.name == 'start_date' || item.name == 'end_date'){
    			item.setValue(this.today)
    		} else {
    			item.setRawValue('');
    		}
    	},this)
    },
    
    onChoice: function(type,source) {
    	if (!type) return false;
    	if (!source) source = type;
    	var name = type+'ChoiceWindow';
        var win = new App.choices[type+'ChoiceWindow']({
       		scope:this,
       		fn:function(record){
       			if (!record){
       				return 0;
       			}
       			this[source+'Combo'].forceValue(record.data.resource_uri);
				win.close();
			}
       	 });
       	win.show();
    }
    
});

Ext.reg('reportfilters', App.reporting.FilterPanel);