Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.CardApp = Ext.extend(Ext.Panel, {
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
		
		this.tplStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Template
		});
		
		this.cardStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('card'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Card
		});
		
		this.cardStore.on('write',function(store, action, result, res, rs){
			if (rs.data.deleted){
				this.destroy();
			}
		},this)
		
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
	
		var config = {
			closable:true,
//			title: 'Карта осмотра',
			layout: 'border',	
     		items: [
//				this.patientPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			console.log(section_scheme)
			if (this.record){
				this.editCard(this.record.data.id)
			}
			else {
				this.startPanel = this.newStartPanel({
					baseServiceId:this.baseServiceId,
					orderId:this.orderId,
					patientId:this.patientId
				});
				this.contentPanel.add(this.startPanel);
			}
		},this);
		
		
	},
	
	
	newStartPanel: function(config){
		var cardConfig = {
			border:false
		};
		Ext.applyIf(config,cardConfig);
		var startPanel = new App.examination.CardStartPanel(config);
		
		startPanel.on('copy',this.copyFromSource,this);
		startPanel.on('edit',this.editCard,this);
		startPanel.on('empty',this.createEmptyCard,this);
		return startPanel
	},
	
	createEmptyCard:function(){
		console.log('empty');
		this.record = new this.cardStore.recordType();
		this.record.set('ordered_service',App.getApiUrl('orderedservice',this.orderId));
		this.cardStore.add(this.record);
		this.openTickets(this.record.data.data)
	},
	
	copyFromSource: function(sourceType,sourceId){
		console.log('copy ',sourceType,' ',sourceId);
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
					this.openTickets(this.record.data.data)
				}
			},scope:this});
		}
	},
	
	editCard: function(sourceType,cardId){
		console.log('edit ',sourceType,' ',cardId);
		if (sourceType !='card') {
			console.log('На редактирование передана не карта');
			return
		}
		if (!cardId){
			this.createEmptyCard();
			return
		} else {
			this.cardStore.setBaseParam('id',cardId);
			this.cardStore.load({callback:function(records){
				if (!records.length){
					console.log('Карта не найдена: ',cardId);
					this.createEmptyCard();
					return
				} else {
					this.record = records[0];
					this.openTickets(this.record.data.data)
				}
			},scope:this});
		}
	},
	
	openTickets: function(data){
		var decodedData = Ext.decode(data)
		this.cardBody = new App.examination.TicketTab({
			data:decodedData,
			listeners:{
				scope:this,
				dataupdate:this.updateData,
				oneditticket:this.onEditTicket
			}
		});
		this.contentPanel.removeAll(true);
		this.contentPanel.add(this.cardBody);
		this.contentPanel.doLayout();
	},
	
	updateData: function(data){
		var encodedData = Ext.encode(data);
		this.record.set('data',encodedData);
	},
	
	onEditTicket: function(panel){
		var editorConfig = {
			title:panel.data.title,
			xtype:panel.xtype+'editor',
			data:panel.data,
			fn: panel.afterEdit,
			panel:panel
		}
		App.eventManager.fireEvent('launchapp',panel.xtype+'editor',editorConfig);
//		this.add(panel);
//		this.setActivePanel(panel);
	}
		
});


Ext.reg('cardapp', App.examination.CardApp);
