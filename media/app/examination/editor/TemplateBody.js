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
	},
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
		
		Ext.Ajax.request({
			url:App.getApiUrl('examfieldset'),
			success:function(response, opts){
				var obj = Ext.decode(response.responseText);
				Ext.each(obj.objects,function(rec){
					this.menuBtns[rec.name] = {
						text:rec.title,
						id:rec.name,
						order:rec.order,
						handler:this.onAddSection.createDelegate(this,[rec.name,rec.title,rec.order]),
						scope:this
					};
					this.sectionMenu.insert(rec.order,this.menuBtns[rec.name])
					this.subSecBtns[rec.name] = []
				},this);
			},
			failure:function(response, opts){
				this.addSecBtn.disable();
			},
			scope:this
		});
		
		this.emptySubSec = {
			text:'Произвольный',
			handler:this.onAddSubSection.createDelegate(this,['Заголовок']),
			scope:this
		};
		
		Ext.Ajax.request({
			url:App.getApiUrl('examsubsection'),
			success:function(response, opts){
				var obj = Ext.decode(response.responseText);
				Ext.each(obj.objects,function(rec){
					var item = {
						text:rec.title,
						handler:this.onAddSubSection.createDelegate(this,[rec.title]),
						scope:this
					};
					this.subSecBtns[rec.section_name].push(item);
				},this);
				
				for (rec in this.subSecBtns) {
					this.subSecBtns[rec].push(this.emptySubSec);
				}
			},
			scope:this
		});
		
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
		
		this.ttb = [this.addSecBtn, this.addSubSecBtn,{
			text:'get Data',
			handler:function(){
				var tab = this.getActiveTab();
				Ext.MessageBox.alert('get Data','look in Firebug');
				console.info(tab.getData());
			},
			scope:this
		}]
			
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		},
		this.on('tabchange',function(panel,tab){
			if (tab){
				this.fillSubSecMenu(tab.btn);
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
		},this);

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
			console.dir(data);
		},this);

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
	},
	
	onAddSection: function(btn,title,order){
		var new_tab = this.insert(order,new App.examination.TicketTab({
			title:title,
			btn:btn,
			order:order,
			listeners:{
				'close': function(p){
					this.sectionMenu.insert(p.order,this.menuBtns[p.btn]);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					}
				},
				scope:this
			}
		}));
		new_tab.add({
			xtype:'portalcolumn',
			columnWidth:1,
			anchor:'100%'
		})
		this.sectionMenu.remove(btn);
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.addSubSecBtn.enable();
		this.setActiveTab(new_tab);
//		this.fillSubSecMenu(btn);
		this.doLayout();
	},
	
	fillSubSecMenu : function(section) {
		this.subSectionMenu.removeAll(true);
		Ext.each(this.subSecBtns[section],function(btn){
			this.subSectionMenu.add(btn);
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
	}

});

Ext.reg('templatebody',App.examination.TemplateBody);