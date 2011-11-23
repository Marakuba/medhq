Ext.ns('App.examination');
Ext.ns('App.ServicePanel');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			model: App.models.Template,
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
		
		this.serviceTree = new App.visit.VisitServicePanel ({
			layout: 'fit',
			region:'west',
			width:250,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true
		});
		
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			layout: 'fit',
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
		
		this.serviceTree.on('serviceclick',function(attrs){
			this.attrs = attrs;
			this.onServiceClick(this.attrs)
		},this);
	},
	
	onServiceClick: function(attrs){
		var ids = attrs.id.split('-');
		var id = ids[0];
		var re = /(.*) \[\d+\]/;
		var res = re.exec(attrs.text);
		this.print_name = res[res.length-1];
		
		this.base_service = '';
		
		Ext.Ajax.request({
			url:get_api_url('position'),
			method:'GET',
			params: {id: active_profile},
			success:function(resp, opts) {
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.staff = item.staff;
				}, this);
				Ext.Ajax.request({
					url:get_api_url('baseservice'),
					method:'GET',
					params: {id: id},
					success:function(resp, opts) {
						var jsonResponse = Ext.util.JSON.decode(resp.responseText);
						Ext.each(jsonResponse.objects, function(item,i){
							this.base_service = item.resource_uri;
						}, this);
						
						this.tmpStore.setBaseParam('base_service',App.uriToId(this.base_service));
						this.tmpStore.load({
							callback:function(records,opts,success){
								if (records.length){
									this.contentPanel.removeAll(true);
									this.tmpBody = this.newTmpBody({
										record : records[0]
									});
									this.contentPanel.add(this.tmpBody);
									this.contentPanel.doLayout();
									
								} else {
									this.contentPanel.removeAll(true);
									this.startPanel = this.newStartPanel({
										staff:this.staff
									});
									this.contentPanel.add(this.startPanel);
									this.contentPanel.doLayout();
								}
							},
							scope:this
						});
					},
					scope:this
				});
			},
			scope:this
		});
		
	},
	
	newTmpBody: function(config){
		return new App.examination.TemplateBody (Ext.apply(
			{
				base_service : this.service,
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				listeners:{
					movearhcivetmp:function(){
						this.onServiceClick(this.attrs)
					},
					deletetmp:function(){
						this.onServiceClick(this.attrs)
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
			this.contentPanel.add(this.tmpBody);
			this.contentPanel.doLayout();
		},this);
		
		return startPanel;
	}
});


Ext.reg('editor', App.examination.Editor);
