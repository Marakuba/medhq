Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.TicketPanel = Ext.extend(Ext.ux.Portal,{
//	title:'Новый раздел',
	autoScroll:true,
	cls: 'placeholder',
	bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','drop','ticketheadeeditrstart'],
	closable: true
});

App.examination.SectionPanel = Ext.extend(Ext.Panel, {
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
	        	url: App.getApiUrl('examination','glossary')
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

//		this.bb = new Ext.Toolbar({
//			items:[]
//		});

		var config = {

//		    height: 636,
//		    width: 771,
			layout:'border',
//		    padding: 10,
//		    title: 'Оборудование',
		    labelAlign: 'top',
		    autoSctoll:true,
		    closable:true,
		    bubbleEvents:['beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','drop','ticketheadeeditrstart'],
		    items: [
		       this.ticketPanel
		    ],
//		    bbar: [this.deleteBtn]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.SectionPanel.superclass.initComponent.apply(this, arguments);

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

	addTicket:function(title){
		var new_ticket = new Ext.ux.form.Ticket({
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
		this.portalColumn.add(new_ticket);
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
	},

	//вставка текста в текущую позицию текущего тикета
	insertText: function(pastedText){
		if (this.ticket){
			this.ticket.doNotClose = true;
			var pos = this.ticket.getPos() || -1;
			var oldText;
			if (this.ctxEditor){
				oldText = this.ctxEditor.field.getValue();
			} else {
				oldText = this.ticket.getText();
			};
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
				textarea.setSelectionRange(pos, pos);
				this.ticket.setCaretTo.defer(300,this.ticket,[textarea,pos]);
			} else {
				this.ticket.setPos(pos);
			};
			this.fireEvent('ticketdataupdate');
		}
	}



});
