Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.DataPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	layout:'fit',
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','drop','ticketheadeeditrstart'],
	closable: true
});

App.examination.DataTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			region:'center',
			autoScroll:true,
			bufferResize: 50, 
			anchor:'100%'
		});
		
		this.glossPanel = new App.dict.XGlossaryTree({
			section:this.section,
			base_service:this.base_service,
			staff:this.staff,
			collapsible:true,
			animate: false,
			collapsed:true,
			region:'east',
			floating:false
		});
		
		
		this.dataPanel = new App.examination.DataPanel({
			region:'center',
			autoScroll:true,
			border:false,
			items:[this.portalColumn],
			getData: function(){
				var data = [];
				this.items.each(function(item){
					if(item.getData){
						data.push(item.getData());
					}
				},this);
				return data
			}
		});
		
		var config = {
			layout:'border',
		    labelAlign: 'top',
		    autoSctoll:false,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop','ticketheadeeditrstart'],
		    items: [
		    	this.portalColumn,this.glossPanel
		    ]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.DataTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(panel){
			
		},this);
		
	},
	
	onTicketEndEdit: function(){
		if(!this.glossPanel.collapsed){
			this.glossPanel.collapse();
		}
	},
	
	loadData: function(data){
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
	
	//Добавление раздела
	addSection: function(section,title,order,data){
		
		this.onSectionChange(section);
		
		var new_tab = new App.examination.SectionPanel({
//			title:title,
			section:section,
//			width:500,
			height:150,
//			closable:false,
			base_service:this.base_service,
			staff:this.staff,
			data:data,
			border:true,
			bodyStyle:'padding:5px',
			baseCls:'x-border-layout-ct',
			bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart'],
			order:order,
			record:this.record,
			listeners:{
				'close': function(p){
					this.sectionMenu.insert(p.order,this.menuBtns[p.section]);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					};
//					this.updateRecord();
//					this.removeTab(p.section);
				},
				'closetab':function(p){
					Ext.Msg.confirm('Удаление','Удалить раздел?',function(button){
						if(button=='yes'){
							this.sectionMenu.insert(p.order,this.menuBtns[p.section]);
							this.addSecBtn.enable();
							if (this.items.length == 1) {
								this.addSubSecBtn.disable();
							};
							p.removeTab();
							this.remove(p)
						}
					},this)
					
				},
				'ticketdataupdate': function(){
//					this.updateRecord();
				},
				'drop': function(){
//					this.updateRecord();
				},
				'afterrender':function(panel){
					panel.body.on('click',function(e,t,o){
						if(panel.section !== this.curSection){
							this.onSectionChange(panel.section)
						}
					},this);
				},
				scope:this
			}
		});
		new_tab.addTicket('text');
		this.portalColumn.insert(0,new_tab);
		console.log(new_tab)
//		if(this.dataPanel.items.items.length){
//			console.log(this.dataPanel.items.items.length)
//			Ext.each(this.dataPanel.items.items,function(item,i){
//				if (this.dataPanel.items.items[i].order > order){
//					this.dataPanel.insert(i,new_tab);
//					return
//				}
//				if (i ==this.dataPanel.items.items.length-1){
//					this.dataPanel.insert(i+1,new_tab);
//					return
//				} 
//			},this)
//		} else {
//			this.dataPanel.insert(0,new_tab);
//		}
		
		this.doLayout();
		
	},
	
	//добавление тикета
	addTicket:function(title,section){
		this.portalColumn.items.items[0].addTicket(title);
		this.doLayout();
	},
	
	getData: function(){
		var data = this.dataPanel.getData();
		return data
	},
	
	
	
	lastIndexOfAny:function(str,arr){
		var genInd = -1;
		Ext.each(arr,function(chr){
			var ind = str.lastIndexOf(chr);
			if (ind > genInd) genInd = ind;
		});
		return genInd;
	},
	
	indexOfAny:function(str,arr){
		var genInd = -1;
		Ext.each(arr,function(chr){
			var ind = str.indexOf(chr);
			if (ind < genInd || (genInd == -1 && ind > -1)) genInd = ind;
		});
		return genInd;
	},
	
	closeEditor: function(){
		if(this.ctxEditor){
			this.ctxEditor.completeEdit();
		}
	},
	
	addTicketPanel: function(section){
		
	},
	
	onSectionChange: function(section){
		this.curSection = section;
		this.fireEvent('sectionchange',section)
	}
	
	
	
});
