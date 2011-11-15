Ext.ns('Ext.ux.form');

Ext.ux.form.Ticket = Ext.extend(Ext.Panel,{
	initComponent: function(){
		config = {
			baseCls:'x-plain',
			cls:'section',
			title:'Title',
			layout:'anchor',
			headerCfg:{
				tag:'div',
				cls:'title'
			},
			tools:[{
				id:'gear',
				handler:function(event, toolEl, panel){
					if (!this.menu) {
						this.menu = new Ext.menu.Menu({
							items:[{
								text:'Удалить'
							},{
								xtype:'menucheckitem',
								text:'Выводить на печать',
								handler:function(b,e){
									panel[!b.checked ? 'addClass' : 'removeClass']('printable');
								}
							},{
								xtype:'menucheckitem',
								text:'Приватный блок',
								handler:function(b,e){
									panel[!b.checked ? 'addClass' : 'removeClass']('private');
								}
							}]
						});
					}
					this.menu.show(toolEl);
				}
			}],
			value:'',
			bodyCssClass:'content empty',
			html:'Щелкните здесь чтобы ввести описание...',
			listeners:{
				afterrender:function(panel){
					var cfg = {
	                    shadow: false,
	                    completeOnEnter: true,
	                    cancelOnEsc: true,
	                    updateEl: true,
	                    ignoreNoChange: true
	                };
	
	                var sectionEditor = new Ext.Editor(Ext.apply({
	                    alignment: 'tl-tl',
	                    emptyText:'Щелкните здесь чтобы ввести описание...',
	                    listeners: {
	                    	show:function(edt){
	                    		if(edt.field.getValue()==edt.emptyText){
	                    			edt.field.setValue('');
	                    		} else {
	//                    			edt.field.setValue(edt.field.getValue().replace("<br>","\n"));
	                    		}
	                    	},
	                        beforecomplete: function(ed, value){
	                        	if(value==''){
	                        		ed.setValue(ed.emptyText);
	                        		panel.body.addClass('empty');
	                        	} else {
	//                        		ed.setValue(value.replace(/\n/,"<br>"));
	                        		panel.body.removeClass('empty');
	                        	}
	                            return true;
	                        },
	                        complete: function(ed, value, oldValue){
	                        }
	                    },
	                    field: {
	                        allowBlank: true,
	                        xtype: 'textarea',
	                        width: 890,
	                        selectOnFocus: true,
	                        cls:'text-editor',
	                        grow:true
	                    }
	                }, cfg));
	                panel.body.on('click', function(e, t){
	                	sectionEditor.startEdit(t);
	                }, null);
	                
	                
	
	                var headerEditor = new Ext.Editor(Ext.apply({
	                    alignment: 'tl-tl',
	//                    emptyText:'Щелкните здесь чтобы ввести описание...',
	                    listeners: {
	                    },
	                    field: {
	                        allowBlank: true,
	                        xtype: 'textfield',
	                        width: 600,
	                        selectOnFocus: true,
	                        cls:'header-editor',
	//                        grow:true
	                    }
	                }, cfg));
	                panel.header.on('click', function(e, t){
	                	headerEditor.startEdit(t);
	                }, null);
				}
			}
		};
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.Ticket.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('ticket', Ext.ux.form.Ticket);
