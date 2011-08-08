Ext.ns('App.examination');

App.examination.CardTemplateForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.tmp_id = Ext.id();
		
		this.groupStore = new Ext.data.Store({
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
			    url: get_api_url('templategroup')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message',
			    fields: ['name','resource_uri']
			})
		});
		
		this.groupComboBox = new Ext.form.LazyComboBox({
			id:'group-combo',
			fieldLabel:'Группа',
			name:'group',
			store: this.groupStore,
			typeAhead: true,
			queryParam:'name__istartswith',
			minChars:3,
			triggerAction: 'all',
			valueField: 'resource_uri',
			displayField: 'name',
			selectOnFocus:true
		});
		
		
		this.workPlace = new Ext.Panel({
			region:'center',
			layout:'form',
			autoScroll:true,
			labelAlign:'top',
			items:[{
					xtype:'hidden',
					name:'staff'
				},{
					xtype:'textfield',
					fieldLabel:'Рабочее наименование',
					name:'name',
					anchor:'100%'
				},{
					xtype:'textfield',
					fieldLabel:'Заголовок для печати',
					name:'print_name',
					anchor:'100%'
				},
					this.groupComboBox,
				{
					xtype:'textarea',
					fieldLabel:'Жалобы',
					name:'complaints',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Анамнез',
					name:'anamnesis',
					height:500,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Объективные данные',
					name:'objective_data',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Психологический статус',
					name:'psycho_status',
					height:500,
					anchor:'100%'
				},{
					xtype:'htmleditor',
					fieldLabel:'Основной диагноз',
					name:'gen_diag',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Клинический диагноз',
					height:500,
					name:'clinical_diag',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Диагноз по МКБ',
					name:'mbk_diag',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Осложнения',
					name:'complication',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'ЭКГ',
					name:'ekg',
					height:500,
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Лечение',
					height:500,
					name:'treatment',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Направление',
					height:500,
					name:'referral',
					anchor:'100%'
				},{
					xtype:'textarea',
					fieldLabel:'Заключение',
					height:500,
					name:'conclusion',
					anchor:'100%'
				}]
		});
		
		this.menuBar = new Ext.Panel({
			region:'west',
			width:150,
			layout:'form',
			defaults:{
				height:30,
				anchor:'100%',
				toggleGroup:'menu-bar-tmp',
				xtype:'button',
				scope:this
			},
			items:[{
					text:'Наименование',
					handler:this.onFocus.createDelegate(this,['name'])
				},{
					text:'Жалобы',
					handler:this.onFocus.createDelegate(this,['complaints'])
				},{
					text:'Анамнез',
					handler:this.onFocus.createDelegate(this,['anamnesis'])
				},{
					text:'Объективные данные',
					handler:this.onFocus.createDelegate(this,['objective_data'])
				},{
					text:'Психологический статус',
					handler:this.onFocus.createDelegate(this,['psycho_status'])
				},{
					text:'Основной диагноз',
					handler:this.onFocus.createDelegate(this,['gen_diag'])
				},{
					text:'Сопутствующий диагноз',
					handler:this.onFocus.createDelegate(this,['concomitant_diag'])
				},{
					text:'Клинический диагноз',
					handler:this.onFocus.createDelegate(this,['clinical_diag'])
				},{
					text:'Диагноз МКБ',
					handler:this.onFocus.createDelegate(this,['mbk_diag'])
				},{
					text:'Осложнения',
					handler:this.onFocus.createDelegate(this,['complication'])
				},{
					text:'ЭКГ',
					handler:this.onFocus.createDelegate(this,['ekg'])
				},{
					text:'Лечение',
					handler:this.onFocus.createDelegate(this,['treatment'])
				},{
					text:'Направление',
					handler:this.onFocus.createDelegate(this,['referral'])
				},{
					text:'Заключение',
					handler:this.onFocus.createDelegate(this,['conclusion'])
				}]
		});
		
		config = {
			id : 'temp-panel',
			layout:'border',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			padding:5,
			closable:true,
			items:[this.workPlace,this.menuBar],
			bbar:new Ext.ux.StatusBar({
				id: 'statusbar' + this.tmp_id,
                defaultText: '',
                items:[{
					text:'Сохранить',
					handler:this.onSave.createDelegate(this),
					scope:this
				},{
					text:'Закрыть',
					handler:this.onClose.createDelegate(this),
					scope:this
				}]
			})
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardTemplateForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('cardtemplatecreate', this.onCardTemplateCreate, this);
		App.eventManager.on('savetemplatecard', this.onSaveTmpCard, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			} else {
				var url = get_api_url('position');
				var path = [url,active_profile];
				this.getForm().findField('staff').setValue(path.join("/"));
				//Ext.Msg.alert('1',path.join("/"));
				
			};
			
		},this);
	},
	
	onSaveTmpCard: function(record) {
		this.setTitle('Шаблон: '+ record.data.name);
		var bar = Ext.getCmp('statusbar' + this.tmp_id);
        bar.setStatus({
        	text: 'Шаблон успешно сохранён',
            iconCls: 'silk-status-accept'
        });
        (function(){
			bar.clearStatus({useDefaults:true});
		}).defer(2000);
		
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
	},
	
	onClose: function() {
		this.isModified();
		this.destroy();
	},
	
	onFocus: function(name){
		 this.getForm().findField(name).focus(true,150);
	}
	
});		

Ext.reg('cardtemplateform', App.examination.CardTemplateForm);