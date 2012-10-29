Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
//	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove',
	              'ticketremove',
	              'ticketdataupdate',
	              'ticketeditstart',
	              'drop',
	              'beforedrop',
	              'ticketheadeeditrstart',
	              'ticketbodyclick'],
	closable: false
});


/*
 * Получаемые и передаваемые данные имеют структуру
 * data = {
 * |--tickets:[]
 * |----{title,
 * |----value,
 * |----printable,
 * |----private,
 * |----position,
 * |----section,
 * |----xtype
 * |----},
 * |--questionnaire:
 * |----{name,
 * |----code,
 * |----data - содержит данные для загрузки в редактируемой анкеты
 * |----}
 * }
 * 
 * 
 * 
 * data : [] 						- перечисление всех типов имеющихся данных с данными
 * |--{type:'text', 				- Текстовое представление всех данных
 * |--data:[] 						- список текстовых тикетов, разбитых по секциям. Секции Задаются в модели FieldSet
 * |----{section:'anamnesis','diagnosis',etc.
 * |----order:100 					- Порядок, в котором тикеты данной секции будут выводиться на панель
 * |----tickets:[] 					- список тикетов данной секции
 * |------{title:'Заголовок тикета',
 * |------text:'Тело тикета',
 * |------printable:true, 			- выводится ли тикет на печать
 * |------private:false, 			- приватность тикета. Если true, то тикет виден только для создавшего карту осмотра врача
 * |------pos:10 					- непосредственная позиция тикета на панели,
 * |------type:'text','questionnaire',etc - указывает, к какому типу тикетов относится это текстовое представление для определения метода редактирования тикета.
 * |------name:'Анкета анамнеза' 	- имя компонента указанного типа, к которому относится это отображение. Необходимо для обновления текста после редактирования соответствующего типа 
 * |------}
 * |----}
 * |--},
 * |--{type:'questionnaire',
 * |--data : [] 					- данные всех введеных анкет
 * |----{name:'Тестовая анкета'  	- имя анкеты. должно быть уникальным. Совпадает с заголовком анкеты
 * |----code:'...' 					- Код анкеты, который будет преобразован в форму с полями
 * |----data:[] 					- данные введенные в поля анкеты. эти данные вставляются в форму анкеты при редактировании
 * |------{title:'Подзаголовок' 	- заголовок одной из панелей формы анкеты. Вставляется в заголовок тикета в текстовом представлении панели
 * |------section:'anamnesis','diagnosis',etc. - секция, к которой принадлежит данный тикет. может быть несколько одинаковых. По этому имени ищется секция в модели FieldSet и берется оттуда order
 * |------rows:[] 					- массив, содержит список полей с данными внутри панели, принадлежащей одному тикету 
 * |--------name:'anamnesis_1_2_el'	- имя поля панели. уникально внутри анкеты.
 * |--------values:'...' | []		- значение(я) поля. строка либо массив строк
 * |------}
 * |----}
 * |--},
 * 
 * Еще есть тип assignment - Направления. Может упоминаться в типах текстовых тикетов для указания способа редактирования тикета.
 * Данные типа assignment - записи модели sheduler.Preorder, у которых в поле card указана текущая карта осмотра. Данные генерируются каждый раз при открытии или просмотре карты осмотра.
 * order берется из таблицы examination.FieldSet запись с именем assignment или, если такого нет = 1000.
 * 
 * 
*/

