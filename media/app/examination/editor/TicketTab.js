Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','drop','ticketheadeeditrstart'],
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
								Ext.EventObject.TAB, 
								Ext.EventObject.DELETE, 44, 59, 63]
		
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
		
		this.glossStore = new Ext.data.Store({
            restful: true,    
            autoLoad: true, 
			autoDestroy:true,
            baseParams:{
        		format:'json',
        		section:this.section,
				staff:App.uriToId(this.staff)
        	},
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
            proxy: new Ext.data.HttpProxy({
	        	url: get_api_url('glossary')
	        }),
            reader: new Ext.data.JsonReader({
	            totalProperty: 'meta.total_count',
	            successProperty: 'success',
	            idProperty: 'id',
	            root: 'objects',
	            messageProperty: 'message'
	        }, [
	            {name: 'id'},
				{name: 'text'},
				{name: 'staff'},
				{name: 'section'}
	        ])
        });
		
		this.glossDropDown = new Ext.ux.DropDownList({
			tpl: '<tpl for="."><div class="x-combo-list-item">{text}</div></tpl>',
			store: this.glossStore,
			valueField: 'text',
			bubbleEvents:['itemselected', 'processquery', 'listclosed', 'listuserclosed'],
			width:200,
			clearFilterList: this.clearFilterList,
			listeners: {
				processquery: function(list, options, e) {
					
					/*var txt = Ext.getCmp(list.currentEl.id);
					var parsedAddresses = this.parseMailAddressesOnCurrentPosition(txt);

					options.query = parsedAddresses.currentAddress.trim();*/
				},

				itemselected: function(list, record, index) {
					var txt = Ext.getCmp(list.currentEl.id);
					var val = txt.getValue();
					var curPos = this.ticket.getPos();
//					console.log('buffer',this.glossDropDown.getBuffer());
					var beforePasted = val.substring(0,curPos-this.glossDropDown.getBuffer().length);
					var afterPasted = val.substr(curPos);
					var pastedText = record.data.text;
//					var parsedAddresses = this.parseMailAddressesOnCurrentPosition(txt);
					var newPos = curPos - this.glossDropDown.buffer.length + pastedText.length;

					if (!Ext.isEmpty(beforePasted) && !(beforePasted[beforePasted.length-1]==' ')) {
						beforePasted += ' ';
						newPos += 1;
					};
					if (!Ext.isEmpty(afterPasted)){
						if (!afterPasted[0]==' ') pastedText += ' ';
						newPos += 1;
					};
					var newText = beforePasted + pastedText + afterPasted;
					txt.setValue(newText);
					var textarea = this.ctxEditor.field.getEl().dom;
					this.ticket.setCaretTo.defer(200,this.ticket,[textarea,newPos]);
					this.glossDropDown.clearBuffer();
//					console.log('beforePasted', beforePasted);
//					console.log('pastedText', pastedText);
//					console.log('afterPasted', afterPasted);
//					console.log('newPos', newPos);
//					this.ticket.setCaretTo(list.currentEl,parsedAddresses.beforeAddresses.length+parsedAddresses.currentAddresses.length+1);

//					txt.setCursorPosition(newText.length);
				},
				
				scope:this
			}
		});
		
		this.ticketPanel = new App.examination.TicketPanel({
			region:'center',
			baseCls:'ticket',
			items:[this.portalColumn],
			getData: function(){
				//TODO:
				//сохранить данные с учетом имени секции, порядка секции и позиции на листе
				//учесть, что старые данные могут не иметь информацию о позиции на листе
				//запретить возможность перетаскивать тикеты в другие разделы
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
				//по старой структуре data содержит массив списков секций. так было потому, что были разные вкладки на каждую секцию
				var dataArray = []
				for (sec in data){
					dataArray.push(data[sec])
				}
				console.log(dataArray)
				return dataArray
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
			
			layout:'border',
		    labelAlign: 'top',
		    autoSctoll:true,
		    closable:true,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop','ticketheadeeditrstart'],
		    items: [
		       this.ticketPanel, this.glossPanel
		    ]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TicketTab.superclass.initComponent.apply(this, arguments);
		
		App.eventManager.on('tmptabchange',this.closeEditor,this);
		
		this.on('destroy', function(){
		    App.eventManager.un('tmptabchange',this.closeEditor,this); 
		},this);
		
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
								this.glossDropDown.currentElKeyUp(e,text);
								/*filter = this.glossPanel.filter;
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
								}*/
							},
							editorclick: function(){
								this.buffer = '';
//								this.glossPanel.filter.clear();
								this.glossDropDown.clearBuffer();
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
			this.fireEvent('closetab',this)
			return false
//			this.removeTab();
		},this);
		
		this.on('editorclose',function(){
			this.ctxEditor = undefined;
		},this);
		
		this.glossPanel.on('nodeclick',function(attrs){
			if (this.ticket){
				this.ticket.doNotClose = true;
				var pos = this.ticket.getPos() || -1;
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
		});
		
		this.on('ticketeditstart', function(panel,editor,pos){
			this.curPos = pos;
			this.glossPanel.filter.clear();
			this.glossDropDown.clearBuffer();
			if (this.ctxEditor && this.ctxEditor.panel != panel) {
				this.ctxEditor.completeEdit();
			};
			this.ctxEditor = editor;
			this.ctxEditor.panel = panel;
			if (this.adjW){
				this.ctxEditor.field.setWidth(this.adjW-60);
			};
			
			this.glossDropDown.bindElement(this.ctxEditor.field.el, this.glossDropDown);
			
			if (this.glossPanel.collapsed){
				this.glossPanel.toggleCollapse();
			};
			if (this.ticket) {
				this.ticket.body.removeClass('selected');
			};
			this.ticket = panel;
		},this);
		
		this.on('ticketheadeeditstart',function(panel){
			if (this.ticket){
				this.ticket.body.removeClass('selected')
			};
			
			this.ticket = panel;
			this.ticket.body.addClass('selected')
		},this)

		this.on('ticketdataupdate', function(ticket, data){
			// в тикете обновились данные 
//			this.ctxEditor = undefined;
//			this.ticket = undefined;
//			this.ticket = ticket;
			if(this.ticket){
				this.ticket.body.addClass('selected');
			};
			this.glossDropDown.unbindCurrentElement();
			this.glossDropDown.clearBuffer();
		},this);
	},
	
	onTicketEndEdit: function(){
		if(!this.glossPanel.collapsed){
			this.glossPanel.collapse();
		}
	},
	
	loadData: function(data,sectionPlan){
		console.log(data);
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
					order:this.sectionPlan[section.section].order,
					listeners:{
						search: function(e,text){
							this.glossDropDown.currentElKeyUp(e,text);
							/*filter = this.glossPanel.filter;
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
							}*/
						},
						editorclick: function(){
							this.buffer = '';
//								this.glossPanel.filter.clear();
							this.glossDropDown.clearBuffer();
						},
						scope:this
					}
				});
				//вставляем тикет на свое место согласно позиции pos
				this.insertTicketInPos(new_ticket,'pos')
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
			},
			listeners:{
				search: function(e,text){
					this.glossDropDown.currentElKeyUp(e,text);
					/*filter = this.glossPanel.filter;
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
					}*/
				},
				editorclick: function(){
					this.buffer = '';
					this.glossDropDown.clearBuffer();
				},
				scope:this
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
					if (item[paramName] > ticket[paramName]){
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
	
	parseMailAddressesOnCurrentPosition : function(textarea) {
		curPos = this.ticket.getPos() || -1
		var val = textarea.getValue();

		var beforeAddresses = val.substr(0, curPos);
		var afterAddresses = val.substr(curPos);

//		var beforeEnd = -1;
		var beforeEnd = this.lastIndexOfAny(beforeAddresses,[',','.',' ']);
		if (beforeEnd == -1) {
			beforeAddresses = '';
		} else {
			beforeAddresses = val.substring(0, beforeEnd + 1);
		};
		
		console.log('beforeAddresses ', beforeAddresses);

		var afterBegin = this.indexOfAny(afterAddresses,[',','.',' ']);
//		var afterBegin = -1;
		if (afterBegin == -1) {
			afterAddresses = '';
		} else {
			afterAddresses = afterAddresses.substr(afterBegin);
		};
		
//		console.log('afterAddresses ', afterAddresses);
//		console.log('curPos ', curPos);
//		console.log('val ', val);
		beforeEnd = (beforeEnd == -1) ? 0 : beforeEnd;
		afterBegin = (afterBegin == -1) ? undefined : afterBegin;
		var currentAddress = val.substring(beforeEnd, afterBegin ? afterBegin + curPos : undefined);
		
//		console.log('left_ind ', beforeEnd);
//		console.log('right_ind ', afterBegin);
//		
//		console.log('currentAddress ', currentAddress);

		return ({
			beforeAddresses: beforeAddresses.trim(),
			currentAddress: currentAddress,
			afterAddresses: afterAddresses.trim()
		});
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
	}
	
	
	
});
