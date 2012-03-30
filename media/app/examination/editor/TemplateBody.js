Ext.ns('App.examination');
Ext.ns('App.patient');

App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('examtemplate'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Template
		});
		
		//Для создания направлений нужна запись текущего пациента
		this.patientStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : get_api_url('patient'),
			model: App.models.Patient
		});

		this.menuBtns = {};
		
		
		
//		this.fieldSetStore.each(function(record){
//			var rec = record.data; 
//			this.menuBtns[rec.name] = {
//				text:rec.title,
//				id:rec.name,
//				order:rec.order,
//				handler:this.onAddSection.createDelegate(this,[rec.name,rec.title,rec.order]),
//				scope:this
//			};
//			this.sectionMenu.insert(rec.order,this.menuBtns[rec.name])
//			this.subSecBtns[rec.name] = [];
//		},this);
		
		this.menuBtns['services'] = {
			text:'Услуги',
			id:'services',
			order:99,
			handler:this.openAsgmtTab.createDelegate(this,[]),
			scope:this
		};
		
		this.menuBtns['equipment'] = {
			text:'Оборудование',
			id:'equipment',
			order:98,
			handler:this.openEquipTab.createDelegate(this,[]),
			scope:this
		};
		
		this.addSecBtn = new Ext.Button({
			iconCls:'silk-add',
			text:'Добавить раздел',
			menu:this.sectionMenu,
			scope:this
		});
		
