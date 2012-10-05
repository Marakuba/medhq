Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.TemplateApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		/*
		 *Данный компонент является менеджером карт осмотра
		 *На входе он получает следующие параметры:
		 *baseServiceId - для поиска шаблона по услуге
		 *patientId - для открытия карты осмотра
		 *patient_name - для отображении в заголовке
		 *orderId - для поиска уже созданных карт осмотра для текущего заказа - для их редактирования
		 *cardId - если карта редактируется
		 *
		 *Если передан cardId, то эта карта ищется в store, оттуда берется поле data и передается в 
		 *редактор. 
		 *Если данные изменились, редактор шлет событие с измененными данными - полем data
		 *Менеджер заносит это поле в редактируемую запись карты осмотра и сохраняет store.
		 *
		 *  Если cardId не передан, то вызывается cardStartPanel, которая определяет источник данных,
		 *  которые будут редактироваться.
		 * 
		*/
		
		this.staff = App.getApiUrl('staff')+ '/' + active_staff;
		
		this.tplStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			model: App.models.Template,
			baseParams:{
				format:'json',
				staff:active_staff,
				deleted:false
			}
		});
		
		this.serviceTree = new App.ServiceTreeGrid ({
//			layout: 'fit',
			region:'west',
			hidden:this.editMode,
			baseParams:{
				payment_type:'н',
				staff : active_profile,
				nocache : true
			},
			hidePrice: true,
			autoScroll:true,
			width:250,
			searchFieldWidth: 200,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true
		});
		
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			layout: 'fit',
 			title:'Выберите услугу',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
	
		var config = {
			closable:true,
			title: 'Конструктор',
			layout: 'border',	
     		items: [
				this.serviceTree,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(form){
			if (this.editMode){
				if (this.record){
					this.editTpl(this.record.dataId)
				}
			}
		});
		
		this.serviceTree.on('serviceclick',function(attrs){
			this.attrs = attrs;
			this.onServiceClick(this.attrs)
		},this);
	},
	
	onServiceClick: function(attrs){
		var ids = attrs.id.split('-');
		var id = ids[0];
		this.print_name = attrs.text;
		
		this.baseServiceId = id;
		
		this.tplStore.setBaseParam('base_service',id);
		this.tplStore.load({
			callback:function(records,opts,success){
				if (records.length){
					this.openEditor(records[0].data.data)					
				} else {
					this.contentPanel.removeAll(true);
					this.startPanel = this.newStartPanel();
					this.contentPanel.setTitle('Выберите источник шаблона');
					this.contentPanel.add(this.startPanel);
					this.contentPanel.doLayout();
				}
			},
			scope:this
		});
	},
	
	newStartPanel: function(config){
		var tplConfig = {
			border:false
		};
		Ext.applyIf(config,tplConfig);
		var startPanel = new App.examination.TemplateStartPanel(config);
		
		startPanel.on('copy',this.copyFromSource,this);
		startPanel.on('edit',this.editTpl,this);
		startPanel.on('empty',this.createEmptyTpl,this);
		return startPanel
	},
	
	createEmptyTpl:function(){
		this.record = new this.cardStore.recordType();
		this.record.set('ordered_service',App.getApiUrl('orderedservice',this.orderId));
		this.cardStore.add(this.record);
		this.openEditor(this.record.data.data)
	},
	
	copyFromSource: function(sourceType,sourceId){
		if (!sourceId){
			this.createEmptyCard();
			return
		} else {
			var store = this[sourceType+'Store']
			store.setBaseParam('id',sourceId);
			store.load({callback:function(records){
				if (!records.length){
					console.log('Источник не найден: ',sourceType,' ',sourceId);
					this.createEmptyCard();
					return
				} else {
					var source = records[0];
					this.record = new this.cardStore.recordType();
					Ext.applyIf(this.record.data,source.data);
					delete this.record.data['id'];
					this.record.set('ordered_service',App.getApiUrl('orderedservice',this.orderId));
					this.cardStore.add(this.record);
					this.openEditor(this.record.data.data)
				}
			},scope:this});
		}
	},
	
	editTpl: function(source,tplId){
		if(source!='tpl'){
			console.log('На редактирование передан не шаблон');
			return 
		}
		if (!tplId){
			this.createEmptyCard();
			return
		} else {
			this.tplStore.setBaseParam('id',tplId);
			this.tplStore.load({callback:function(records){
				if (!records.length){
					console.log('Шаблон не найден: ',tplId);
					this.createEmptyCard();
					return
				} else {
					this.record = records[0];
					this.openEditor(this.record.data.data)
				}
			},scope:this});
		}
	},
	
	openEditor: function(data){
		this.cardBody = new Ext.Panel();
		this.contentPanel.removeAll(true);
		this.contentPanel.add(this.cardBody);
		this.contentPanel.doLayout();
	}
		
});


Ext.reg('templateapp', App.examination.TemplateApp);
