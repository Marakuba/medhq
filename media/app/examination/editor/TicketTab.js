Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','drop'],
	closable: true
});

App.examination.TicketTab = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.portalColumn = new Ext.ux.PortalColumn({
			columnWidth:1,
			anchor:'100%'
		});
		
		this.buffer = '';
		
		this.ctxEditor = undefined;
		
		this.clearFilterList = [Ext.EventObject.ESC, Ext.EventObject.RIGHT, Ext.EventObject.LEFT, 
								Ext.EventObject.UP, Ext.EventObject.DOWN]
		
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
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			baseCls:'ticket',
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
					this.adjW = adjW;
					if (this.ctxEditor){
						this.ctxEditor.field.setWidth(adjW-60);
					}
				},
				'afterrender':function(panel){
					panel.body.on('blur',function(e,t,o){
						
						if (this.ctxEditor){
							this.ctxEditor.completeEdit();
							this.onTicketEndEdit();
						}
					},this);
				},
				scope:this
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
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop'],
		    items: [
		       this.ticketPanel, this.glossPanel
		    ]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TicketTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(panel){
			
			if(this.data){
				Ext.each(this.data.tickets,function(ticket,i){
					var new_ticket = new Ext.ux.form.Ticket({
						data:{
							title:ticket.title,
							printable:ticket.printable,
							private:ticket.private,
							text:ticket.text
						},
						listeners:{
							search: function(e,text){
								filter = this.glossPanel.filter;
								var symbol = String.fromCharCode(e.getCharCode())
								var key = e.getKey();
								if(this.clearFilterList.indexOf(key) > -1) {
									this.buffer = '';
									filter.clear();
								} else {
									if (key == Ext.EventObject.BACKSPACE){
										if(this.buffer){
											this.buffer = this.buffer.substr(0, this.buffer.length-1)
										}
									} else {
										this.buffer += symbol;
									}
									var re = new RegExp('.*' + this.buffer + '.*', 'i');
									filter.clear();
									filter.filter(re, 'text');
								}
							},
							editorclick: function(){
								this.buffer = '';
								this.glossPanel.filter.clear();
							},
							scope:this
						}
					});
					this.portalColumn.add(new_ticket);
				},this);
				this.doLayout();
			};
			
		},this);
		
		this.on('beforeclose',function(){
			var data = Ext.decode(this.record.data.data);
			Ext.each(data,function(sec,i){
				if (sec.section === this.section){
					delete data[i];
				}
			});
			this.record.set('data',Ext.encode(data));
		},this);
		
		this.on('editorclose',function(){
			this.ctxEditor = undefined;
		},this)
		
		this.glossPanel.on('nodeclick',function(attrs){
			if (this.ticket){
				this.ticket.doNotClose = true;
				var pos = this.ticket.getPos() || 0;
				var oldText;
				if (this.ctxEditor){
					oldText = this.ctxEditor.field.getValue();
				} else {
					oldText = this.ticket.getText();
				};
				var pastedText = attrs.text;
//				console.log('pos = ' + pos);
//				console.log('text[' + pos+'] = ' + oldText[pos]);
//				console.log('length = ' + oldText.length);
				if (oldText[pos] && oldText[pos] != ' '){
					pastedText += ' ';
				} 
				if (pos>0 && oldText[pos-1] && oldText[pos-1] != ' '){
					var newText = oldText.splice(pos, 0, ' '+ pastedText);
				} else {
					var newText = oldText.splice(pos, 0, pastedText);
				}
				this.ticket.setText(newText);
				pos = pos + pastedText.length + 1;
				var el = this.ticket.getEl()
				if (this.ctxEditor){
					this.ctxEditor.field.setValue(newText);
					var textarea = this.ctxEditor.field.getEl().dom;
//					this.ticket.setCaretTo(textarea,pos);
//					this.ctxEditor.field.focus(false,100);
					textarea.setSelectionRange(pos, pos); 
					this.ticket.setCaretTo.defer(300,this.ticket,[textarea,pos]);
				} else {
					this.ticket.setPos(pos);
				};
				this.fireEvent('ticketdataupdate');
			}
		},this);
		
		this.glossPanel.on('afterrender',function(){
			if (this.ctxEditor){
				var textarea = this.ctxEditor.field.getEl().dom;
				var pos = this.ctxEditor.field.getValue().length;
				this.ticket.setCaretTo(textarea,pos);
			}
		});
		
		this.glossPanel.on('beforeclose',function(){
			if (this.ctxEditor){
				this.ctxEditor.field.focus('',10);
			}
		});
		
		this.glossPanel.on('beforeexpand',function(panel){
			console.log(panel);
		});
		
		this.on('ticketeditstart', function(panel,editor,pos){
			this.glossPanel.filter.clear();
			if (this.ctxEditor && this.ctxEditor.panel != panel) {
				this.ctxEditor.completeEdit();
			};
			this.ctxEditor = editor;
			this.ctxEditor.panel = panel;
			if (this.adjW){
				this.ctxEditor.field.setWidth(this.adjW-60);
			};
			
			if (this.glossPanel.collapsed){
				this.glossPanel.toggleCollapse();
			}
			this.ticket = panel;
		},this);

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
//			this.ctxEditor = undefined;
//			this.ticket = undefined;
		},this);
	},
	
	onTicketEndEdit: function(){
		if(!this.glossPanel.collapsed){
			this.glossPanel.collapse();
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
