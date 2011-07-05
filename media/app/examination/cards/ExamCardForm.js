Ext.ns('App.examination');

App.examination.ExamCardForm = Ext.extend(Ext.form.FormPanel, {

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
					xtype:'hidden',
					name:'ordered_service'
				},{
					xtype:'htmleditor',
					fieldLabel:'Характер заболевания',
					name:'disease',
					height: 100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Жалобы',
					name:'complaints',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'История настоящего заболевания',
					name:'history',
					height:100,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Анамнез',
					name:'anamnesis',
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
					fieldLabel:'Диагноз по МБК',
					name:'mbk_diag',
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
					height:100,
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
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
				},{
					xtype:'htmleditor',
					fieldLabel:'Дополнительные услуги',
					height:100,
					name:'extra_service',
					anchor:'100%'
				}]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ExamCardForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('examcardcreate', this.onExamCardCreate, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			} else {
				if (this.tmp_record){
					/*for (rec in this.tmp_record.data) {
						var field = this.getForm().findField(rec);
						if (field) {
							field.setValue(this.tmp_record.data[rec])
						}
					}*/
					this.getForm().loadRecord(this.tmp_record)
				}
			}
		},this);
	},
	
	onExamCardCreate: function(record) {
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