Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.StartPanel = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		
		this.tmpCBStore = new Ext.data.RESTStore({
			autoSave: true,
			baseParams:{
				'format':'json',
				'base_service__isnul':true,
	        	'staff__isnul':true
			},
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			model: App.models.Template
		});
		
    	this.tmpCB = new Ext.form.ComboBox({
        	fieldLabel:'Шаблоны',
        	autoLoad: false,
        	store: this.tmpCBStore,
        	queryParam:'print_name__istartswith',
			anchor:'80%',
        	name:'tmp',
        	typeAhead: true,
		    minChars:2,
		    triggerAction: 'all',
		    valueField: 'resource_uri',
		    displayField: 'print_name',
		    selectOnFocus:true
    	});
    	
    	this.cardCB = new Ext.form.LazyComboBox({
        	fieldLabel:'Услуги',
        	autoLoad: false,
			anchor:'80%',
        	name:'base_service',
        	proxyUrl:get_api_url('base_service')
    	});
    	
    	this.nextBtn = new Ext.Button({
    		text:'Далее',
    		handler:this.onNext.createDelegate(this),
    		scope:this
    	});

		this.radioGroup = new Ext.form.RadioGroup({
			columns: 1,
            items: [
                {boxLabel: 'Пустой шаблон', name: 'input-choice', inputValue: 'empty', checked: true},
                {boxLabel: 'Выбрать заготовку', name: 'input-choice', inputValue: 'tmp'},
                {boxLabel: 'Взять из услуги', name: 'input-choice', inputValue: 'base_service'}
            ]
		});
		var config = {
			title: 'Выберите действие',
			layout: 'anchor',	
			border:false,
     		items: [
				this.radioGroup,
				this.tmpCB,
				this.cardCB,
				this.nextBtn
     		]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.StartPanel.superclass.initComponent.apply(this, arguments);
	},
	
	onNext: function(){
		var value = this.radioGroup.getValue().inputValue;
		if (this[value+'CB']) {
			var source = this[value+'CB'].getValue();
			if (!source) {
				Ext.Msg.alert('Ошибка','Не выбран источник шаблона!');
			} else {
				this.fireEvent('opentmp',source);
			}
		} else {
			this.fireEvent('opentmp');
		}
	}
});
