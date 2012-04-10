Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.CardGeneralTab = Ext.extend(Ext.form.FormPanel, {
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
		
		this.mkb = new Ext.form.LazyComboBox({
			fieldLabel:'Диагноз по МКБ',
			hideTrigger:true,
			anchor:'95%',
			name:'mbk_diag',
            allowBlank:true,
			store: new Ext.data.JsonStore({
				autoLoad:false,
				proxy: new Ext.data.HttpProxy({
					url:get_api_url('icd10'),
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','text','id']
			}),
//			typeAhead: true,
			readOnly:true,
			//queryParam:'code__istartswith',
//			minChars:3,
//			triggerAction: 'all',
			emptyText:'Выберите диагноз...',
			valueField: 'resource_uri',
			displayField: 'text',
//			selectOnFocus:true,
			listeners:{
				'focus': this.openTree.createDelegate(this),
				scope:this
			}
		});
		
		this.assistant = new Ext.form.LazyClearableComboBox({
			fieldLabel:'Лаборант',
			name:'assistant',
			anchor:'50%',
			valueField:'resource_uri',
			queryParam : 'staff__last_name__istartswith',
			store:new Ext.data.RESTStore({
				autoLoad : true,
				apiUrl : get_api_url('position'),
				model: ['id','name','resource_uri']
			}),
		    minChars:2,
		    emptyText:'Выберите врача...',
		    listeners:{
		    	select: function(combo, rec,i) {
		    		this.fireEvent('setassistant',rec.data.resource_uri);
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
		
		this.equipBtn = new Ext.Button({
			text: 'Оборудование',
			handler:function(){
				this.fireEvent('equiptab');
			},
			scope:this
		});
		
		this.moveArchiveBtn = new Ext.Button({
			text: 'Переместить в архив',
			hidden:this.fromArchive,
			handler:function(){
				this.fireEvent('movearhcivecard')
			},
			scope:this
		});
		
		this.asgmtBtn = new Ext.Button({
			text: 'Направления',
			handler:function(){
				this.fireEvent('openasgmt')
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
			border:false,
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
		
		this.mkbPanel = new Ext.Panel({
			region:'center',
			layout:'anchor',
			border:false,
			margins:'5 5 5 5',
			padding:10,
			items:[{
				xtype:'box',
				html:'Диагноз по МКБ-10',
				cls:'tab-title'
			}/*,{
				xtype:'box',
				html:'Выводится в качестве заголовка при печати',
				anchor:'100%',
				cls:'tab-subtitle'
			}*/,this.mkb]
		});
		
		this.assistantPanel = new Ext.Panel({
			region:'center',
			layout:'anchor',
			border:false,
			margins:'5 5 5 5',
			padding:10,
			items:[{
				xtype:'box',
				html:'Лаборант',
				cls:'tab-title'
			}/*,{
				xtype:'box',
				html:'Выводится в качестве заголовка при печати',
				anchor:'100%',
				cls:'tab-subtitle'
			}*/,this.assistant]
		});
		
		
		
		this.centralPanel = new Ext.Panel({
			layout:'form',
			region: 'center',
			border:false,
			items:[this.titlePanel,
				this.mkbPanel,
				this.assistantPanel]
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
				this.equipBtn,
				this.moveArchiveBtn
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
		App.examination.CardGeneralTab.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			if (!this.record){
				return false
			};
			if (this.record.data.assistant){
				this.assistant.setValue(this.record.data.assistant)
			};
			
			if (this.record.data.mkb_diag){
				this.mkb.setValue(this.record.data.mkb_diag)
			}
		});
	},
	
	setPrintName: function (text){
		this.printNameField.setValue(text);
	},
	
	openTree : function(){
		if (!this.mkbWin){
			this.mkbWin = new App.dict.MKBWindow({
				fn: function(node){
					this.mkb.forceValue(node.attributes.resource_uri);
					this.mkbWin.hide();
					this.fireEvent('setmkb',node.attributes.resource_uri)
				},
				scope:this
			})
		}
		this.mkbWin.show();
	}
	
});
