Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.TemplateApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		/*
		 *Данный компонент является менеджером карт осмотра
		 *На входе он получает следующие параметры:
		 *tplRecord - запись шаблона для редактирования
		 *tplId
		 *
		 *Если передан tplId, то этот шаблон ищется в store, оттуда берется поле data и передается в 
		 *редактор. 
		 *Если данные изменились, редактор шлет событие с измененными данными - полем data
		 *Менеджер заносит это поле в редактируемую запись шаблона и сохраняет store.
		 *
		*/
		
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
		
		this.tplStore.on('write',function(store, action, result, res, rs){
			if (action == 'create'){
				this.tplId = rs.data.id;
				if (this.tplBody && this.tplBody.setTplId){
					this.tplBody.setTplId(this.tplId);
				}
			}
			if (rs.data.deleted){
				this.destroy();
			}
		},this);
		
		this.serviceTree = new App.ServiceTreeGrid ({
//			layout: 'fit',
			region:'west',
			collapsed:!!this.tplId,
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
 			title:this.title ? 'Шаблон '+ this.title : 'Выберите услугу',
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
			if (this.tplId){
				this.editTpl('tpl',this.tplId)
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
		this.baseServiceName = attrs.text;
		
		this.baseServiceId = id;
		
		this.tplStore.setBaseParam('base_service',id);
		this.tplStore.setBaseParam('staff',active_staff);
		this.tplStore.load({
			callback:function(records,opts,success){
				if (records.length){
					this.record = records[0];
					this.openEditor(records[0].data.data)					
				} else {
					this.contentPanel.removeAll(true);
					this.startPanel = this.newStartPanel({
						baseServiceId:this.baseServiceId
					});
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
		this.serviceTree.collapse();
		var emptyData = Ext.encode({'tickets':[]});
		this.record = new this.tplStore.recordType();
		this.record.set('data',emptyData);
		this.record.set('staff',App.getApiUrl('staff',active_staff));
		if (this.baseServiceName){
			this.record.set('name',this.baseServiceName);
		};
		this.record.set('base_service',App.getApiUrl('baseservice',this.baseServiceId));
		this.tplStore.add(this.record);
		this.tplStore.save();
		this.openEditor(this.record.data.data)
	},
	
	copyFromSource: function(sourceType,sourceId){
		if (!sourceId){
			this.createEmptyTpl();
			return
		} else {
			var store = this[sourceType+'Store'];
			store.baseParams = {
				id:sourceId,
				format:'json'
			}
//			delete store.baseParams['base_service'];
//			delete store.baseParams['staff'];
//			store.setBaseParam('id',sourceId);
			store.load({
				callback:function(records){
					if (!records.length){
						console.log('Источник не найден: ',sourceType,' ',sourceId);
						this.createEmptyTpl();
						return
					} else {
						this.serviceTree.collapse();
						var source = records[0];
						this.record = new this.tplStore.recordType();
						this.tplStore.autoSave = false;
						Ext.applyIf(this.record.data,source.data);
						store.baseParams = {
							format:'json',
							staff:active_staff,
							deleted:false
						};
						this.record.set('name',this.baseServiceName);
						this.record.set('staff',App.getApiUrl('staff',active_staff));
						this.record.set('base_service',App.getApiUrl('baseservice',this.baseServiceId));
						this.tplStore.add(this.record);
						this.tplStore.save();
						this.tplStore.autoSave = true;
						this.openEditor(this.record.data.data)
					}
				},
				scope:this
			});
		}
	},
	
	editTpl: function(source,tplId){
		
		if(source!='tpl'){
			console.log('На редактирование передан не шаблон');
			return 
		}
		if (!tplId){
			this.createEmptyTpl();
			return
		} else {
			this.serviceTree.collapse();
			this.tplId = tplId;
			this.tplStore.setBaseParam('id',tplId);
			this.tplStore.load({callback:function(records){
				if (!records.length){
					console.log('Шаблон не найден: ',tplId);
					this.createEmptyTpl();
					return
				} else {
					this.record = records[0];
					this.openEditor(this.record.data.data)
				}
			},scope:this});
		}
	},
	
	openEditor: function(data){
		if (data) {
			var decodedData = Ext.decode(data)
		} else {
			var decodedData = {}
		};
		this.tplBody = new App.examination.TplTicketTab({
			data:decodedData,
			tplId : this.tplId,
			listeners:{
				scope:this,
				dataupdate:this.updateData
			}
		});
		this.contentPanel.removeAll(true);
		this.contentPanel.add(this.tplBody);
		this.contentPanel.doLayout();
	},
	
	updateData: function(data){
		var encodedData = Ext.encode(data);
		this.record.set('data',encodedData);
		this.tplStore.save();
	}	
		
});


Ext.reg('templateapp', App.examination.TemplateApp);
