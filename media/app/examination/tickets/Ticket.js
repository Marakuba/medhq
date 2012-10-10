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
		
		this.type = 'textticket';
		
		this.curPos = 0;
		this.defaultText = 'Щелкните здесь чтобы ввести описание...';
		this.defaultTitle = 'Щелкните здесь чтобы установить заголовок...';
		
		this.addEvents('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','ticketheadeeditstart','ticketbodyclick','oneditticket');
		this.enableBubble('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','ticketheadeeditstart','ticketbodyclick','oneditticket');
		
		this.pntMenuItem = new Ext.menu.CheckItem({
			text:'Выводить на печать',
			checked:this.initialConfig.printable || true ,
			listeners:{
				checkchange:function(ci,checked){
					this.setPrintable(checked);
				},
				scope:this
			}
		});
		
		this.prvtMenuItem = new Ext.menu.CheckItem({
			text:'Приватный блок',
			checked:this.initialConfig.private,
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
			title:this.initialConfig.title ? this.initialConfig.title : this.defaultTitle,
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
					panel.setData();
					this.headerConfig(panel);
					this.bodyConfig(panel);
				}
			},
			scope : this
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.Ticket.superclass.initComponent.apply(this, arguments);
		
	},
	
	headerConfig: function(panel){
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
        
		var headerEditor = new Ext.Editor(Ext.apply({
            alignment: 'tl-tl',
            emptyText:'Щелкните здесь чтобы установить заголовок...',
            listeners: {
            	show:function(edt){
            		if(edt.field.getValue()==edt.emptyText){
            			edt.field.setValue('');
            		}
            		panel.fireEvent('ticketheadeeditstart',panel);
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
                cls:'header-editor',
                style:{
                	height:'1.5em'
                },
                listeners:{
                	'render': function(c) {
                		var el = c.getEl();
                		el.on('blur', function(t,e) {
                			headerEditor.completeEdit();
                		},this)
                		
            		}
                },
                scope:this
            }
        }, cfg));
        panel.header.on('click', function(e, t){
        	headerEditor.startEdit(t);
        }, null, { delegate:'span.x-plain-header-text'} );
	},
	
	bodyConfig: function(panel){
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
            		if(edt.field.getValue()==edt.emptyText){
            			edt.field.setValue('');
            		} else {
            			edt.field.setValue(panel.data.value);
            		};
            		var pos = this.getPos();
            		if (!pos){
            			if(panel.data.value){
            				pos = panel.data.value.length;
            			} else {
            				pos = 0;
            			}
//	                    			this.setPos(pos);
            		}
            		panel.fireEvent('ticketeditstart',this,edt,pos);
            		this.setCaretTo(el.dom,pos);
            	},
                beforecomplete: function(ed, value){
                	panel.data.value = value;
                	if(value==''){
                		ed.setValue(ed.emptyText);
                		panel.body.addClass('empty-body');
                	} else {
                		ed.setValue(value);
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
				     	el.on('keypress', function(e,t) {
				        	this.getCaretPos(el.dom);
				        	this.fireEvent('search',e,t.value);
				     	}, this);
				     	el.on('click',function(e,t,o){
                    		var pos = this.getCaretPos(el.dom);
                    		this.fireEvent('editorclick',e,t,o)
				     	}, this);
				     	el.on('blur', function(t,e) {
				        	this.getCaretPos(el.dom);
				        	if (this.doNotClose){
				        		this.doNotClose = undefined;
				        	} else {
				        		sectionEditor.completeEdit();
				        		panel.fireEvent('editorclose');
				        	};
				        	sectionEditor.fireEvent('complete');
				     	}, this);
				     	el.on('focus', function(t,e) {
//							        	var pos = this.getPos();
//										el.dom.setSelectionRange(pos, pos);
				     	}, this);
				    },
                	scope:this
                },
                scope:this
            }
        }, cfg));
        panel.body.on('dblclick', function(e, t){
//	                	sectionEditor.startEdit(panel.body);
        	panel.fireEvent('ticketbodyclick',panel);
        }, null, {
//	                	delegate:'div.content'
        });
        panel.body.on('blur', function(e, t){
//	                	sectionEditor.completeEdit();
        }, null);
	},
	
	setData : function() {
		this.updateData();
	},
	
	getData : function() {
		return this.data;
	},
	
	updateData : function() {
		var d = this.data || {'printable':true, 'private':false};
		if (d.title) {
			this.setTitle(d.title);
		} else {
			this.setTitle('Щелкните здесь чтобы установить заголовок...');
			this.header.addClass('empty-header');
			d['title'] = ''
		};
		if (d.value) {
			this.body.removeClass('empty-body');
			this.body.update(d.value);
		} else {
			d['value'] = '' 
		}; 
		if(!d.printable) {
			this.addClass('not-printable');
		}
		if(d.private) {
			this.addClass('private');
			this.pntMenuItem.setDisabled(true);
		}
		this.data = d;
		this.doLayout();
		this.afterLoad();
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
    
    getText: function(){
    	return this.data.value;
    },
    
    setText: function(text){
    	this.data.value = text;
    	this.updateData();
    },
    
    //пользовательская функция 
    afterLoad: function(){
    },
    
    onEdit: function(panel){
		var editorXType = panel.type + 'editor';
		panel.fireEvent('oneditticket', panel)
	},
	
    //пользовательская функция, выполняется после завершения редактирования тикета
    afterEdit:function(data){
    }
	
	
});

Ext.reg('ticket', Ext.ux.form.Ticket);