//		if (!this.fieldSetStore.data.length) {
//			this.addSecBtn.disable();
//		};
		
		this.previewBtn = new Ext.Button({
			iconCls:'silk-zoom',
			text: 'Просмотр',
			handler:this.onPreview.createDelegate(this,[this.card]),
			scope:this
		});
		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
			text: 'Печать',
			handler:this.onPrint.createDelegate(this,[this.card]),
			scope:this
		});
		this.closeBtn = new Ext.Button({
			iconCls:'silk-door-out',
			text: this.isCard ? 'Закрыть карту осмотра' : 'Закрыть шаблон',
			handler:this.onClose.createDelegate(this),
			scope:this
		});
		
		this.svgBtn = new Ext.Button({
			text: 'svg',
			handler:this.onSVGOpen.createDelegate(this),
			scope:this
		});
		
		this.historyBtn = new Ext.Button({
			iconCls:'silk-package',
			hidden:!this.isCard,
			text: 'История пациента',
			handler:this.onHistoryOpen.createDelegate(this),
			scope:this
		});
		
		this.tmpBtn = new Ext.Button({
			text: 'text',
			handler:this.onAddSubSection.createDelegate(this,['text']),
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({
			items: ['-',this.printBtn,this.previewBtn,'-', this.historyBtn,'-', this.closeBtn]
		});
		
/*		this.equipTab = new App.examination.EquipmentTab({
			id:'equip-tab',
			listeners:{
				setdata:function(field,value){
					this.record.set(field,value);
				},
				beforeclose:function(){
					this.record.beginEdit();
					this.record.set('equipment','');
					this.record.set('area','');
					this.record.set('scan_mode','');
					this.record.set('thickness','');
					this.record.set('width','');
					this.record.set('contrast_enhancement','');
					this.record.endEdit();
					return true
				},
				scope: this
			}
		});*/
		
		this.dataTab = new App.examination.TicketTab({
			title:'Осмотр',
			staff:this.staff,
			base_service:this.base_service,
			record:this.record,
			closable:false,
			autoScroll:true
		})
		
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		},
		this.on('tabchange',function(panel,tab){
			if (tab){
				App.eventManager.fireEvent('tmptabchange');
			};
		},this);
		
		this.on('beforedestroy',function(){
			if (!this.record.data.equipment){
				this.record.beginEdit();
				this.record.set('area','');
				this.record.set('scan_mode','');
				this.record.set('thickness','');
				this.record.set('width','');
				this.record.set('contrast_enhancement','');
				this.record.endEdit();
			}
		},this);
		
		this.on('beforeticketremove', function(ticket){
			/* тут можно узнать что тикет будет удален
			 * если не надо удалять - можно вернуть false
			 */
			return true
		},this);
		
		this.on('ticketremove', function(ticket){
			// а тут тикет уже удален
			var tab = this.getActiveTab();
			this.removeTicket(tab.section,ticket.title)
			
		},this);

//		this.on('ticketremove', this.removeTicket,this);
		
		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
			this.ticket = undefined;
		},this);
		
		this.generalTab.on('printnamechange',function(newValue,oldValue){
			if (this.record){
				this.record.set('print_name',newValue);
			}
		},this);
		
		this.generalTab.on('setmkb',function(value){
			if (this.record){
				this.record.set('mkb_diag',value);
			}
		},this);
		
		this.generalTab.on('setassistant',function(value){
			if (this.record){
				this.record.set('assistant',value);
			}
		},this);
		
		this.generalTab.on('movearhcivetmp',function(){
			this.record.set('base_service','');
			this.fireEvent('movearhcivetmp');
		},this);
		
		this.generalTab.on('openasgmt',function(){
			this.openAsgmtTab();

			this.fireEvent('openasgmt');
			
			
		},this);
		
		this.generalTab.on('movearhcivecard',function(){
			var archiveRecord = new this.tmpStore.model();
			Ext.applyIf(archiveRecord.data,this.record.data);
			archiveRecord.set('staff',this.staff);
			delete archiveRecord.data['base_service']
			delete archiveRecord.data['id'];
			this.tmpStore.add(archiveRecord);
			
			this.fireEvent('movearhcivecard');
		},this);
				
		this.generalTab.on('deletetmp',function(){
			this.record.set('deleted',true);
			this.fireEvent('deletetmp');
		},this);
				
		this.generalTab.on('changetitle',function(text){
			this.record.set('print_name',text);
			this.fireEvent('changetitle',text);
		},this);
				
		this.generalTab.on('equiptab',function(){
			this.openEquipTab();
		},this);
		
		

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(form){
			
			this.fieldSetStore = new Ext.data.RESTStore({
				autoSave: false,
				autoLoad : false,
				apiUrl : get_api_url('examfieldset'),
				model: App.models.FieldSet
			});
			
			this.subSectionStore = new Ext.data.RESTStore({
				autoSave: false,
				autoLoad : false,
				apiUrl : get_api_url('examsubsection'),
				model: App.models.SubSection
			});
			
			this.fillSectionMenu();
			
			this.insert(0,this.dataTab);
			
			this.generalTab.setPrintName(this.print_name);
			
//			if (this.record.data.data) {
//				this.loadData(this.record.data.data);
//			} else {
//				this.generalTab.setPrintName(this.print_name);
//			};
			
			
			
			this.insert(0,this.generalTab);
			
			if (this.record.data.equipment){
				this.openEquipTab(this.record);				
			} else {
				this.sectionMenu.insert(98,this.menuBtns['equipment'])
				this.subSecBtns['equipment']=[];
				this.addSecBtn.enable();
			};
			
			if (this.isCard){
				if (!this.record.data.id){
					this.sectionMenu.insert(99,this.menuBtns['services'])
					this.subSecBtns['services']=[];
					this.addSecBtn.enable();
					return
				} else {
					var asgmt_tab = this.newAsgmtTab();
					asgmt_tab.store.setBaseParam('patient',this.patient);
					asgmt_tab.store.setBaseParam('card',this.record.data.id);
					asgmt_tab.store.load({callback:function(records){
						if (!records.length){
							this.sectionMenu.insert(99,this.menuBtns['services'])
							this.subSecBtns['services']=[];
							this.addSecBtn.enable();
							return
						};
						this.patientStore.setBaseParam('id',this.patient);
						this.patientStore.load({callback:function(records){
							if(records.length){
								this.asgmtTab = asgmt_tab;
								this.asgmtTab['patientRecord'] = records[0];
								this.insert(this.asgmtTab.order,this.asgmtTab);
							}
						},scope:this})
					},scope:this})
				}
			};
			this.setActiveTab(0);
			
//			this.loadData();
			
		},this)
	},
	
	onAddSection: function(section,title,order,data){
		this.dataTab.addSection(section,title,order,data);
		
		this.sectionMenu.remove(section);
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.addSubSecBtn.enable();
		this.setActiveTab(this.dataTab);
		this.doLayout();
		if (!this.dataLoading){
			this.updateRecord();
		};
	},
	
	onAddSubSection: function(title,section,order,data){
		this.dataTab.addTicket(title,section,order,data);
		this.doLayout();
		this.updateRecord();
	},
	
	updateRecord: function(){
		if (this.dataLoading) {
			return false;
		};
		var data = this.dataTab.getData();
		
		data = Ext.encode(data);
		this.record.set('data', data);
	},
	
	loadData: function(sectionPlan){
		var recData = this.record.data.data;
		this.generalTab.setPrintName(this.record.data.print_name || this.print_name);
		if (!recData){
			return false
		}
		this.dataLoading = true;
		var data = Ext.decode(recData);
		this.dataTab.loadData(data,sectionPlan)
//		Ext.each(data,function(section){
//			var sec = this.sectionPlan[section.section];
//			var tab = this.onAddSubSection(section.section,sec.name,sec.order,section);
//			this.doLayout();
//		},this);
//		this.setActiveTab(0);
		this.dataLoading = false;
		
	},
	
	printUrlTpl : "/exam/card/{0}/",
	
	onPreview: function(isCard){
		var essence = isCard?'card':'template';
		App.eventManager.fireEvent('launchapp','panel',{
			title:'Просмотр: ' + this.record.data.print_name,
			closable:true,
			autoScroll:true,
			tbar:[{
				iconCls:'silk-printer',
				text:'Печать',
				handler:function(){
					var url = String.format(this.printUrlTpl,this.record.data.id);
					window.open(url);
				},
				scope:this
			}],
			autoLoad:String.format('/widget/examination/{0}/{1}/',essence,this.record.data.id)
		});
	},
	
	onPrint : function(){
		var url = String.format(this.printUrlTpl,this.record.data.id);
		window.open(url);
	},
	
	onClose: function(){
		if (this.isCard){
			this.fireEvent('cardclose');
		} else {
			this.fireEvent('tmpclose');
		}
	},
	
	removeTicket:function(section,ticketTitle){
		var data = Ext.decode(this.record.data.data);
		Ext.each(data,function(sec,i){
			if (sec.section === section){
				Ext.each(sec.tickets,function(ticket,j){
					if (ticket.title === ticketTitle){
						delete sec.tickets[j];
					}
				})
			}
		});
		this.record.set('data',Ext.encode(data));
	},
	
	onSVGOpen: function(){
		this.svgTab = new Ext.form.FormPanel({
			title: 'SVG',
			html:'<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1</title><path d="m103,141c0,0 1,2 4,3c6,2 14.92654,5.24704 28,9c14.92152,4.28348 33.94696,11.14897 45,15c14.93108,5.20219 27.95712,10.10892 38,14c7.96692,3.08676 16.88153,9.19028 20,11c3.86798,2.24469 6,4 7,4c1,0 1,0 1,0c4,0 7.15927,-1.61064 10,-3c3.23892,-1.58411 8,-4 12,-6c4,-2 5.05664,-2.91753 8,-5c4.0817,-2.88786 6,-4 8,-5c2,-1 2.69345,-1.4588 4,-2c1.84775,-0.76537 2,0 3,0c0,0 -0.70209,1.57356 -8,5c-7.73398,3.63118 -15.12323,5.58006 -26,9c-14.18158,4.45905 -32.97755,10.16399 -47,12c-41.93861,5.4912 -52.9473,7.41209 -67,9c-11.96545,1.35205 -20.9258,2.49756 -26,3c-2.9854,0.29561 -3,0 -2,0c6,0 21.00519,-0.47792 43,0c46.03259,1.00023 74.10101,5.28273 105,10c17.06494,2.60527 43.02206,7.83705 51,9c6.01913,0.87743 7,2 7,2c0,1 -8.983,3.12286 -23,5c-15.98184,2.14026 -39,7 -39,7c-1,1 -1.203,1.2565 0,2c10.75998,6.65002 22.80313,7.49426 40,9c3.98474,0.34891 5,0 5,0c-2,0 -10.43628,-1.45755 -96,15c-36.21437,6.96558 -51.35664,9.68225 -68,24c-4.85411,4.17584 -4.5696,6.17807 -4,7c4.86662,7.02252 18.9465,4.99936 47,6c4.99683,0.17822 9,0 9,1c0,0 -1.71513,4.53622 -7,7c-27.80286,12.96155 -44.6877,9.63748 -55,19c-1.65553,1.50305 -1,2 4,2c13,0 34.98126,0.49985 55,1c10.99657,0.27475 13,0 13,0c0,0 0,1 0,1l0,0l0,0" id="svg_1" stroke-width="5" stroke="#000000" fill="none"/><path d="m405,223c0,1 0,3 0,5c0,4 0.44241,9.01224 0,17c-0.50076,9.04153 -4.16434,27.979 -6,43c-1.09845,8.98853 -3,19 -3,22c0,3 0,5 0,6c0,0 3,0 6,0c3,0 6,0 7,0c1,0 1,0 1,1c0,2 -1.16797,8.92035 -3,13c-2.20605,4.91257 -2.4588,6.69345 -3,8c-0.38269,0.92389 0,2 0,2c5,1 9,1 15,1c1,0 2,0 2,0c0,1 0,2 0,6c0,0 0,1 0,1c3,0 8.95847,0.49924 18,1c7.98776,0.44241 15.88535,1.99707 29,3c2.99127,0.22876 7,1 9,1c0,0 5.186,-0.69254 7,-2c3.4418,-2.48071 4.186,-3.69254 6,-5c1.14728,-0.8269 1.80292,-2.00974 2,-4c0.50244,-5.07422 1.59216,-24.00925 2,-33c0.50052,-11.034 2.24857,-19.97583 3,-29c1.49597,-17.96558 1,-23 1,-27c0,-2 0,-4 0,-4c-2,-1 -6.01007,-1.28355 -10,-1c-7.05328,0.50127 -10,1 -11,2c0,0 -1,0 -1,0l1,-1l2,-5l3,-6" id="svg_2" stroke-width="5" stroke="#000000" fill="none"/><path d="m550,85c-2,0 -3,0 -6,0c-13,0 -32.03311,1.09149 -50,0c-41.22775,-2.50461 -59.09656,-7.52435 -75,-11c-12.08411,-2.64093 -20.71201,-6.98163 -26,-8c-1.9639,-0.3782 -3,-1 -4,-1c0,0 0.16019,0.01291 0,1c-0.50653,3.12144 -0.52786,6.76393 -5,9c-0.89444,0.4472 -5.07492,2.22183 -15,1c-12.27664,-1.51132 -29.94772,-10.12045 -69,-27c-13.98141,-6.04318 -34.79025,-14.99023 -42,-16c-3.96133,-0.55481 -4,0 -4,0c-1,0 -0.83981,0.01291 -1,1c-0.50655,3.12144 -3,9 -4,11c-1,2 -5.04132,4.84723 -9,6c-6.07233,1.76826 -8.94341,3.14774 -14,5c-2.96933,1.08769 -6.11649,2.79486 -8,4c-5.39359,3.45099 -9,8 -13,14c-2,3 -2.51962,6.07483 -4,14c-0.75708,4.05301 -1,12 -1,18c0,8 -0.276,12.22273 3,16c7.41275,8.54698 19.22191,14.68564 25,19c6.25816,4.67282 13,11 19,16l1,2l2,2l0,0" id="svg_3" stroke-width="5" stroke="#000000" fill="none"/><rect id="svg_4" height="144" width="323" y="218" x="284" stroke-width="5" stroke="#000000" fill="#FF0000"/></g></svg>'
		});
		this.add(this.svgTab);
		this.setActiveTab(this.svgTab);
	},
	
	onHistoryOpen: function(){
		var name = this.patient_name.split(' ');
		
		config = {
			closable:true,
			title:name[0] + ': История',
    		patient:this.patient,
    		patient_name: this.patient_name,
			staff:this.staff
		}
		App.eventManager.fireEvent('launchapp', 'patienthistory',config);
	},
	
	newAsgmtTab: function(){
		var asgmt_tab = new App.patient.AsgmtGrid({
			title:'Услуги',
			closable:false,
			card_id:this.record.data.id,
			order:99,
			hasPatient:true,
			listeners:{
				'close': function(p){
					this.sectionMenu.insert(99,this.menuBtns['service']);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					};
					this.asgmtTab = undefined;
				},
				scope:this
			}
		});
		return asgmt_tab
	},
	
	openAsgmtTab: function(){
		if(this.asgmtTab){
			this.setActiveTab(this.asgmtTab);
		} else {
			this.patientStore.setBaseParam('id',this.patient);
			this.patientStore.load({callback:function(records){
				if (!records.length){
					return
				}
				this.patientRecord = records[0]
				this.asgmtTab = this.newAsgmtTab();
				this.asgmtTab.store.setBaseParam('card',this.record.data.id);
				this.asgmtTab.setActivePatient(this.patientRecord);
				this.insert(this.asgmtTab.order,this.asgmtTab)
				this.setActiveTab(this.asgmtTab);
				this.doLayout();	
			},scope:this});
		};
		this.sectionMenu.remove('services');
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.doLayout();
	},
	
	newEquipTab : function(){
		var equip_tab = new App.examination.EquipmentTab({
			id:'equip-tab',
			listeners:{
				setdata:function(field,value){
					this.record.set(field,value);
				},
				beforeclose:function(){
					this.record.beginEdit();
					this.record.set('equipment','');
					this.record.set('area','');
					this.record.set('scan_mode','');
					this.record.set('thickness','');
					this.record.set('width','');
					this.record.set('contrast_enhancement','');
					this.record.endEdit();
					return true
				},
				close: function(p){
					this.sectionMenu.insert(98,this.menuBtns['equipment']);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					};
					this.equipTab = undefined;
				},
				scope: this
			}
		});
		return equip_tab
	},
	
	openEquipTab: function(record){
		if (!this.equipTab){
			this.equipTab = this.newEquipTab();
			this.add(this.equipTab);
			if (record){
				this.equipTab.loadRecord(record);
			} else {
				this.setActiveTab(this.equipTab);
			}
		} else {
			this.setActiveTab(this.equipTab);
		};
		this.sectionMenu.remove('equipment');
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.doLayout();
	},
	
	fillSectionMenu: function(){
		this.sectionMenu = new Ext.menu.Menu({
			items:[]
		});
		
		this.sectionItems = new Ext.menu.Menu({
			items:[]
		});
		
		this.subSecBtns = {}
		
		this.sectionPlan = {};
		this.fieldSetStore.load({callback:function(records){
			//формируем структуру разделов
			Ext.each(records,function(record){
				var rec = record.data;
				this.sectionPlan[rec.name] = {
					'name':rec.name,
					'title': rec.title,
					'order': rec.order
				};
				this.subSecBtns[rec.name] = []
			},this);
			this.subSectionStore.load({callback:function(records){
				//сортируем подразделы по разделам
				Ext.each(records,function(record){
					var rec = record.data; 
					var item = {
						text:rec.title,
						handler:this.onAddSubSection.createDelegate(this,[rec.title,rec.section_name,this.sectionPlan[rec.section_name].order]),
						scope:this
					};
					this.subSecBtns[rec.section_name].push(item);	
				},this);
				
				//заполняем меню кнопки Добавить элемент
				for (rec in this.sectionPlan){
					var section = this.sectionPlan[rec]
					//вставляем заголовки разделов в главное меню
					this.sectionItems.add(String.format('<b class="menu-title">{0}</b>',section.title));
					Ext.each(this.subSecBtns[section.name],function(subSec){
						this.sectionItems.add(subSec);
					},this)
					//добавляем ко всем разделам 'произвольный' подраздел
					var emptySubSec = {
						text:'Произвольный',
						handler:this.onAddSubSection.createDelegate(this,['Заголовок',section.name,section.order]),
						scope:this
					};
					this.sectionItems.add(emptySubSec);
				}
				
				this.addSubSecBtn = new Ext.Button({
					iconCls:'silk-page-white-add',
					text:'Добавить подраздел',
					menu:this.sectionItems
				});
				
				if (this.sectionItems.items.length){
					this.addSubSecBtn.enable();
				} else {
					this.addSubSecBtn.disable();
				};
				
				this.ttb.insert(0,this.addSubSecBtn);
				this.doLayout();
				
				//После того, как кнопка с разделами сгенерировалась, можно загружать данные,
				//чтобы передать в форму тикетов порядок следования разделов, который может быть изменен в базе
			
			},scope:this});
			this.loadData(this.sectionPlan);
		},scope:this});
		
	}
	

});

Ext.reg('templatebody',App.examination.TemplateBody);