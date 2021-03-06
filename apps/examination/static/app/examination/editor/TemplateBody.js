Ext.ns('App.examination');
Ext.ns('App.patient');

App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {

	initComponent: function(){

		//Используется для определения режима редактора, для отображения необходимых кнопок в тулбаре
		this.mode = this.isCard ? 'card' : 'template',

		this.essenceText = this.isCard ? 'карту осмотра' : 'шаблон';

		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : App.utils.getApiUrl('examination','examtemplate'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Template
		});

		this.questStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : App.utils.getApiUrl('examination','questionnaire'),
			baseParams:{
				format:'json',
				deleted:false
			},
			model: App.models.Questionnaire
		});

		this.ticketOkBtn = new Ext.Button({
			text:'Ok',
			hidden:true,
			source:'ticket-edit-panel',
			handler:function(){
				var tab = this.getActiveTab();
				if (tab.editComplete){
					tab.editComplete();
				}
			},
			scope:this
		})

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
			text: 'Закрыть '+this.essenceText,
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
			mode:'card',
			scope:this
		});

		this.moveArchiveBtn = new Ext.Button({
			text: this.isCard? 'Переместить в Мои шаблоны': 'Сохранить как шаблон',
			hidden:this.fromArchive,
			handler:function(){
				if (!this.isCard){
					this.record.set('base_service','');
					this.fireEvent('movearhcivetmp');
				} else {
					var archiveRecord = new this.tmpStore.model();
					Ext.applyIf(archiveRecord.data,this.record.data);
					archiveRecord.set('staff',this.staff);
					delete archiveRecord.data['base_service']
					delete archiveRecord.data['id'];
					this.tmpStore.add(archiveRecord);

					this.fireEvent('movearhcivecard');
				}
			},
			scope:this
		});

		this.dltBtn = new Ext.Button({
			text: 'Удалить '+this.essenceText,
			handler:function(){
				this.record.set('deleted',true);
				this.fireEvent('deleterecord')
			},
			scope:this
		});

		this.saveQuestBtn = new Ext.Button({
			text: 'Сохранить',
			source:'questionnaire',
			handler:this.onSaveQuest.createDelegate(this),
			scope:this
		});

		this.removeQuestBtn = new Ext.Button({
			text: 'Удалить анкету',
			source:'questionnaire',
			disabled:true,
			handler:this.onRemoveQuest.createDelegate(this),
			scope:this
		});

		this.editQuestBtn = new Ext.Button({
			text: 'Редактировать анкету',
//			source:'questionnaire',
			disabled:true,
			hidden:true,
			handler:this.onEditQuest.createDelegate(this),
			scope:this
		});

		this.ttb = new Ext.Toolbar({
			items: ['-',this.ticketOkBtn,this.printBtn,this.previewBtn,'-', this.historyBtn, this.closeBtn, this.moveArchiveBtn, this.dltBtn,this.saveQuestBtn,this.removeQuestBtn,this.editQuestBtn]
		});

		this.dataTab = new App.examination.TicketTab({
			title:'Осмотр',
			staff:this.staff,
			base_service:this.base_service,
			record:this.record,
			closable:false,
			isCard:this.isCard,
			patient:this.patient,
			autoScroll:true,
			listeners:{
				scope:this,
				'ticketdataupdate':function(){
					this.updateRecord();
				},
				'drop': function(){
					this.updateRecord();
				},
				'ticketremove':function(){
					this.updateRecord();
				},
				'ticketeditstart':this.onEditTicket,
				'ticketbodyclick':this.onEditTicket
			}
		})

		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		},
		this.on('tabchange',function(panel,tab){
			if (tab){
				this.showTtbItems(tab.type)
				WebApp.fireEvent('tmptabchange');
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
				this.openMedStandarts(value);
			}
		},this);

		this.generalTab.on('setassistant',function(value){
			if (this.record){
				this.record.set('assistant',value);
			}
		},this);

		this.generalTab.on('changetitle',function(text){
			this.record.set('print_name',text);
			this.fireEvent('changetitle',text);
		},this);


		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);

		this.on('afterrender',function(form){

			this.fieldSetStore = new Ext.data.RESTStore({
				autoSave: false,
				autoLoad : false,
				apiUrl : App.utils.getApiUrl('examination','examfieldset'),
				model: App.models.FieldSet
			});

			this.subSectionStore = new Ext.data.RESTStore({
				autoSave: false,
				autoLoad : false,
				apiUrl : App.utils.getApiUrl('examination','examsubsection'),
				model: App.models.SubSection
			});

			this.fillQuestMenu();

			this.insert(0,this.dataTab);

			this.generalTab.setPrintName(this.print_name);

			this.insert(0,this.generalTab);

			this.setActiveTab(0);

		},this)
	},

	onAddSubSection: function(title,section,order,data){
		this.setActiveTab(this.dataTab);
		var ticket_config = {
			title:title,
			section:section,
			order:order,
			type:'text',
			text:data
		};
		this.dataTab.addTicket(ticket_config);
		this.doLayout();
		this.updateRecord();
	},

	updateRecord: function(){
		if (this.dataLoading) {
			return false;
		};
		var allData = this.dataTab.getData();

		var data = Ext.encode(allData[0]);
		var quests = Ext.encode(allData[1]);

		this.record.store.autoSave = false;
		this.record.beginEdit();
		this.record.set('data', data);
		this.record.set('questionnaire',quests);
		this.record.endEdit();
		this.record.store.save();
		this.record.store.autoSave = true;
	},

	loadData: function(sectionPlan){
		var recData = this.record.data.data;
		var quests = this.record.data.questionnaire;
		this.generalTab.setPrintName(this.record.data.print_name || this.print_name);
		if (!recData){
			return false
		}
		this.dataLoading = true;
		if (recData){
			var data = Ext.decode(recData);
		};
		if (quests){
			this.enableQuestBtns(quests == '{}');

			quests = Ext.decode(quests);
		} else {
			this.enableQuestBtns(true);
		}
		this.dataTab.loadData(data,quests,sectionPlan);
		if (this.record.data.equipment){
			this.openEquipTab(this.record);
		}
		this.dataLoading = false;

	},

	printUrlTpl : "/exam/card/{0}/",

	onPreview: function(isCard){
		var essence = isCard?'card':'template';
		WebApp.fireEvent('launchapp','panel',{
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
		WebApp.fireEvent('launchapp', 'patienthistory',config);
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
				scope: this
			}
		});
		return equip_tab
	},

	openEquipTab: function(record){
		//TODO:при открытии вкладки проверять запись на наличие соотв. данных
		//на тот случай, если оборудование не указано, но остальные поля все равно заполнены
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

		this.doLayout();
	},

	fillQuestMenu: function(){
		this.questItems = new Ext.menu.Menu({
			items:[]
		});
		this.questStore.load({callback:function(records){
			Ext.each(records,function(record){
				var rec = record.data;
				this.questItems.add({
					text:rec.name,
					handler:this.openQuestionnaireClick.createDelegate(this,[rec]),
					scope:this
				});
			},this);
			this.questBtn = new Ext.Button({
				text:'Анкеты',
				menu:this.questItems
			});
			this.ttb.insert(0,this.questBtn);
			this.doLayout();
			this.fillSectionMenu();
		},scope:this})
	},

	fillSectionMenu: function(){

		this.sectionItems = new Ext.menu.Menu({
			items:[]
		});

		this.subSecBtns = {}

		this.sectionPlan = {};
		this.additionalMenu = [];
		this.fieldSetStore.load({callback:function(records){
			//формируем структуру разделов
			Ext.each(records,function(record){
				var rec = record.data;
				this.sectionPlan[rec.name] = {
					'name':rec.name,
					'title': rec.title,
					'order': rec.order
				};
				this.subSecBtns[rec.name] = [];

				this.additionalMenu.push({
					text:rec.title,
					handler:this.onAddSubSection.createDelegate(this,['',rec.name,rec.order]),
					scope:this
				});
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
					if (this.subSecBtns[section.name].length){
						this.sectionItems.add(String.format('<b class="menu-title">{0}</b>',section.title));
						Ext.each(this.subSecBtns[section.name],function(subSec){
							this.sectionItems.add(subSec);
						},this)
					}
				};
				this.sectionItems.add('-');
				//добавляем ко всем разделам 'произвольный' подраздел
				if (this.additionalMenu.length)
				{
					var emptySubSec = {
						text:'Произвольный',
						menu:{
							items:this.additionalMenu
						}
	//						handler:this.onAddSubSection.createDelegate(this,['Заголовок',section.name,section.order]),
	//						scope:this
					};
					this.sectionItems.add(emptySubSec);
				};

				this.equipBtn = {
					text:'Оборудование',
					handler:this.openEquipTab.createDelegate(this,[]),
					scope:this
				}

				this.sectionItems.add(this.equipBtn);

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

	},

	openQuestionnaireClick:function(questRecord){
		if (this.questPanel){
			Ext.Msg.alert('Уведомление','Одна анкета уже открыта');
			this.setActiveTab(this.questPanel);
			return
		};

		//Если анкета уже вводилась
		if (this.dataTab.quests[questRecord.name]){
			var questData = this.dataTab.quests[questRecord.name]['data'];
			var code = this.dataTab.quests[questRecord.name]['code'];
		};

		if (!code){
			var rawcode = questRecord.code;
			if (!rawcode) return;
			var code = Ext.decode(rawcode);
		};

		if (!code['items']) {
			Ext.Msg.alert('Синтаксическая ошибка','Нет параметра "items"');
			return
		};
		var quest_config = {
			questName:questRecord.name,
			data:questData,
			code:code,
			title:questRecord.name
		}

		this.openQuest(quest_config);
	},

	openQuest: function(config){
		if (!config['questName']) {
			console.log('Не указаны необходимые параметры: questName');
			return;
		}
		//Проверка на наличие кода панели.
		if (!config['code']) {
			if (this.dataTab.quests){
				config['code'] = this.dataTab.quests[config.questName]['code'];
			} else {
				var ind = this.questStore.findBy('name',config.questName);
				if (ind > -1){
					var rec = this.questStore.getAt(ind);
					var code = rec.data.code;
					if (code){
						config['code'] = Ext.decode(code);
					} else {
						console.log('Не указаны необходимые параметры: code');
						return;
					}
				} else {
					console.log('Не указаны необходимые параметры: code');
					return;
				}
			}
		};

		init_config =
			{
				title:'Анкета',
				type:'questionnaire',
				closable:true,
				listeners:{
					scope:this,
					destroy:function(){this.questPanel = undefined}
				}
			}
		Ext.applyIf(config,init_config);

		this.questPanel = new App.examination.QuestPreviewPanel(config);


		//добавляем элементы в главную панель
		this.questPanel.add(this.questPanel.buildElem(config['code']));


		this.add(this.questPanel);
		this.setActiveTab(this.questPanel);

	},

	questionnaireTicketEdit:function(ticket){
		if (this.questPanel){
			Ext.Msg.alert('Уведомление','Одна анкета уже открыта');
			this.setActiveTab(this.questPanel);
			return
		};
		var config = {
			questName:ticket.questName,
			title:ticket.questName
		};
		var quests = this.dataTab.quests;
		if (quests && quests[ticket.questName]){
			config['data'] = quests[ticket.questName]['data'];
			config['code'] = quests[ticket.questName]['code'];
		}
		this.openQuest(config)
	},

	textTicketEdit:function(ticket){
		this.ticket = ticket;
		var ticketEditor = new App.examination.TicketEditPanel({
			title:'Редактирование: '+ticket.data.title,
			section:ticket.section,
			closable:true,
			staff:this.staff,
			listeners:{
				scope:this,
				editcomplete:function(data){
					if(this.ticket){
						var ticketData = this.ticket.getData();
						Ext.apply(ticketData,data);
						this.ticket.setData(ticketData);
					};
					ticketEditor.destroy();
					this.updateRecord()
				}
			}
		});
		this.add(ticketEditor);
		ticketEditor.loadTicket(ticket);
		this.doLayout();
		this.setActiveTab(ticketEditor)
	},

	onEditTicket: function(ticket){
		this.ticket = ticket;
//		this[(ticket['type'] || 'text') + 'TicketEdit'](ticket)
		this.textTicketEdit(ticket);
	},

	openMedStandarts: function(mkb10){
		var stWin = new App.examination.MedStandartChoiceWindow({
			mkb10:App.utils.uriToId(mkb10),
			listeners:{
				scope:this,
				pushservices:function(records){
					this.dataTab.addStandartServices(records)
				}
			}
		});
		stWin.show();
		this.setActiveTab(this.dataTab)
	},

	showTtbItems: function(source){
		//кнопки в тулбаре разделяются по вкладкам, в которых должны показываться,
		// а так же по режимам редактора: карта осмотра или шаблон
		//вкладка, в которой должна показываться кнопка, указывается в параметре source
		//режим редактора, в которой кнопка должна быть видима, указывается в параметре mode
		//если кнопка должна отображаться во всех режимах и в общей вкладке, параметры source и mode могут быть не заданы
		if (!source){
			source == null
		}
		Ext.each(this.ttb.items.items,function(item){
			if (item.mode && item.mode != this.mode){
				item.hide();
			} else {
				if (item.source == source){
					item.show()
				} else {
					item.hide()
				}
			}
		},this);
		this.doLayout();
	},

	onSaveQuest: function(){
		/*
		 * Сохраняет данные из анкеты.
		 * Сначала проходит проверка, вводилась ли такая анкета (есть соответствующий параметр в dataTab.quests)
		 * Если анкета вводилась, то выбираются все тикеты с именем этой анкеты и заменяются данные
		 * Если анкета не вводилась, то добавляются новые тикеты в соответствующие секциям позиции.
		*/
		if (this.questPanel){
			var questData = this.questPanel.makeTickets();
			var tickets = questData[0];
			var allData = questData[1];
			var questName = questData[2];
			var code = this.questPanel.code;
			if (this.dataTab.quests[questName]) {
				//Если анкета редактируется
				Ext.each(tickets,function(t){
					//ищем редактируемый тикет
					var edTicket = this.dataTab.findByTitle(t.questName,t['title']);
					edTicket.setData({title:t['title'],text:t['text']});
				},this);
				this.questPanel.destroy();
				this.dataTab.doLayout();
				this.setActiveTab(this.dataTab);
			} else {
				//Если вводится новая анкета
				Ext.each(tickets,function(t){
					var order = this.sectionPlan[t.section] ? this.sectionPlan[t.section]['order'] : 0;
					ticket_config = {
						order:order
					};
					Ext.apply(ticket_config,t)
					this.dataTab.addTicket(ticket_config);
				},this);
				this.questPanel.destroy();
				this.dataTab.doLayout();
				this.setActiveTab(this.dataTab);
			};
			this.dataTab.quests[questName] = {
				data: allData,
				code:code
			}
			this.updateRecord();
			// Теперь анкету можно удалить, если надо
			this.enableQuestBtns(false);

		}
	},

	onRemoveQuest: function(){
		/*
		 * Сохраняет данные из анкеты.
		 * Сначала проходит проверка, вводилась ли такая анкета (есть соответствующий параметр в dataTab.quests)
		 * Если анкета вводилась, то выбираются все тикеты с именем этой анкеты и заменяются данные
		 * Если анкета не вводилась, то добавляются новые тикеты в соответствующие секциям позиции.
		*/
		if (this.questPanel){
			var questName = this.questPanel.questName;
			do {
				var t = this.dataTab.findTicket('questName',questName);
				if (t){
					t.destroy();
				}
			} while (t);
			delete this.dataTab.quests[questName];
			this.questPanel.destroy();
			this.dataTab.doLayout();
			this.setActiveTab(this.dataTab);
			this.updateRecord()
		};

		this.enableQuestBtns(true);
	},

	onEditQuest: function(){
		if (this.dataTab.quests){
			for (pr in this.dataTab.quests) {var name = String(pr)};
			this.openQuest({questName:name})
		}
	},

	enableQuestBtns: function(status){
		this.questBtn.setDisabled(!status);
		this.removeQuestBtn.setDisabled(status);
		this.editQuestBtn.setDisabled(status);
	}

});

Ext.reg('templatebody',App.examination.TemplateBody);
