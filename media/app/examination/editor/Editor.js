Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.staff = App.getApiUrl('staff')+ '/' + active_staff;
		
		this.tmpStore = new Ext.data.RESTStore({
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
// 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Выберите услугу',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
		
		var config = {
//			id: 'editor-cmp',
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
			if (this.editMode){
				if (this.record){
					this.onEditTmp(this.record)
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
					this.contentPanel.setTitle('Шаблон ' + this.tmpBody.print_name);
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
			print_name:this.print_name,
			fromArchive:config.fromArchive
		});
		
		return new App.examination.TemplateBody (Ext.apply(
			{
				editMode: this.editMode,
				base_service : this.base_service,
				fieldSetStore : this.fieldSetStore,
				subSectionStore : this.subSectionStore,
				staff:this.staff,
				generalTab: this.generalTab,
				patient_name:this.patient_name,
				title:'Заголовок',
				listeners:{
					movearhcivetmp:function(){
						this.onServiceClick(this.attrs)
					},
					deleterecord:function(){
						if(this.editMode){
							this.fireEvent('close',this);
						}
						this.contentPanel.removeAll();
						if(this.attrs){
							this.onServiceClick(this.attrs)
						}
					},
					changetitle: function(text){
						this.contentPanel.setTitle('Шаблон ' +text);
					},
					tmpclose: function(){
						if(this.editMode){
							this.fireEvent('close',this);
						} else {
							this.contentPanel.removeAll(true);
							this.contentPanel.setTitle('Выберите услугу');
							this.contentPanel.doLayout();
						}
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
			this.generalTab.print_name = this.tmpBody.print_name;
			this.contentPanel.setTitle('Шаблон ' + this.tmpBody.print_name);
			this.contentPanel.add(this.tmpBody);
			this.contentPanel.doLayout();
		},this);
		
		startPanel.on('edittmp',function(record){
			this.onEditTmp(record)
		},this);
		
		return startPanel;
	},
	
	onEditTmp: function(record){
		this.contentPanel.removeAll(true); // tmpStore из StartPanel уничтожен, нужно теперь искать запись в другом store
		this.print_name = record.data.print_name;
		this.tmpStore.setBaseParam('id',record.data.id);
		delete this.tmpStore.baseParams['base_service'];
		this.tmpStore.load({callback:function(records){
			if (records.length){
				delete this.tmpStore.baseParams['id'];
				this.tmpStore.setBaseParam('base_service',this.base_service);
				this.tmpBody = this.newTmpBody({
					print_name: records[0].data.print_name,
					record:records[0],
//					fromArchive:true,
					card:false // признак того, что это не карта
				});
				this.contentPanel.setTitle(records[0].data.print_name);
				this.contentPanel.add(this.tmpBody);
				this.contentPanel.doLayout();
			}
		},scope:this});
	}
});


Ext.reg('editor', App.examination.Editor);
