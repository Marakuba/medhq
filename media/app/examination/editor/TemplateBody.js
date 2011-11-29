Ext.ns('App.examination');

App.examination.TicketTab = Ext.extend(Ext.ux.Portal,{
	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart'],
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
		
		this.ctxEditor = undefined;
		
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
		this.previewBtn = new Ext.Button({
			text: 'Просмотр',
			handler:this.onPreview.createDelegate(this,[this.card]),
			scope:this
		});
		
		this.ttb = [this.addSecBtn, this.addSubSecBtn,'-',this.previewBtn];
		
		this.equipTab = new App.examination.EquipmentTab({
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
				
		this.generalTab.on('deletetmp',function(){
			this.record.store.remove(this.record);
			this.fireEvent('deletetmp');
		},this);
				
		this.generalTab.on('changetitle',function(text){
			this.record.set('print_name',text);
			this.fireEvent('changetitle',text);
		},this);
				
		this.generalTab.on('equiptab',function(){
			this.add(this.equipTab);
			this.equipTab.loadRecord(this.record);
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

		this.on('ticketeditstart', function(editor){
			this.ctxEditor = editor;
			var f = this.ctxEditor.field;
			var pos = f.getPosition();
			var win = new Ext.Window({ /// окошко должно быть в контексте компонента
				title:'Glossary',
				x:pos[0],
				y:pos[1]+f.getHeight()+3,
				width:400,
				height:300
			});
			win.show(this.ctxEditor);
		},this);

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
			this.updateRecord();
			this.ctxEditor = undefined;
		},this);

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(form){
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
			if (this.record.data.equipment){
				this.add(this.equipTab);
				this.equipTab.loadRecord(this.record);
			};
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
		},this);
		if (this.subSectionMenu.items.length){
			this.addSubSecBtn.enable();
		} else {
			this.addSubSecBtn.disable();
		}
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
		this.generalTab.setPrintName(this.record.data.print_name || this.print_name);
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
	},
	
	onPreview: function(isCard){
		var essence = isCard?'card':'template';
		App.eventManager.fireEvent('launchapp','panel',{
			title:'Просмотр: ' + this.record.data.print_name,
			closable:true,
			autoLoad:String.format('/widget/examination/{0}/{1}/',essence,this.record.data.id)
		});
	} 

});

Ext.reg('templatebody',App.examination.TemplateBody);