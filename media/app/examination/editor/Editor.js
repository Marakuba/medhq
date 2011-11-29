Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		Ext.Ajax.request({
			url:get_api_url('position'),
			method:'GET',
			params: {id: active_profile},
			success:function(resp, opts) {
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.staff = item.staff;
				}, this);
			},
			scope: this
		});
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			model: App.models.Template
		});
		
		this.fieldSetStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : get_api_url('examfieldset'),
			model: App.models.FieldSet
		});
		
		this.subSectionStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : true,
			apiUrl : get_api_url('examsubsection'),
			model: App.models.SubSection
		});
		
		this.serviceTree = new App.ServiceTreeGrid ({
//			layout: 'fit',
			region:'west',
			baseParams:{
				payment_type:'н',
				staff : active_profile,
				nocache : true
			},
			autoScroll:true,
			width:250,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true
		});
		
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Выберите услугу',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
		
		var config = {
			id: 'editor-cmp',
			closable:true,
			title: 'Конструктор',
			layout: 'border',	
     		items: [
				this.serviceTree,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.Editor.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(form){
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
		
		this.base_service = get_api_url('baseservice') + '/' + id;
		
		this.tmpStore.setBaseParam('base_service',id);
		this.tmpStore.load({
			callback:function(records,opts,success){
				if (records.length){
					this.contentPanel.removeAll(true);
					this.tmpBody = this.newTmpBody({
						print_name:records[0].data.print_name,
						record : records[0]
					});
					this.contentPanel.setTitle(this.tmpBody.print_name);
					this.contentPanel.add(this.tmpBody);
					this.contentPanel.doLayout();
					
				} else {
					this.contentPanel.removeAll(true);
					this.startPanel = this.newStartPanel({
						print_name:this.print_name,
						staff:this.staff
					});
					this.contentPanel.setTitle('Выберите источник шаблона');
					this.contentPanel.add(this.startPanel);
					this.contentPanel.doLayout();
				}
			},
			scope:this
		});
	},
	
	newTmpBody: function(config){
		
		this.generalTab = new App.examination.GeneralTab({
			print_name:this.print_name
		});
		
		return new App.examination.TemplateBody (Ext.apply(
			{
				base_service : this.service,
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				generalTab: this.generalTab,
				title:'Заголовок',
				listeners:{
					movearhcivetmp:function(){
						this.onServiceClick(this.attrs)
					},
					deletetmp:function(){
						this.onServiceClick(this.attrs)
					},
					changetitle: function(text){
						this.contentPanel.setTitle(text);
					},
					scope:this
				}
			},
			config)
		);
	},
	
	newStartPanel: function(config){
		var startPanel = new App.examination.StartPanel(config);
		
		startPanel.on('opentmp',function(source){
			this.contentPanel.removeAll(true);
			if (!source){
				this.record = new this.tmpStore.model();
				this.record.set('print_name',this.print_name);
			} else {
				this.record = new this.tmpStore.recordType(source.data);
				if (!this.record.data.print_name){
					this.record.set('print_name',this.print_name);
				};
				delete this.record.data['id'];
			};
			this.record.set('base_service',this.base_service);
			this.record.set('staff',this.staff);
			this.tmpStore.add(this.record);
			this.tmpBody = this.newTmpBody({
				print_name:this.record.data.print_name ? this.record.data.print_name: this.print_name,
				record:this.record,
				base_service:this.service
			});
			this.contentPanel.setTitle(this.tmpBody.print_name);
			this.contentPanel.add(this.tmpBody);
			this.contentPanel.doLayout();
		},this);
		
		return startPanel;
	}
});


Ext.reg('editor', App.examination.Editor);