App.examination.TicketTab = Ext.extend(Ext.Panel, {
	
	addSubSecText : 'Добавить раздел',
	
	initComponent : function() {
		
		//Для создания направлений нужен id текущего пациента
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			anchor:'100%',
			style:{
				backgroundColor:'white',
				padding:"4px",
				margin:"7px 100px 15px 100px",
				border:'1px solid #15428B',
				boxShadow:"3px 3px 3px #777"
			}
		});
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			baseCls:'ticket',
			items:[this.portalColumn],
			style:{
				backgroundColor:"#CCDBEE",
				padding:"2px"
			},
			getData: function(){
				var tickets = [];
				this.items.itemAt(0).items.each(function(item,ind){
					if(item.getData){
						var itemData = item.getData();
						itemData['pos'] = ind;
						tickets.push(itemData);
					};
				},this);
				return(tickets)
			},
			
			listeners:{
				'beforedrop':function(res,e,t){
					if (res.panel.fixed)
						return false;
					if (res.position == 0 && this.portalColumn.items.items[0].data.fixed)
						return false;
					
					var panel = res.panel;
					panel.data['dragged'] = true;
					return true;
//					return false
				},
				'ticketbeforeedit': function(panel){
					//если открыт редактор тикета, карту осмотра закрывать нельзя
					if (!this.editInProcess){
						this.editInProcess = true;
						return true
					} else {
						Ext.Msg.alert('Внимание!','Один редактор уже открыт!');
						return false
					}
				
				},
				'ticketeditcomplete': function(){
					this.editInProcess = false;
				},
				scope:this
			}
		});
		
		this.ttb = new Ext.Toolbar({
			items: []
		});
		
		var config = {
			layout:'border',
		    labelAlign: 'top',
		    autoScroll:true,
		    closable:false,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop','ticketheadeeditrstart','ticketbodyclick'],
		    items: [ this.ticketPanel ],
		    tbar:this.ttb
		};
		
		this.fillMenu();
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TicketTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(panel){
			this.fillUserBody();
			if (this.data && this.data.tickets.length){
				this.loadData(this.data);
			} else {
				this.loadRequiredTickets();
			};
			
		},this);
		
		this.on('ticketbodyclick', function(panel,editor,pos){
			if (this.ticket) {
				this.ticket.body.removeClass('selected');
			};
			this.ticket = panel;
			this.ticket.body.addClass('selected')
		},this);
		
		this.on('ticketheadeeditstart',function(panel){
			if (this.ticket){
				this.ticket.body.removeClass('selected')
			};
			
			this.ticket = panel;
			this.ticket.body.addClass('selected')
		},this)

		this.on('ticketdataupdate', function(ticket, data){
			if(this.ticket){
				this.ticket.body.addClass('selected');
			};
			this.updateData();
		},this);
		
		this.on('drop', function(ticket, data){
			this.updateData();
		},this);
		
		this.on('beforeticketremove', function(ticket){
			ticket.destroy();
			this.updateData();
			this.doLayout();
			return false
		},this);
	},
	
	fillMenu:function(){
		
		//Добавляем обязательные элементы в toolbar
		
		//Кнопка с подразделами
		this.fillSectionMenu();
		//Кнопка с анкетами
		this.fillQuestsMenu();
		
		this.editQuestBtn = new Ext.Button({
			text:'Редактировать анкету',
			hidden:true,
			handler:this.editQuestClick,
			scope:this
		});
		this.deleteQuestBtn = new Ext.Button({
			text:'Удалить анкету',
			hidden:true,
			handler:this.deleteQuestClick,
			scope:this
		});
		
		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
			text: 'Печать',
			disabled:!(this.cardId || this.tplId),
			handler:this.onPrint.createDelegate(this,[]),
			scope:this
		});
		
		this.ttb.add(this.editQuestBtn);
		this.ttb.add(this.deleteQuestBtn);
		this.ttb.add(this.printBtn);
		//Добавляем пользовательские элементы в toolbar
		this.fillUsersMenu();
		if (this.data){
			if(this.data.questionnaire){
				this.editQuestBtn.show();
				this.deleteQuestBtn.show();
			}
		}
		this.doLayout();
	},
	
	//Пользовательская функция добавления элементов в тулбар. выполняется после добавления обязательных кнопок
	fillUsersMenu: function(){},
	
	//Пользовательская функция для добавления элементов в основную часть панели
	fillUserBody: function(){},
	
	
	loadData: function(data,quests,sectionPlan){
		//есть глобальная переменная section_scheme, содержащая все секции
		//Проходим по всем тикетам и вставляем их в панель в нужном порядке
		this.dataLoading = true;
		
		if(!data) return false;
		
		Ext.each(data.tickets,function(ticket){
			var currentSection = ticket.section || 'other'
			//Каждому тикету присваиваем order из section_scheme, чтобы видеть, куда вставлять новые тикеты
			ticket['order'] = section_scheme[currentSection] && section_scheme[currentSection]['order'] || 10000
			if (!ticket.title){
				ticket['title'] = section_scheme[currentSection]['title']
			};
			this.addTicket(ticket);
		},this);
		this.checkUniqueTickets();
		this.dataLoading = false;
	},
	
	addTicket:function(ticketConfig, isNew){
		//вставляем тикет в нужное место согласно порядку order
		//порядок тикетов может быть определен либо по значению order (если добавляется новый тикет)
		//либо по значению pos (если загружаются сохраненные тикеты)
		
		if (!ticketConfig.data){
			var ticket_data = {}
			Ext.apply(ticket_data,ticketConfig);
			ticketConfig['data'] = ticket_data;
		}
		ticketConfig['orderRecord'] = this.orderRecord;
		ticketConfig['record'] = this.record;
		ticketConfig['cardId'] = this.cardId;
		ticketConfig.data['cardId'] = this.cardId;
		ticketConfig['tplId'] = this.tplId;
		ticketConfig.data['tplId'] = this.tplId;
		ticketConfig.data['patientId'] = this.patientId; // нужно для добавления направлений
		
		//если тикетов еще нет, то добавляем в конец
		//тикет добавляется в конец секции
		this.sectionItems.hide();
		var insertMethod = ticketConfig['pos'] ? 'pos' : 'order';
		var currentSection = ticketConfig['section'] || ticketConfig['data']['section'] || 'other';
		if (!ticketConfig[insertMethod]){
			ticketConfig[insertMethod] = section_scheme[currentSection] && section_scheme[currentSection][insertMethod]||10000;
		}
		var ind = this.getLowInd(insertMethod,ticketConfig[insertMethod]);
		var newTicket = this.portalColumn.insert(ind+1,ticketConfig);
		if(isNew){
			newTicket.onEdit(newTicket);
		}
		this.doLayout();
		//если добавляется новый тикет, а не существующий, т.е. если у него нет своей позиции pos
		//иногда в загружаемых тикетах может не быть pos, для этого во время загрузки данных
		//устанавливается флаг dataLoading
		if (insertMethod == 'order' && !this.dataLoading){
			this.updateData();
		}
	},
	
	getLowInd:function(paramName,value){
		//Возвращает последний индекс элемента, переданный параметр которого меньше указанного
		var index = -1;
		if (!this.portalColumn.items){
			return index;
		}
		Ext.each(this.portalColumn.items.items,function(panel,ind){
			if (panel.data.dragged || panel.data.fixed) {
				//Если тикет поставили сюда вручную или он зафиксирован, то его пропускаем
				index = ind
			} else {
				if (panel[paramName] <= value) {
					index = ind
				} else {
					return
				}
			}
		},this);
		return index;
	},
	
	getData: function(){
		var data = this.ticketPanel.getData();
		return [data,this.quests]
	},
	
	addStandartServices:function(records){
		var today = new Date();
		var s = this.asgmtPanel.store;
		s.autoSave = false;
		Ext.each(records,function(rec){
			var asgmtType = s.recordType;
			var asgmt = new asgmtType({
				service:rec.data.service, 
				service_name:rec.data.service_name,
				price:rec.data.price || null,
				execution_place : rec.data.state,
				expiration: today.add(Date.DAY,30),
				card:this.record.data.resource_uri || '',
				count:rec.data.avarage || 1,
				patient:App.getApiUrl('patient',this.patient)
			});
			s.add(asgmt);
		},this);
		
		this.asgmtPanel.store.save();
		s.autoSave = true;
		this.doLayout();
		
	},
	
	findTicket:function(paramName,value){
		var ticket = undefined;
		this.ticketPanel.items.itemAt(0).items.each(function(item,ind){
			if (item['data'][paramName] === value) {
				ticket = item;
			}
		},this);
		
		return ticket
	},
	
	findByTitle:function(questName,title){
		var ticket = undefined;
		this.ticketPanel.items.itemAt(0).items.each(function(item,ind){
			if ((item.data['questName'] == questName) && (item.data['title']== title)) {
				ticket = item;
			}
		},this);
		
		return ticket
	},
	
	updateData: function(){
		
		this.data['tickets'] = this.ticketPanel.getData();
		this.checkUniqueTickets();
		this.fireEvent('dataupdate',this.data);
		
	},
	
	checkUniqueTickets : function(){
		_.map(this.uniqueTickets, function(xtype){
			Ext.getCmp('unique-ticket-'+xtype).enable();
		});
		
		var uniques = _.filter(this.data['tickets'], function(ticket){
			return ticket.unique===true
		});
		
		_.map(uniques, function(ticket){
			var cmp = Ext.getCmp('unique-ticket-'+ticket.xtype);
			if (cmp)
				cmp.disable();
		});
	},
	
	fillSectionMenu: function(){
		this.uniqueTickets = [];
		this.sectionItems = new Ext.menu.Menu({
				plain:true,
				defaults:{
					xtype:'buttongroup',
					columns:10,
					bodyBorder:false,
					border:false,
					hideBorders:true,
					defaults:{
						xtype:'button',
						scale:'medium',
						style:{
							padding:'1px 3px'
						}
					}
				},
				items:[]
		});
		for (var section in section_scheme) {
			
			var items = [];
			
			if (section_scheme[section].items.length){
				Ext.each(section_scheme[section].items,function(item){
					var ticket_data = {}
					Ext.apply(ticket_data,item);
					ticket_data['data'] = item;
					var subBtn = {
						id:item.unique ? 'unique-ticket-'+item.xtype : section+"-"+item.title,
						text:item.title,
						handler:this.addTicket.createDelegate(this,[ticket_data, true]),
						scope:this
					};
					items.push(subBtn);

					if(item.unique){
						this.uniqueTickets.push(item.xtype);
					}

				},this);
				this.sectionItems.add({
					items:[items]
				})
			};
		};
		
		this.addSubSecBtn = new Ext.Button({
			iconCls:'silk-page-white-add',
			text:this.addSubSecText,
			menu:this.sectionItems
		});
		
		if (this.sectionItems.items.length){
			this.addSubSecBtn.enable();
		} else {
			this.addSubSecBtn.disable();
		};
		
		this.ttb.insert(0,this.addSubSecBtn);
		this.doLayout();
	},
	
	fillQuestsMenu: function(){
		this.questItems = new Ext.menu.Menu({
			items:[]
		});
		
		Ext.each(quests,function(quest){
			var questBtn = {
				text:quest.name,
				handler:this.questBtnClick.createDelegate(this,[quest]),
				scope:this
			};
			this.questItems.add(questBtn)
		},this);
		
		this.questsBtn = new Ext.Button({
			iconCls:'silk-page-white-add',
			text:'Анкеты',
			menu:this.questItems
		});
		if (this.questItems.items.items.length){
			this.ttb.add(this.questsBtn);
			this.doLayout();
		} else {
			console.log('Анкет нет')
		}
	},
	
	questBtnClick: function(quest){
		console.log('Открытие анкеты ',quest.name);
		//потом этот код сохранится в this.data.questionnaire.code, если анкета будет сохранена
		this.questCode = quest.code;
		App.eventManager.fireEvent('launchApp','questionnaireticketeditor',{
			title:'Анкета '+quest.name,
			questName:quest.name,
			code:Ext.decode(quest.code),
			panel:this,
			fn:this.saveQuestData,
			scope:this
		})
	},
	
	//Вызывается после нажатия на кнопку Ок в панели редактирования анкеты
	saveQuestData: function(dataArr,panel){
		var tickets = dataArr[0];
		var allData = dataArr[1];
		var questName = dataArr[2];
		if (panel.data.questionnaire){
			panel.data.questionnaire['data'] = allData;
			Ext.each(tickets,function(t){
				//ищем редактируемый тикет
				var edTicket = panel.findByTitle(t.questName,t['title']);
				if (edTicket){
					edTicket.setData({title:t['title'],value:t['value']});
				} else{
					t['xtype']='textticket';
					var ticketConfig = {
						xtype:'textticket',
						data:t
					};
					panel.addTicket(ticketConfig);
				} 
			},this);
		} else {
			panel.data.questionnaire = {
				name:questName,
				code:panel.questCode,
				data:allData
			};
			panel.dataLoading = true;
			Ext.each(tickets,function(ticket){
				ticket['xtype']='textticket';
				var ticketConfig = {
					xtype:'textticket',
					data:ticket
				};
				panel.addTicket(ticketConfig);
			});
			panel.dataLoading = false;
		};
		panel.doLayout();
		panel.updateData();
		panel.editQuestBtn.show();
		panel.deleteQuestBtn.show();
	},
	
	editQuestClick: function(){
		var quest = this.data.questionnaire;
		App.eventManager.fireEvent('launchApp','questionnaireticketeditor',{
			title:'Анкета '+quest.name,
			questName:quest.name,
			data:quest.data,
			panel:this,
			code:Ext.decode(quest.code),
			fn:this.saveQuestData,
			scope:this
		})
	},
	
	deleteQuestClick: function(){
		var questName = this.data.questionnaire.name;
		do {
			var t = this.findTicket('questName',questName);
			if (t){
				t.destroy();
			}
		} while (t);
		this.doLayout();
		delete this.data.questionnaire;
		this.updateData();
		this.editQuestBtn.hide();
		this.deleteQuestBtn.hide();
	},
	
	loadRequiredTickets: function(){
		var tickets = required_tickets;
		if (!tickets.length){
			return false
		} else {
			for (var i = 0; i < tickets.length; i++){
				var ticket = {};
				Ext.apply(ticket,tickets[i]);
				console.info(ticket);
				this.addTicket(ticket);
			}
		}
	},
	
	printUrlTpl : "/examination/card/{0}/",
	
	onPrint: function(){
		var url = String.format(this.printUrlTpl,this.cardId);
		window.open(url);
	}
});
