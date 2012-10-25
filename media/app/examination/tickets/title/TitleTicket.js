Ext.ns('App.examination');

/*
 * data : {
 * 		title : '',
 * 		text : '',
 * 		printable : true|false,
 * 		private : true|false
 * }
 */


App.examination.TitleTicket = Ext.extend(App.examination.Ticket,{
	
	defaultText : 'Щелкните здесь чтобы установить заголовок...',
	
	initComponent: function(){
		
		config = {
			tools:[],
			title:undefined,
			header:false,
			bodyCssClass:'content-title empty-body',
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TitleTicket.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
		
	},
	
	setTools : function(){
		
	},
	
	headerConfig: function(panel){
		
	},
	
	bodyConfig: function(panel){
		this.bodyEditor = this.setEditor(this);
		App.examination.TitleTicket.superclass.bodyConfig.apply(this, arguments);
	},
	
	setEditor : function(panel) {
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
        
		var bodyEditor = new Ext.Editor(Ext.apply({
            alignment: 'c-c',
            emptyText:this.defaultText,
            listeners: {
            	show:function(edt){
            		if(edt.field.getValue()==edt.emptyText){
            			edt.field.setValue('');
            		}
//            		panel.fireEvent('ticketheadeeditstart',panel);
            	},
                beforecomplete: function(ed, value){
//                	panel.data.title = value;
//                	panel.fireEvent('ticketdataupdate', panel, panel.data);
                	if(value==''){
//                		ed.setValue(ed.emptyText);
                		panel.body.addClass('empty-body');
                	} else {
                		panel.body.removeClass('empty-body');
                	}
                    return true;
                },
                complete: function(ed, value, oldValue){
                	panel.editComplete({ value : value}, panel);
                }
            },
            field: {
                allowBlank: true,
                xtype: 'textfield',
                width: 600,
                selectOnFocus: true,
                cls:'header-editor',
                style:{
                	height:'1.5em',
                	textAlign:'center'
                },
                listeners:{
                	'render': function(c) {
                		var el = c.getEl();
                		el.on('blur', function(t,e) {
                			bodyEditor.completeEdit();
                		},this)
                		
            		}
                },
                scope:this
            }
        }, cfg));
		return bodyEditor
	},
	
    onEdit: function(panel, e, t){
		if(panel.fireEvent('ticketbeforeedit', panel)===true){
			this.bodyEditor.startEdit(panel.body);
		}

	},
	
	afterEdit: function(data,panel){
//		panel.data.title = data.title;
		panel.data.value = data.value;
		panel.updateData();
		panel.fireEvent('ticketdataupdate',this,this.data)
	},
	
	updateTitleData : function(){
		
	}
	
});

Ext.reg('titleticket', App.examination.TitleTicket);