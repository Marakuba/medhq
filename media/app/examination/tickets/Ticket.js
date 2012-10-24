Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.Ticket = Ext.extend(Ext.Panel,{
	
	defaultText : 'Щелкните здесь чтобы ввести описание...',
	
	defaultTitle : 'Щелкните здесь чтобы установить заголовок...',

	editor : 'textticketeditor',
	
	baseCls:'x-plain',
	
	cls:'section',
	
	draggable : true,
	
	headerCfg:{
		tag:'div',
		cls:'title'
	},
	
	title : this.defaultTitle, //this.initialConfig.title ? this.initialConfig.title : this.defaultTitle,
			
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
	
	initComponent: function(){
		
		this.type = 'textticket';
		
		this.curPos = 0;
		
		this.addEvents('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','ticketheadeeditstart','ticketbodyclick','ticketeditstart','editcomplete','beforeticketedit');
		this.enableBubble('beforeticketremove','ticketremove','ticketdataupdate','ticketeditstart','editorclose','ticketheadeeditstart','ticketbodyclick','ticketeditstart','editcomplete','beforeticketedit');
		
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
			layout:'anchor',
			html:this.defaultText,
			listeners:{
				afterrender:function(panel){
					panel.setData();
					this.headerConfig(panel);
					this.bodyConfig(panel);
				},
				beforedestroy : function(panel){
				}
			},
			scope : this
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.Ticket.superclass.initComponent.apply(this, arguments);
		
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
		panel.body.on('click', function(e, t){
				panel.onEdit(panel);
        		panel.fireEvent('ticketbodyclick',panel);
        	}, null, {
        });
	},
	
	setData : function(data) {
		Ext.apply(this.data,data)
		this.updateData();
	},
	
	getData : function() {
		return this.data;
	},
	
	updateTitleData : function(d){
		if (d.title) {
			this.setTitle(d.title);
		} else {
			this.setTitle('Щелкните здесь чтобы установить заголовок...');
			this.header.addClass('empty-header');
			d['title'] = ''
		};
	},
	
	updateValueData : function(d) {
		if (d.value) {
			this.body.removeClass('empty-body');
			this.body.update(d.value);
		} else {
			d['value'] = '' 
		}; 
	},
	
	updateOptData : function(d) {
		if(!d.printable) {
			this.addClass('not-printable');
		}
		if(d.private) {
			this.addClass('private');
			this.pntMenuItem.setDisabled(true);
		}
	},
	
	updateData : function() {
		var d = this.data || {'printable':true, 'private':false};
		this.updateTitleData(d);
		this.updateValueData(d);
		this.updateOptData(d);
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
		if(panel.fireEvent('ticketbeforeedit', panel)===true){
			var editorConfig = panel.getEditorConfig(panel);
			App.eventManager.fireEvent('launchapp',panel.editor,editorConfig);
		}

	},
	
	getEditorConfig : function(panel){
		var editorConfig = {
			title:panel.data.title,
			data:panel.data,
			fn: panel.editComplete,
			panel:panel
		}
		return editorConfig
	},
	
	editComplete: function(data,panel){
		//panel - текущий тикет
		//посылается событие для того, чтобы все компоненты вверху знали, что редактирование закончено 
		panel.fireEvent('ticketeditcomplete');
		//Выполняется пользовательская функция обработки отредактированных данных
		panel.afterEdit(data,panel);
	},
	
    //пользовательская функция, выполняется после завершения редактирования тикета
    afterEdit:function(data,panel){
    	//panel - редактируемый тикет
    }
	
	
});

Ext.reg('ticket', App.examination.Ticket);
