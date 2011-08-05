Ext.ns('App.examination');

App.examination.ExamCardForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.examModel = App.models.examModel;
		this.examCardStore = new Ext.data.Store({
			//autoLoad:true,
			autoSave:true,
		    baseParams: {
		    	format:'json'
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
			}, this.examModel),
			writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
			listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		App.eventManager.fireEvent('examcardcreate', rs);
			    		Ext.getCmp(this.tmp_id+'print').enable();
		    		}
		    	},
		    	scope:this
		    }
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
			id: 'exam-form',
			baseCls:'x-plain',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			padding:5,
			defaults:{
				baseCls:'x-plain',
				border:false
			},
			buttons:[{
				id:this.tmp_id+'print',
				disabled:this.record ? false : true,
				text:'Просмотр',
				handler:this.onPrint.createDelegate(this),
				scope:this
			},{
				text:'Сохранить',
				handler:this.onSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}],
			tbar:[{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать шаблон',
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
					xtype:'textfield',
					fieldLabel:'Заголовок для печати',
					name:'print_name',
					//height:40,
					anchor:'100%'
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
					fieldLabel:'ЭКГ',
					name:'ekg',
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
					fieldLabel:'Заключение',
					height:100,
					name:'conclusion',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Примечание',
					height:100,
					name:'comment',
					anchor:'100%'
				}]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ExamCardForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('examcardcreate', this.onExamCardCreate, this);
		this.on('afterrender', function(){
			//if (this.patient) {
				//this.examCardStore.setBaseParam('ordered_service__order__patient',this.patient)
			//};
			if(this.record) {
				this.getForm().loadRecord(this.record);
			};
			if (this.ordered_service) {
				this.getForm().findField('ordered_service').setValue(this.ordered_service)
			}
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
				var Model = this.examModel;
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
			var Record = this.record ? this.record : new this.examModel();
			f.updateRecord(Record);
			if (!Record.data.name){
				Record.data['name'] = Record.data.print_name; 
			}
			this.record = Record;
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			} else {
				if(Record.phantom) {
					if(this.examCardStore.indexOf(Record)==-1) {
						this.examCardStore.insert(0, Record);
					}
				}
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	onChoice: function(){
		var win = new App.examination.TemplatesWindow({
			fn: function(record){
				//this.record = record;
				if (record){
					Ext.Msg.confirm('Предупреждение','Перенести данные в документ?',
						function(btn){
							if (btn==='yes'){
								this.getForm().loadRecord(record);
							}
						},
					this);
				}
			},
			scope:this
		})
		win.show();
		
	},
	
	isModified: function() {
		console.log('is form dirty:', this.getForm().isDirty());
        
        this.getForm().items.each(function(f){
           if(f.isDirty()){
			console.log('dirty field:',f);
           }
        });
        
	},
	
	onClose: function() {
		this.isModified();
		this.destroy();
	},
	
	onPrint: function() {
		window.open('/exam/card/'+this.record.data.id+'/');
	}
});		

Ext.reg('examcardform', App.examination.ExamCardForm);