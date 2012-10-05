Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','drop','beforedrop','ticketheadeeditrstart','ticketbodyclick'],
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
	initComponent : function() {
		
		//Для создания направлений нужен id текущего пациента
		
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			anchor:'100%'
		});
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			baseCls:'ticket',
			items:[this.portalColumn],
			getData: function(){
				var tickets = [];
				this.items.itemAt(0).items.each(function(item,ind){
					if(item.getData){
						var itemData = item.getData();
						itemData['pos'] = ind;
					};
				},this);
				tickets.push(itemData)
			},
			
			listeners:{
				'beforedrop':function(res,e,t){
					var panel = res.panel;
					panel['dragged'] = true;
//					return false
				},
				scope:this
			}
		});
		
		var config = {
			
			layout:'border',
		    labelAlign: 'top',
		    autoSctoll:true,
		    closable:false,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop','ticketheadeeditrstart','ticketbodyclick'],
		    items: [
		       this.ticketPanel
		    ]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TicketTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(panel){
			if (this.data){
				this.loadData(this.data)
			}
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
		},this);
	},
	
	loadData: function(data,quests,sectionPlan){
		//есть глобальная переменная section_scheme, содержащая все секции
		//Проходим по всем тикетам и вставляем их в панель в нужном порядке
		
		if(!data) return false;
		
		Ext.each(data.tickets,function(ticket){
			//Каждому тикету присваиваем order из section_schema, чтобы видеть, куда вставлять новые тикеты
			ticket['order'] = section_schema[ticket.section]['order']
			this.addTicket(ticket)
		},this);
	},
	
	addTicket:function(ticketConfig){
		//вставляем тикет в нужное место согласно порядку order
		//порядок тикетов может быть определен либо по значению order (если добавляется новый тикет)
		//либо по значению pos (если загружаются сохраненные тикеты)
		
		//если тикетов еще нет, то добавляем в конец
		//тикет добавляется в конец секции
		var insertMethod = config['pos'] ? 'pos' : 'order';
		var ind = this.getLowInd(insertMethod,ticketConfig[insertMethod]);
		this.portalColumn.insert(ind+1,ticketConfig);
		this.doLayout();
	},
	
	getLowInd:function(paramName,value){
		//Возвращает последний индекс элемента, переданный параметр которого меньше указанного
		var index = -1;
		if (!this.portalColumn.items){
			return index;
		}
		Ext.each(this.portalColumn.items.items,function(panel,ind){
			if (panel['dragged']) {
				//Если тикет поставили сюда вручную, то его пропускаем
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
			if (item[paramName] === value) {
				ticket = item;
			}
		},this);
		
		return ticket
	},
	
	findByTitle:function(questName,title){
		var ticket = undefined;
		this.ticketPanel.items.itemAt(0).items.each(function(item,ind){
			if ((item['questName'] == questName) && (item.data['title']== title)) {
				ticket = item;
			}
		},this);
		
		return ticket
	}
});
