Ext.ns('App.examination');

App.examination.ExamCardForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.examModel = new Ext.data.Record.create([
			{name: 'id'},
			{name: 'created',allowBlank: true},
			{name: 'modified',allowBlank: true},
			{name: 'name',allowBlank: true},
			{name: 'ordered_service',allowBlank: true},
			{name: 'print_date', allowBlank: true},
			{name: 'objective_data', allowBlank: true},
			{name: 'psycho_status', allowBlank: true},
			{name: 'gen_diag', allowBlank: true},
			{name: 'complication', allowBlank: true},
			{name: 'concomitant_diag', allowBlank: true},
			{name: 'clinical_diag', allowBlank: true},
			{name: 'treatment', allowBlank: true},
			{name: 'referral', allowBlank: true},
			{name: 'disease', allowBlank: true},
			{name: 'complaints', allowBlank: true},
			{name: 'history', allowBlank: true},
			{name: 'anamnesis', allowBlank: true},
			{name: 'mbk_diag', allowBlank: true},
			{name: 'extra_service', allowBlank: true},
			{name: 'view',allowBlank: true}
		]);
		//store для комбобокса
		this.examCardStore = new Ext.data.Store({
			//autoLoad:true,
			//autoSave:true,
		    baseParams: {
		    	format:'json',
		    	name:this.record?this.record.data.name:this.tmp_record.data.name
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('examcard')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, this.examModel)
		});
		
		this.examComboBox = new Ext.form.ComboBox({
			id:'exam-combo',
			fieldLabel:'Другие карты осмотра',
			store: this.examCardStore,
			listeners:{
				scope:this,
				'select':function(combo, record, index){
					this.examDonor = record
				}
			},
			typeAhead: true,
			queryParam:'name__istartswith',
			minChars:3,
			triggerAction: 'all',
			valueField: 'resource_uri',
			displayField: 'view',
			selectOnFocus:true
		});
		
		config = {
			baseCls:'x-plain',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			padding:5,
			defaults:{
				baseCls:'x-plain',
				border:false
			},
			tbar:['Другие карты данного обследования:  ',this.examComboBox,
			{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать',
				handler:this.onChoice.createDelegate(this, [])
			}],
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
					xtype:'hidden',
					name:'name'
				},{
					xtype:'textarea',
					fieldLabel:'Характер заболевания',
					name:'disease',
					height: 100,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Жалобы',
					name:'complaints',
					height:100,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'История настоящего заболевания',
					name:'history',
					height:100,
					anchor:'100%'
				},{
					xtype:'textarea',
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
					xtype:'textarea',
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
					xtype:'textarea',
					fieldLabel:'Диагноз по МБК',
					name:'mbk_diag',
					height:100,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Осложнения',
					name:'complication',
					height:100,
					anchor:'100%'
				},{
					xtype:'textarea',
					height:100,
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Клинический диагноз',
					height:100,
					name:'clinical_diag',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Лечение',
					height:100,
					name:'treatment',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Направление',
					height:100,
					name:'referral',
					anchor:'100%'
				},{
					xtype:'textarea',
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
			if (this.patient) {
				this.examCardStore.setBaseParam('ordered_service__order__patient',this.patient)
			};
			if(this.record) {
				this.getForm().loadRecord(this.record);
				//this.setTitle('Карта осмотра '+this.record.data.name)
			} else {
				if (this.tmp_record){
					/*for (rec in this.tmp_record.data) {
						var field = this.getForm().findField(rec);
						if (field) {
							field.setValue(this.tmp_record.data[rec])
						}
					}*/
					this.getForm().loadRecord(this.tmp_record)
					//this.setTitle('Карта осмотра '+this.tmp_record.data.name)
				}
			};
			//this.examCardStore.load();
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
			//App.eventManager.fireEvent('examcardgrid_reload');
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	onChoice: function(){
		if (this.examDonor){
			Ext.Msg.confirm('Предупреждение','Перенести данные в документ?',
				function(btn){
					if (btn==='yes'){
						this.getForm().loadRecord(this.examDonor);
					}
				},
			this);
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