Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.GeneralTab = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		
		this.printNameField = new Ext.form.TextField({
			fieldLabel:'Заголовок для печати',
			width: 300,
			listeners:{
				'change': function(field,newValue,oldValue){
					this.fireEvent('printnamechange',newValue,oldValue)
				},
			scope:this
			}
		});
		
		var cfg = {
            shadow: false,
            completeOnEnter: true,
            cancelOnEsc: true,
            updateEl: true,
            ignoreNoChange: true
        };
        
        this.headerEditor = new Ext.Editor(Ext.apply({
            cls: 'x-large-editor',
            alignment: 'bl-bl?',
            offsets: [0, 3],
            listeners: {
                complete: function(ed, value, oldValue){
                	this.fireEvent('changetitle',value)
                },
                scope:this
            },
            field: {
                allowBlank: false,
                xtype: 'textfield',
                width: 90,
                selectOnFocus: true
            }
        }, cfg));
		
		this.dltBtn = new Ext.Button({
			text: 'Удалить шаблон',
			handler:function(){
				this.fireEvent('deletetmp')
			},
			scope:this
		});
		this.moveArchiveBtn = new Ext.Button({
			text: 'Переместить в архив',
			handler:function(){
				this.fireEvent('movearhcivetmp')
			},
			scope:this
		});
		
		this.previewBtn = new Ext.Button({
			text: 'Просмотр',
			handler:function(){
				this.fireEvent('previewtmp')
			},
			scope:this
		});
		
		this.equipBtn = new Ext.Button({
			text: 'Оборудование',
			handler:function(){
				this.fireEvent('equiptab');
			},
			scope:this
		});
		
		this.headerElt = new Ext.BoxComponent({
			html:this.print_name? this.print_name:'Нет заголовка',
			listeners:{
				afterrender:function(){
					var el = this.headerElt.el; 
					el.on('dblclick',function(e,t){
						this.headerEditor.startEdit(t);
					},this);
				},
				scope:this
			}
		});
		
		this.titlePanel = new Ext.Panel({
			region:'center',
			layout:'hbox',
			items:[{
				xtype:'label',
				text:'Заголовок:',
				margins:'0 10 0 0 '
			},this.headerElt]
		});
		
		this.centralPanel = new Ext.Panel({
			layout:'border',
			region: 'center',
			padding : 10,
			border:false,
			items:[this.titlePanel]
		});
		
		this.menuPanel = new Ext.Panel({
			region: 'east',
			baseCls: 'x-plain',
			margins: '5 5 5 5',
			border: false,
//			frame:true,
			height:500,
			width:200,
	 		layout: {
	            type:'vbox',
	            padding:'10',
	            align:'stretch'
	        },
	        defaults:{margins:'5 5 5 0'},
	        scale: 'large',
			items:[this.previewBtn,
				this.moveArchiveBtn,
				this.dltBtn,
				this.equipBtn
			]
		});
		
    	
		var config = {
			title: 'Общая',
			layout: 'border',
//			labelWidth: 70,
			border:false,
     		items: [
				this.centralPanel,
				this.menuPanel
     		]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.GeneralTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			
		});
	},
	
	setPrintName: function (text){
		this.printNameField.setValue(text);
	}
	
});
