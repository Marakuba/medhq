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

App.examination.TicketTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		/*Содержит данные всех введенных анкет.
		Имеет структуру:
		this.quests[questName] = {data:[{
										   title,
										   section,
										   rows:[{
										      name,
										      values:'...'|[]
									       }]
									   },
									   {...}]},
								   
								   code:code}
		*/
		this.quests = {};
		
		this.ticketTypes = {'text':Ext.ux.form.Ticket,
							'questionnaire':Ext.ux.form.QuestTicket}
		
		//Для создания направлений нужна запись текущего пациента
		this.patientStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : get_api_url('patient'),
			model: App.models.Patient
		});
		
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			anchor:'100%'
		});
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			baseCls:'ticket',
			items:[this.portalColumn],
			getData: function(){
				//TODO:
				//запретить возможность перетаскивать тикеты в другие разделы (сейчас drop вообще запрещен)
				var data = {};
				this.items.itemAt(0).items.each(function(item,ind){
					if(item.getData){
						var itemData = item.getData();
						itemData['pos'] = ind;
						itemData['type'] = item.type;
						if (item['questName']){
							itemData['questName'] = item.questName;
						}
					};
					if (!data[item.section]){
						data[item.section] = {
							order:item.order,
							section:item.section,
							tickets:[]
						}
					};
					data[item.section].tickets.push(itemData)
				},this);
				//по старой структуре data содержит массив списков секций. так было потому, 
				//что были разные вкладки на каждую секцию
				var dataArray = []
				for (sec in data){
					dataArray.push(data[sec])
				}
				return dataArray
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
		
//		App.eventManager.on('tmptabchange',this.closeEditor,this);
//		
//		this.on('destroy', function(){
//		    App.eventM
//		
//		if (!(this.portalColumn.items && this.portalColumn.items.length)){
//			this.portalColumn.add(ticket);
//		} else {
//			var portalLength = this.portalColumn.items.length;
//			var inserted = false;
//			Ext.each(this.portalColumn.items,function(obj,ind,portal){
//				if (inserted) return
//				var item = portal.items[ind];
//				if(ind==portalLength-1){
//					if (item[paramName] > ticket[paramName]){
//						this.portalColumn.insert(ind,ticket);
//					} else {
//						this.portalColumn.add(ticket);
//					}
//					inserted = true;
//				} else {
//					if (item[paramName] >= ticket[paramName]){
//						this.portalColumn.insert(ind,ticket);
//						inserted = true;
//					}
//				}
//			},this);
//		};anager.un('tmptabchange',this.closeEditor,this); 
//		},this);
		
		this.on('afterrender',function(panel){
			
//			if(this.data){
//				this.quests = data['quests'];
//				Ext.each(this.data.tickets,function(ticket,i){
//					if (!ticket['type']){
//						ticket['type'] = 'text';
//					};
//					var new_ticket = new this.ticketTypes[ticket['type']]({
//						data:{
//							title:ticket.title,
//							printable:ticket.printable,
//							private:ticket.private,
//							text:ticket.text
//						}
//					});
//					this.portalColumn.add(new_ticket);
//				},this);
//				
//			};
			if (this.isCard){
				this.openAsgmtPanel();
			};
			this.doLayout();
			
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
		this.sectionPlan = sectionPlan;
		if(!data) return false;
		
		this.quests = quests;
		
		Ext.each(data,function(section){
			Ext.each(section.tickets,function(ticket,i){
				var config = {
					type: ticket['type'] || 'text',
					data:{
						title:ticket.title,
						printable:ticket.printable,
						private:ticket.private,
						text:ticket.text
					},
					pos:ticket.pos,
					section:section.section,
					order:this.sectionPlan[section.section] && this.sectionPlan[section.section].order || 0
				};
				//Добавляем оставшиеся настройки
				Ext.applyIf(config,ticket)
				this.addTicket(config);
				
				
			},this);
			this.doLayout();
		},this);
		this.doLayout();
	},
	
	removeTab: function(){
		var data = Ext.decode(this.record.data.data);
		Ext.each(data,function(sec,i){
			if (sec.section == this.section){
				delete data[i];
			}
		},this);
		this.record.set('data',Ext.encode(data));
	},
	
	addTicket:function(config){
		var init_config = {
			data:{title:config['title'],
				text:config['text'],
				printable:true,
				private:false}
		};
		if (!config['type']){
			config['type'] = 'text';
		};
		Ext.applyIf(config,init_config);
		var new_ticket = new this.ticketTypes[config['type']](config);
		var insertMethod = config['pos'] ? 'pos' : 'order';
		this.insertTicketInPos(new_ticket,insertMethod);
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
	
	insertTicketInPos: function(ticket,paramName){
		//вставляем тикет в нужное место согласно порядку order
		//порядок тикетов может быть определен либо по значению order (если добавляется новый тикет)
		//либо по значению pos (если загружаются сохраненные тикеты)
		
		//если тикетов еще нет, то добавляем в конец
		//тикет добавляется в конец секции
		
		var ind = this.getLowInd(paramName,ticket[paramName]);
		this.portalColumn.insert(ind+1,ticket);
		this.doLayout();
	},
	
	getData: function(){
		var data = this.ticketPanel.getData();
		return [data,this.quests]
	},
	
	newAsgmtPanel: function(){
		var asgmt_panel = new App.patient.AsgmtGrid({
			title:'Услуги',
			card_id:this.record.data.id,
			order:10000,
			pos:10000,
			height:500,
			autoScroll:true,
			hasPatient:true,
			autoHeight: true,
			viewConfig:{
				emptyText :'Для данного пациента направлений нет',
				forceFit : false,
				showPreview:true,
				enableRowBody:true,
				getRowClass:function(record, index, p, store){
					if (record.data.deleted){
            			return 'preorder-other-place-row-body'
            		};
            		if (record.data.confirmed){
            			return 'preorder-visited-row-body'
            		}
            		return ''
				}
			},
			listeners: {
				scope:this,
				asgmtcreate: function(){
					this.doLayout()
				}
			}
			
		});
		return asgmt_panel
	},
	
	openAsgmtPanel: function(){
		this.patientStore.setBaseParam('id',this.patient);
		this.patientStore.load({callback:function(records){
			if (!records.length){
				return
			}
			this.patientRecord = records[0]
			this.asgmtPanel = this.newAsgmtPanel();
			this.asgmtPanel.store.setBaseParam('card',this.record.data.id);
			this.asgmtPanel.setActivePatient(this.patientRecord);
			this.insertTicketInPos(this.asgmtPanel,'order');
		},scope:this});
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
