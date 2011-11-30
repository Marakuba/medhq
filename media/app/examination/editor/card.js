Ext.ns('Ext.ux.form');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


Ext.ux.form.Ticket = Ext.extend(Ext.Panel,{
	initComponent: function(){
		this.defaultText = 'Щелкните здесь чтобы ввести описание...';
		this.defaultTitle = 'Щелкните здесь чтобы установить заголовок...';
		
		this.addEvents('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart');
		this.enableBubble('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart');
		
		this.pntMenuItem = new Ext.menu.CheckItem({
			text:'Выводить на печать',
			checked:this.data.printable,
			listeners:{
				checkchange:function(ci,checked){
					this.setPrintable(checked);
				},
				scope:this
			}
		});
		
		this.prvtMenuItem = new Ext.menu.CheckItem({
			text:'Приватный блок',
			checked:this.data.private,
			listeners:{
				checkchange:function(ci,checked){
					this.setPrivate(checked);
				},
				scope:this
			}
		});
		
		config = {
			baseCls:'x-plain',
			cls:'section',
			layout:'anchor',
			draggable : true,
			headerCfg:{
				tag:'div',
				cls:'title'
			},
			title:this.defaultTitle,
			tools:[{
				id:'gear',
				handler:function(event, toolEl, panel){
					if (!this.menu) {
						this.menu = new Ext.menu.Menu({
							items:[{
								text:'Удалить',
								handler:function(){
									if( this.fireEvent('beforeticketremove',this)!==false ) {
										this.fireEvent('ticketremove',this);
										panel.destroy();
									}
								},
								scope:this
							},
							this.pntMenuItem,
							this.prvtMenuItem]
						});
					}
					this.menu.show(toolEl);
				},
				scope:this
			}],
			bodyCssClass:'content empty-body',
			html:this.defaultText,
			listeners:{
				afterrender:function(panel){
					panel.setData(this.data || {});

					var cfg = {
						allowBlur:false,
	                    shadow: false,
	                    completeOnEnter: true,
	                    cancelOnEsc: true,
	                    updateEl: true,
	                    ignoreNoChange: true,
	                    style:{
	                    	zIndex:9000
	                    }
	                };
	
	                var sectionEditor = new Ext.Editor(Ext.apply({
	                    alignment: 'tl-tl',
	                    emptyText:'Щелкните здесь чтобы ввести описание...',
	                    listeners: {
	                    	show:function(edt){
	                    		var el = edt.field.getEl();
	                    		var pos = this.getCaretPos(el.dom);
	                    		panel.fireEvent('ticketeditstart',this,edt,pos);
	                    		if(edt.field.getValue()==edt.emptyText){
	                    			edt.field.setValue('');
	                    		} else {
	                    			edt.field.setValue(panel.data.text);
	                    		}
	                    	},
	                        beforecomplete: function(ed, value){
	                        	panel.data.text = value;
	                        	if(value==''){
	                        		ed.setValue(ed.emptyText);
	                        		panel.body.addClass('empty-body');
	                        	} else {
//	                        		ed.setValue(markdown.toHTML(value));
	                        		panel.body.removeClass('empty-body');
	                        	}
	                            return true;
	                        },
	                        complete: function(ed, value, oldValue){
	                        	panel.fireEvent('ticketdataupdate', panel, panel.data);
	                        },
	                        scope:this
	                    },
	                    field: {
	                        allowBlank: true,
	                        xtype: 'textarea',
	                        width: 890,
	                        selectOnFocus: true,
	                        cls:'text-editor',
	                        grow:true,
	                        listeners:{
	                        	'render': function(c) {
							     	var el = c.getEl()
							     	el.on('keyup', function(t,e) {
							        	this.curPos = this.getCaretPos(el.dom);
							     	}, this);
							     	el.on('blur', function(t,e) {
							        	this.curPos = this.getCaretPos(el.dom);
							     	}, this);
							    },
	                        	scope:this
	                        },
	                        scope:this
	                    }
	                }, cfg));
	                panel.body.on('click', function(e, t){
	                	sectionEditor.startEdit(t);
	                }, null);
	                
	                var headerEditor = new Ext.Editor(Ext.apply({
	                    alignment: 'tl-tl',
	                    emptyText:'Щелкните здесь чтобы установить заголовок...',
	                    listeners: {
	                    	show:function(edt){
	                    		if(edt.field.getValue()==edt.emptyText){
	                    			edt.field.setValue('');
	                    		}
	                    	},
	                        beforecomplete: function(ed, value){
	                        	panel.data.title = value;
	                        	panel.fireEvent('ticketdataupdate', panel, panel.data);
	                        	if(value==''){
	                        		ed.setValue(ed.emptyText);
	                        		panel.header.addClass('empty-header');
	                        	} else {
	                        		panel.header.removeClass('empty-header');
	                        	}
	                            return true;
	                        },
	                        complete: function(ed, value, oldValue){
	                        }
	                    },
	                    field: {
	                        allowBlank: true,
	                        xtype: 'textfield',
	                        width: 600,
	                        selectOnFocus: true,
	                        cls:'header-editor'
	                    }
	                }, cfg));
	                panel.header.on('click', function(e, t){
	                	headerEditor.startEdit(t);
	                }, null, { delegate:'span.x-plain-header-text'} );
				}
			},
			scope : this
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.Ticket.superclass.initComponent.apply(this, arguments);
	},
	
	setData : function(data) {
		this.data = data;
		this.updateData();
	},
	
	getData : function() {
		return this.data;
	},
	
	updateData : function() {
		if(this.data) {
			var d = this.data;
			if (d.title) {
				this.setTitle(d.title);
			} else {
				this.header.addClass('empty-header');
			};
			if (d.text) {
				this.body.removeClass('empty-body');
				this.body.update(d.text);
			}; 
			if(!d.printable) {
				this.addClass('not-printable');
			}
			if(d.private) {
				this.addClass('private');
			}
		}		
	},
	
	setPrintable : function(checked) {
		this.data.printable = checked;
		this.fireEvent('ticketdataupdate', this, this.data);
		this[!checked ? 'addClass' : 'removeClass']('not-printable');
	},
	
	setPrivate : function(checked) {
		this.data.private = checked;
		if(checked) {
			this.data.printable = false;
			this['addClass']('not-printable');
			this.pntMenuItem.setChecked(false);
		} 
		this.pntMenuItem.setDisabled(checked);
		this.fireEvent('ticketdataupdate', this, this.data);
		this[checked ? 'addClass' : 'removeClass']('private');
	},
	
	doGetCaretPosition: function (ctrl) {
		var CaretPos = 0;	// IE Support
		if (document.selection) {
			ctrl.focus ();
			var Sel = document.selection.createRange ();
			Sel.moveStart ('character', -ctrl.value.length);
			CaretPos = Sel.text.length;
		}
		// Firefox support
		else if (ctrl.selectionStart || ctrl.selectionStart == '0')
			CaretPos = ctrl.selectionStart;
		return (CaretPos);
	},
	
	setCaretTo: function(obj, pos) {
		this.curPos = pos;
//		pos = pos - 1;
		if(obj.createTextRange) { 
			var range = obj.createTextRange(); 
			range.move("character", pos); 
			range.select(); 
		} else if(obj.selectionStart) { 
			obj.focus(); 
			obj.setSelectionRange(pos, pos); 
		};
	},
    
    getCaretPos: function(el) {
 	    var rng, ii=0;
		if(typeof el.selectionStart=="number") {
			ii=el.selectionStart;
		} else if (document.selection && el.createTextRange){
			rng=document.selection.createRange();
			rng.collapse(true);
			rng.moveStart("character", -el.value.length);
			ii=rng.text.length;
		};
		this.curPos = ii;
		return ii;
    },
    
    getPos: function(){
    	return this.curPos;
    }
});

Ext.reg('ticket', Ext.ux.form.Ticket);
