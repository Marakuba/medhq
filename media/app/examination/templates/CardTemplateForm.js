Ext.ns('App.examination');

App.examination.CardTemplateForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
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
		
		this.workPlace = [
			{
					//region:'center',
					//layout:'form',
						//items:[{
					xtype:'hidden',
					name:'staff'
				},{
					xtype:'textfield',
					fieldLabel:'Рабочее наименование',
					name:'name',
					//height:40,
					anchor:'100%'
				},{
					xtype:'textfield',
					fieldLabel:'Заголовок для печати',
					name:'print_name',
					//height:40,
					anchor:'100%'
				},
					this.groupComboBox,
				{
					xtype:'textarea',
					fieldLabel:'Жалобы',
					name:'complaints',
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
					height:400,
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
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
					height:100,
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
				}];
				
		this.menuBar = [{
					xtype:'textarea',
					fieldLabel:'Направление',
					height:100,
					//name:'referral',
					anchor:'100%'
				}];
		
		config = {
			id : 'temp-panel',
			layout:'border',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			padding:5,
			closable:true,
			items:[{
				region:'center',
				border:false,
				width:'70%',
				autoScroll:true,
				trackResetOnLoad:true,
				layout:{
					type:'vbox'
					//align:'stretch'
				},
				padding:5,
				defaults:{
					baseCls:'x-plain',
					width:350,
					border:false,
					autoScroll:true
				},
				items:[{
					layout:'form',
					labelAlign:'top',
					autoScroll:true,
					defaults:{
						baseCls:'x-plain',
						border:false
					},
					items:this.workPlace
				}]
			}],
			buttons:[{
				text:'Фокус',
				handler:this.onFocus.createDelegate(this),
				scope:this
			},{
				text:'Сохранить',
				handler:this.onSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardTemplateForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('cardtemplatecreate', this.onCardTemplateCreate, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			} else {
				var url = get_api_url('position');
				var path = [url,active_profile];
				this.getForm().findField('staff').setValue(path.join("/"));
				//Ext.Msg.alert('1',path.join("/"));
				
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
	},
	
	onClose: function() {
		this.isModified();
		this.destroy();
	},
	
	onFocus: function(){
		 this.getForm().findField('referral').focus(true,300);
	}
	
});		

Ext.reg('cardtemplateform', App.examination.CardTemplateForm);