Ext.ns('App.dict');

App.dict.GlossaryEditor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.staff = App.getApiUrl('staff')+ '/' + active_staff;
		
		this.glossary = new App.dict.XGlossaryTree({
			staff:this.staff,
			root:{
				 nodeType:'async'
				,id:'root'
				,text:'Глоссарий'
				,expanded:false
				,uiProvider:false
			},
			baseParams:{
				format:'json',
				staff:active_staff
			},
			scope:this,
			layout:'fit',
			height:500,
			region:'center',
			listeners:{
				scope:this,
				nodeclick:function(attrs,node){
					this.node = node;
					var text = node.attributes.text;
					this.editor.body.update(text);
				},
				nodecreate:function(node){
					this.node = node;
					var text = node.attributes.text;
					this.editor.body.update(text);
				},
				noderemove:function(){
					this.node = undefined;
					this.editor.body.update('')
				},
				nodeedit:function(node){
					this.editor.body.update(node.attributes.text)
				}
			}
		});
		
		this.fieldSetStore = new Ext.data.RESTStore({
			autoSave: false,
			autoLoad : false,
			apiUrl : App.getApiUrl('examfieldset'),
			model: App.models.FieldSet
		});
		
		this.menuList = new Ext.list.ListView({
	        store: this.fieldSetStore,
	        multiSelect: false,
	        singleSelect :true,
	        emptyText: 'нет разделов',
	        reserveScrollOffset: true,
	        columns: [{
	            header: 'Раздел',
	            dataIndex: 'title'
	        }],
	        listeners:{
	        	click:function(dv,index,node,e) {
	        		var rootNode = this.glossary.getRootNode()
	        		var rec = this.fieldSetStore.getAt(index);
	        		this.glossary['section'] = rec.data.name;
	        		this.glossary.loader.baseParams['section'] = rec.data.name;
					this.glossary.loader.load(rootNode);
					rootNode.expand();
					this.node = undefined;
					this.editor.body.update('')
					rootNode.setText('Глоссарий - ' + rec.data.title);
	        	},
	        	scope:this
	        }
	    });
		this.editor = new Ext.Panel({
			region:'south',
			layout:'fit',
			height:150,
			items:[],
			listeners:{
				scope:this,
				afterrender:function(panel){
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
	                
					var nodeEditor = new Ext.Editor(Ext.apply({
	                    alignment: 'tl-tl',
	                    listeners: {
	                    	show:function(edt){
	                    		
	                    	},
	                        complete: function(ed, value, oldValue){
	                        	
	                        	this.glossary.renameNode(this.node,value)
	                        },
	                        scope:this
	                    },
	                    field: {
	                        allowBlank: true,
	                        xtype: 'textarea',
	                        width: 1000,
	                        heigth:150,
	                        autoScroll:true,
	                        layout:'fit',
	                        selectOnFocus: true,
	                        cls:'text-editor',
	                        grow:true,
	                        listeners:{
	                        	'render': function(c) {
							     	var el = c.getEl()
							     	el.on('keypress', function(e,t) {
							     	}, this);
							     	el.on('click',function(e,t,o){
							     	}, this);
							     	el.on('blur', function(t,e) {
							        	nodeEditor.completeEdit();
							     	}, this);
							     	el.on('focus', function(t,e) {
							     	}, this);
							    },
	                        	scope:this
	                        },
	                        scope:this
	                    }
	                }, cfg));
	                panel.body.on('click', function(e, t){
	                	if (this.node){
	                		nodeEditor.startEdit(panel.body);
	                	};
	                }, this);
	                panel.body.on('blur', function(e, t){
	                }, this);
				}
			}
		})
		
		this.glossPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			layout:'border',
 			autoScroll:true,
 			margins:'5 5 5 0',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.glossary,
    			this.editor
    		]
		});
		
		this.menuPanel = new Ext.Panel({
			region:'west',
 			border:true,
 			collapsible:false,
 			width:150,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.menuList
    		]
		});
		
		var config = {
			id:'gloss-editor',
			closable:true,
			title: 'Редактор глоссария',
			layout: 'border',	
     		items: [
				this.menuPanel,
				this.glossPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.GlossaryEditor.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.fieldSetStore.load({callback:function(records){
				if(records.length){
					this.menuList.select(records[0]);
					this.glossary.loader.baseParams['section'] = records[0].data.name;
					this.glossary['section'] = records[0].data.name;
					var rootNode = this.glossary.getRootNode()
					rootNode.expand()
					rootNode.setText('Глоссарий - ' + records[0].data.title);
				} else {
					this.glossary.disable()
				}
			},scope:this})
		},this);
		
	}
	
	
});

Ext.reg('glosseditor', App.dict.GlossaryEditor);