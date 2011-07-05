Ext.ns('App.examination');

App.examination.CardTemplateForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		config = {
			baseCls:'x-plain',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			layout:{
				type:'vbox',
				align:'stretch'
			},
			padding:5,
			defaults:{
				baseCls:'x-plain',
				border:false
			},
			items:[{
				layout:'form',
				labelAlign:'top',
				autoScroll: true,
				defaults:{
					baseCls:'x-plain',
					border:false
				},
				items:[{
					xtype:'htmleditor',
					fieldLabel:'Наименование шаблона',
					name:'name',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Объективные данные',
					name:'objective_data',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Психологический статус',
					name:'psycho_status',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Основной диагноз',
					name:'gen_diag',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Осложнения',
					name:'complication',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Клинический диагноз',
					height:100,
					name:'clinical_diag',
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Лечение',
					height:100,
					name:'treatment',
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Направление',
					height:100,
					name:'referral',
					anchor:'100%'
				}]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardTemplateForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('cardtemplatecreate', this.onCardTemplateCreate, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		},this);
	},
	
	onCardTemplateCreate: function(record) {
		this.record = record;
		this.getForm().loadRecord(this.record);
	},
	
	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				console.log('Ошибка: нет модели');
			}
		}
		return this.record;
	},
	
	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();
			f.updateRecord(Record);
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	isModified: function() {
		console.log('is form dirty:', this.getForm().isDirty());
        
        this.getForm().items.each(function(f){
           if(f.isDirty()){
			console.log('dirty field:',f);
           }
        });
        
	}
	
});		