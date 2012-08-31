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
//					console.log(ind)
					if(item.getData){
						var itemData = item.getData();
						itemData['pos'] = ind
					}
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
				'beforedrop':function(res){
					return false
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
//		    App.eventManager.un('tmptabchange',this.closeEditor,this); 
//		},this);
		
		this.on('afterrender',function(panel){
			
			if(this.data){
				Ext.each(this.data.tickets,function(ticket,i){
					var new_ticket = new Ext.ux.form.Ticket({
						data:{
							title:ticket.title,
							printable:ticket.printable,
							private:ticket.private,
							text:ticket.text
						}
					});
					this.portalColumn.add(new_ticket);
				},this);
				
			};
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
	
	loadData: function(data,sectionPlan){
		this.sectionPlan = sectionPlan;
		if(!data) return false;
		
		Ext.each(data,function(section){
			Ext.each(section.tickets,function(ticket,i){
				var new_ticket = new Ext.ux.form.Ticket({
					data:{
						title:ticket.title,
						printable:ticket.printable,
						private:ticket.private,
						text:ticket.text
					},
					pos:ticket.pos,
					section:section.section,
					order:this.sectionPlan[section.section] && this.sectionPlan[section.section].order || 0
				});
				//вставляем тикет на свое место согласно позиции pos
				if(new_ticket.pos){
					this.insertTicketInPos(new_ticket,'pos')
				} else {
					this.insertTicketInPos(new_ticket,'order')
				}
				
			},this);
			this.doLayout();
		},this);
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
	
	addTicket:function(title,section,order){
		var new_ticket = new Ext.ux.form.Ticket({
			section:section,
			order:order,
			data:{
				title:title,
				printable:true,
				private:false
			}
		});
		this.insertTicketInPos(new_ticket,'order');
		this.doLayout();
	},
	
	insertTicketInPos: function(ticket,paramName){
		//вставляем тикет в нужное место согласно порядку order
		//порядок тикетов может быть определен либо по значению order (если добавляется новый тикет)
		//либо по значению pos (если загружаются сохраненные тикеты)
		
		//если тикетов еще нет, то добавляем в конец
		if (!(this.portalColumn.items && this.portalColumn.items.length)){
			this.portalColumn.add(ticket);
		} else {
			var portalLength = this.portalColumn.items.length;
			var inserted = false;
			Ext.each(this.portalColumn.items,function(obj,ind,portal){
				if (inserted) return
				var item = portal.items[ind];
				if(ind==portalLength-1){
					if (item[paramName] > ticket[paramName]){
						this.portalColumn.insert(ind,ticket);
					} else {
						this.portalColumn.add(ticket);
					}
					inserted = true;
				} else {
					if (item[paramName] >= ticket[paramName]){
						this.portalColumn.insert(ind,ticket);
						inserted = true;
					}
				}
			},this);
		};
		this.doLayout();
	},
	
	getData: function(){
		var data = this.ticketPanel.getData();
		return data
	},
	
	newAsgmtPanel: function(){
		var asgmt_panel = new App.patient.AsgmtGrid({
			title:'Услуги',
			card_id:this.record.data.id,
			order:10000,
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
		
	}
});
