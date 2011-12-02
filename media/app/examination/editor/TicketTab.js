Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart'],
	closable: true
});

App.examination.TicketTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			anchor:'100%'
		});
		
		this.ctxEditor = undefined;
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			items:[this.portalColumn],
			getData: function(){
				var data = [];
				this.items.itemAt(0).items.each(function(item){
					if(item.getData){
						data.push(item.getData());
					}
				},this);
				return data
			},
			
			listeners:{
				'resize':function(p,adjW,adjh,w,h){
				    /* p : panel
				    adjW :The box-adjusted width that was set
				    adjH: The box-adjusted height that was set
				    w: The width that was originally specified
				    h: The height that was originally specified*/
					if (this.ctxEditor){
						this.ctxEditor.field.setWidth(adjW-60);
					}
				},
				scope:this
			}
		});
		
		this.glossPanel = new App.dict.XGlossaryTree({
			section:this.tabName,
			collapsible:true,
			collapsed:true,
			items:[],
			region:'east',
//			hideCollapseTool : true,
//			allowDomMove:false,
			floating:false,
			listeners:{
				'staterestore':function(){
					console.log('2')
				}
			}
		});
		
		var config = {
			
//		    height: 636,
//		    width: 771,
			layout:'border',
		    padding: 10,
//		    title: 'Оборудование',
		    labelAlign: 'top',
		    autoSctoll:true,
		    closable:true,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart'],
		    items: [
		       this.ticketPanel, this.glossPanel
		    ]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TicketTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(panel){
			panel.body.on('click',function(e,t){
				if (!(t.classList[0]==='x-plain-body')){
					if (this.ctxEditor){
						this.ctxEditor.completeEdit();
					};
					this.onTicketEndEdit();
				}
			},this);
			
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
				this.doLayout();
			}
		});
		
		this.on('beforeclose',function(){
			var data = Ext.decode(this.record.data.data);
			Ext.each(data,function(sec,i){
				if (sec.section === this.section){
					delete data[i];
				}
			});
			this.record.set('data',Ext.encode(data));
		});
		
		this.on('ticketeditstart', function(panel,editor,pos){
			if (this.ctxEditor) {
				this.ctxEditor.completeEdit();
			};
			this.ctxEditor = editor;
			
			this.glossPanel.toggleCollapse();
//			this.ticket = panel;
//			var f = this.ctxEditor.field;
//			var position = f.getPosition();
//			if (this.glosWin){
//				this.glosWin.setPosition(position[0],position[1]+f.getHeight()+3);
//				return true
//			};
//			this.glossary = new App.dict.GlossaryTree({
//				listeners:{
//					'nodeclick':function(attrs){
//						var pos = panel.getPos();
//						var old_value = this.ctxEditor.field.getValue();
//						if (pos>0){
//							var new_value = old_value.splice(pos, 0, ' '+attrs.text);
//						} else {
//							var new_value = old_value.splice(pos, 0, attrs.text);
//						}
//						this.ctxEditor.field.setValue(new_value);
//						pos = pos + attrs.text.length + 1;
//						var textarea = this.ctxEditor.field.getEl().dom;
//						panel.setCaretTo(textarea,pos);
//					},
//					scope:this
//				}
//			});
//			this.glosWin = new Ext.Window({ /// окошко должно быть в контексте компонента
//				title:'Glossary',
//				x:position[0],
//				y:position[1]+f.getHeight()+3,
//				width:400,
//				height:300,
//				layout:'fit',
//				items:[this.glossary],
//				listeners:{
//					'afterrender':function(){
//						var textarea = this.ctxEditor.field.getEl().dom;
//						var pos = this.ctxEditor.field.getValue().length;
//						panel.setCaretTo(textarea,pos);
//					},
//					'beforeclose':function(){
//						if (this.ctxEditor){
//							this.ctxEditor.field.focus('',10);
//						}
//					},
//					scope:this
//				}
//			});
//			this.glosWin.show(this.ctxEditor);
		},this);

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
			this.ctxEditor = undefined;
			this.ticket = undefined;
		},this);
	},
	
	onTicketEndEdit: function(){
		if (this.glosWin) {
			this.glosWin.close();
		}
	},
	
	loadData: function(data){
	},
	
	addTicket:function(title){
		var new_ticket = new Ext.ux.form.Ticket({
			data:{
				title:title,
				printable:true,
				private:false
			}
		});
		this.portalColumn.add(new_ticket);
		this.doLayout();
	},
	
	getData: function(){
		var data = this.ticketPanel.getData();
		return data
	}
	
	
	
});
