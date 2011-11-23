Ext.ns('App.examination');

App.examination.TicketTab = Ext.extend(Ext.ux.Portal,{
	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate'],
	closable: true,
	getData: function(){
		var data = [];
		this.items.itemAt(0).items.each(function(item){
			if(item.getData){
				data.push(item.getData());
			}
		},this);
		return data
	}
});

App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.menuBtns = {};
		this.subSecBtns = {}
		
		this.sectionMenu = new Ext.menu.Menu({
			items:[]
		});
		
		this.subSectionMenu = new Ext.menu.Menu({
			items:[]
		});
		
		if (!this.fieldSetStore.data.length) {
			this.addSecBtn.disable();
		};
		
		this.fieldSetStore.each(function(record){
			var rec = record.data; 
			this.menuBtns[rec.name] = {
				text:rec.title,
				id:rec.name,
				order:rec.order,
				handler:this.onAddSection.createDelegate(this,[rec.name,rec.title,rec.order]),
				scope:this
			};
			this.sectionMenu.insert(rec.order,this.menuBtns[rec.name])
			this.subSecBtns[rec.name] = [];
		},this);
		
		this.emptySubSec = {
			text:'Произвольный',
			handler:this.onAddSubSection.createDelegate(this,['Заголовок']),
			scope:this
		};
		
		this.addSecBtn = new Ext.Button({
			text:'Добавить раздел',
			menu:this.sectionMenu,
			scope:this
		});
		
		this.addSubSecBtn = new Ext.Button({
			iconCls:'silk-add',
			text:'Добавить подраздел',
			menu:this.subSectionMenu,
			disabled:true
		});
		
		this.ttb = [this.addSecBtn, this.addSubSecBtn,
			{
				text:'get Data',
				handler:function(){
					var tab = this.getActiveTab();
					console.info(tab.getData());
				},
				scope:this
			},{
				text:'updateRecord()',
				handler:this.updateRecord.createDelegate(this),
				scope:this
			},{
				text:'loadData()',
				handler:this.loadData.createDelegate(this),
				scope:this
			}
		];
		this.generalTab = new App.examination.GeneralTab({
			listeners:{
				printnamechange:function(newValue,oldValue){
					if (this.record){
						this.record.set('print_name',newValue);
					}
				},
				previewtmp: function(){
					App.eventManager.fireEvent('launchapp','panel',{
						title:'Просмотр ' + this.record.data.id,
						closable:true,
						autoLoad:String.format('/widget/examination/template/{0}/',this.record.data.id)
					});
				},
				movearhcivetmp: function(){
					this.record.beginEdit();
					this.record.set('base_service','');
					this.record.set('staff','');
					this.record.endEdit();
					this.fireEvent('movearhcivetmp');
				},
				deletetmp: function(){
					this.record.store.remove(this.record);
					this.fireEvent('deletetmp');
				},
				scope:this
			},
			scope:this
		})
			
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		},
		this.on('tabchange',function(panel,tab){
			if (tab){
				this.fillSubSecMenu(tab.tabName);
			};
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
			this.removeTicket(tab.tabName,ticket.title)
			
		},this);

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
			console.dir(data);
			this.updateRecord();
		},this);

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.subSectionStore.each(function(record){
				var rec = record.data; 
				var item = {
					text:rec.title,
					handler:this.onAddSubSection.createDelegate(this,[rec.title]),
					scope:this
				};
				this.subSecBtns[rec.section_name].push(item);
			},this);
			
			for (rec in this.subSecBtns) {
				this.subSecBtns[rec].push(this.emptySubSec);
			};
			
			if (this.record.data.data) {
				this.loadData(this.record.data.data);
			} else {
				this.generalTab.setPrintName(this.print_name);
			};
			
			this.insert(0,this.generalTab);
			this.setActiveTab(0);
		
		},this)
	},
	
	onAddSection: function(tabName,title,order){
		var new_tab = this.insert(order,new App.examination.TicketTab({
			title:title,
			tabName:tabName,
			order:order,
			listeners:{
				'close': function(p){
					this.sectionMenu.insert(p.order,this.menuBtns[p.tabName]);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					};
					this.removeTab(p.tabName);
				},
				scope:this
			}
		}));
		new_tab.add({
			xtype:'portalcolumn',
			columnWidth:1,
			anchor:'100%'
		})
		this.sectionMenu.remove(tabName);
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.addSubSecBtn.enable();
		this.setActiveTab(new_tab);
//		this.fillSubSecMenu(tabName);
		this.doLayout();
		this.updateRecord();
		return new_tab;
	},
	
	fillSubSecMenu : function(section) {
		this.subSectionMenu.removeAll(true);
		Ext.each(this.subSecBtns[section],function(tabName){
			this.subSectionMenu.add(tabName);
		},this)
	},
	
	onAddSubSection: function(title){
		var cur_tab = this.getActiveTab();
		var new_ticket = new Ext.ux.form.Ticket({
			data:{
				title:title,
				printable:true,
				private:false
			}
		});
		cur_tab.items.itemAt(0).add(new_ticket);
		this.doLayout();
		this.updateRecord();
	},
	
	updateRecord: function(){
		if (this.dataLoading) {
			return false;
		};
		var data = [];
		for (var i =0; i< this.items.length; i++) {
			var tab = this.items.items[i];
			var section = {};
			if (tab.getData){
				section['section'] = tab.tabName;
				section['tickets'] = tab.getData();
				data.push(section);
			};
		};
		data = Ext.encode(data);
		this.record.set('data', data);
	},
	
	loadData: function(){
		var recData = this.record.data.data;
		this.generalTab.setPrintName(this.record.data.print_name);
		if (!recData){
			return false
		}
		this.dataLoading = true;
		var data = Ext.decode(recData);
		Ext.each(data,function(section){
			var sec = this.menuBtns[section.section];
			var tab = this.onAddSection(section.section,sec.text,sec.order);
			Ext.each(section.tickets,function(ticket,i){
				var new_ticket = new Ext.ux.form.Ticket({
					data:{
						title:ticket.title,
						printable:ticket.printable,
						private:ticket.private,
						text:ticket.text
					}
				});
				tab.items.itemAt(0).add(new_ticket);
			},this);
			this.doLayout();
		},this);
//		this.setActiveTab(0);
		this.dataLoading = false;
		
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
	
	removeTab:function(section){
		var data = Ext.decode(this.record.data.data);
		Ext.each(data,function(sec,i){
			if (sec.section === section){
				delete data[i];
			}
		});
		this.record.set('data',Ext.encode(data));
	}

});

Ext.reg('templatebody',App.examination.TemplateBody);