Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.StartPanel = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		
    	this.tmpCB = new Ext.form.LazyComboBox({
        	fieldLabel:'Шаблоны',
        	autoLoad: false,
			anchor:'80%',
        	name:'tmp',
        	proxyUrl:get_api_url('templates')
    	});
    	
    	this.cardCB = new Ext.form.LazyComboBox({
        	fieldLabel:'Карты',
        	autoLoad: false,
			anchor:'80%',
        	name:'card',
        	proxyUrl:get_api_url('cards')
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
                {boxLabel: 'Взять из услуги', name: 'input-choice', inputValue: 'card'}
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
