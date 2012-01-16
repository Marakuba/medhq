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
                width: 500,
                cls:'header-editor',
                style:{
                	height:'1.1em'
                },
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
		
		this.equipBtn = new Ext.Button({
			text: 'Оборудование',
			handler:function(){
				this.fireEvent('equiptab');
			},
			scope:this
		});
		
		this.headerElt = new Ext.BoxComponent({
			html:this.print_name? this.print_name:'Нет заголовка',
			cls:'tpl-print-name',
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
			layout:'anchor',
			border:true,
			margins:'5 5 5 5',
			padding:10,
			items:[{
				xtype:'box',
				html:'Наименование',
				cls:'tab-title'
			},{
				xtype:'box',
				html:'Выводится в качестве заголовка при печати',
				anchor:'100%',
				cls:'tab-subtitle'
			},this.headerElt]
		});
		
		this.centralPanel = new Ext.Panel({
			layout:'border',
			region: 'center',
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
	            align:'stretch'
	        },
	        defaults:{
	        	scale: 'large',
	        	margins:'5 5 5 0'
	        },
			items:[
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
		this.print_name = text;
		this.headerElt.html = text;
		this.doLayout();
	}
	
});
