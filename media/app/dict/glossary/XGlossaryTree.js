Ext.ns('App.dict');


App.dict.XGlossaryTree = Ext.extend(Ext.ux.tree.RemoteTreePanel, {
	
	initComponent: function(){
		
		this.CM = new Ext.ux.menu.IconMenu();
		
		this.treeEditor = new Ext.tree.TreeEditor(this, {}, {
		    cancelOnEsc: true,
		    completeOnEnter: true,
		    selectOnFocus: true,
		    allowBlank: false,
		    listeners: {
		        complete: this.onTreeEditComplete,
		        scope:this
		    }
		});
		
		
		
//		this.contextMenu = new Ext.menu.Menu([
//			 new Ext.menu.TextItem({text:'', style:'font-weight:bold;margin:0px 4px 0px 27px;line-height:18px'})
//			,'-'
//			,this.actions.reloadTree
//			,this.actions.expandAll
//			,this.actions.collapseAll
//			,'-'
//			,this.actions.expandNode
//			,this.actions.collapseNode
//			,'-'
//			,this.actions.renameNode
//			,'-'
//			,this.actions.appendChild
//			,this.actions.insertChild
//			,'-'
//			,this.actions.removeNode
//		]);
//		
		this.loader = new Ext.tree.TreeLoader({
        	nodeParameter:'parent',
        	dataUrl: get_api_url('glossary'),
        	requestMethod:'GET',
        	processResponse : function(response, node, callback, scope){
		        var json = response.responseText;
		        try {
		            var o = response.responseData || Ext.decode(json);
		            o = o.objects;
		            node.beginUpdate();
		            for(var i = 0, len = o.length; i < len; i++){
		                var n = this.createNode(o[i]);
		                if(n){
		                    node.appendChild(n);
		                }
		            }
		            node.endUpdate();
		            this.runCallback(callback, scope || node, [node]);
		        }catch(e){
		            this.handleFailure(response);
		        }
		    }
        });
                
                
        this.search = new Ext.form.TriggerField({
        	triggerClass:'x-form-clear-trigger'
			,onTriggerClick:function() {
				this.search.setValue('');
				this.filter.clear();
			},
			scope:this
//					,id:'filter'
			,enableKeyEvents:true
			,listeners:{
				render: function(f){
					this.filter = new Ext.ux.tree.TreeFilterX(this);
				},
				keyup:{buffer:150, fn:function(field, e) {
					if(Ext.EventObject.ESC == e.getKey()) {
						field.onTriggerClick();
					}
					else {
						var val = this.search.getRawValue();
						var re = new RegExp('.*' + val + '.*', 'i');
						this.filter.clear();
						this.filter.filter(re, 'text');
					}
				}},
				scope:this
			}
        });
        
        config = {
                margins: '0 0 5 5',
                width:250,
                split:true,
                disabled:false,
//                contextMenu:this.contextMenu, 	
                root:{
					 nodeType:'async'
					,id:'root'
					,text:'Глоссарий'
					,expanded:true
					,uiProvider:false
				},
				tbar:['Поиск:', this.search]
				,tools:[{
					 id:'refresh'
					,handler:function() {
						this.items.item(0).actions.reloadTree.execute();
					}
				}]
				,plugins:this.CM,
                loader: this.loader,
                rootVisible:true,
                lines:false,
                collapsible: true,
                collapseMode:'mini',
                autoScroll: true,
                header: false,
                requestMethod:'GET',
                appendText:'Добавить в конец'
				,collapseAllText:'Свернуть все'
				,collapseText:'Свернуть'
				,contextMenu:true
				,deleteText:'Удалить'
				,errorText:'Ошибка'
				,expandAllText:'Развернуть все'
				,expandText:'Развернуть'
				,insertText:'Добавить в начало'
				,newText:'Новый элемент'
				,reallyWantText:'Вы действительно хотите'
				,reloadText:'Обновить'
				,renameText:'Переименовать',
                listeners:{
	            	contextmenu:function(node, e){
						this.fireEvent('nodeclick',node.attributes);
						node.select();
			            var c = node.getOwnerTree().contextMenu;
			            c.contextNode = node;
			            c.showAt(e.getXY());
			            var actions = this.actions;
						var disable = true !== this.editable || !this.actionNode;
						actions.appendChild.setDisabled(false);
						actions.renameNode.setDisabled(false);
						actions.removeNode.setDisabled(false);
						actions.insertChild.setDisabled(false);
					},
					scope:this
	            }
//                tbar: [' ', new Ext.form.TextField({
//                    width:200,
 //               })]
 
            },
            
        
        this.on('click', function(node, e){
			this.fireEvent('nodeclick',node.attributes);
			if (node.attributes.leaf) {
				Ext.callback(this.fn, this.scope || window, [node]);
			}
		}, this);
		
//		this.on('contextmenu', function(node, e) {
//            node.select();
//            var c = node.getOwnerTree().contextMenu;
//            c.contextNode = node;
//            c.showAt(e.getXY());
//            var actions = this.actions;
//			var disable = true !== this.editable || !this.actionNode;
//			actions.appendChild.setDisabled(false);
//			actions.renameNode.setDisabled(true);
//			actions.removeNode.setDisabled(false);
//			actions.insertChild.setDisabled(false);
//		},this);
		
		this.on('dblclick',this.onTreeNodeDblClick,this);
		
		

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.XGlossaryTree.superclass.initComponent.apply(this, arguments);
	},
	
	onTreeNodeDblClick: function(n) {
	    this.treeEditor.editNode = n;
	    this.treeEditor.startEdit(n.ui.textNode);
	},

	
	onTreeEditComplete: function(treeEditor, o, n){
		//o - oldValue
   		//n - newValue

	},
	
	appendChild:function(childNode, insert) {

		var params = this.applyBaseParams();
		var jsonData = {};
		jsonData[this.paramNames.text] = childNode.text;
		jsonData['section'] = this.section;
		jsonData['base_service'] = this.base_service;
		jsonData['staff'] = this.staff;
		jsonData['parent'] = childNode.parentNode.attributes.resource_uri;
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			node:childNode,
			action:'appendChild'
			,params:params
			,jsonData:data
			,headers:{
				'Content-Type':'application/json'
			}
		});

		if(false !== this.fireEvent('before' + (insert ? 'insert' : 'append') + 'request', this, o)) {

			// set loading indicator
			childNode.getUI().beforeLoad();
			Ext.Ajax.request(o);
		}
	}, // eo function appendChild
	
	renameNode:function(node, newText) {
		
		var params = this.applyBaseParams();
		var jsonData = {};
		jsonData[this.paramNames.text] = newText;
		jsonData['id'] = childNode.id;
		jsonData['section'] = this.section;
		jsonData['staff'] = this.staff;
		jsonData['base_service'] = this.base_service;
		jsonData['parent'] = childNode.parentNode.resource_uri;
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			node:node,
			action:'appendChild',
			params:params,
			jsonData:data,
			headers:{
				'Content-Type':'application/json'
			}
		});

		if(false !== this.fireEvent('beforerenamerequest', this, o)) {
			// set loading indicator
			node.getUI().beforeLoad();
			Ext.Ajax.request(o);
		}

	},
	
	removeNode:function(node) {
		if(0 === node.getDepth()) {
			return;
		}
		Ext.Msg.show({
			 title:this.deleteText
			,msg:this.reallyWantText + ' ' + this.deleteText.toLowerCase() + ': <b>' + node.text + '</b>?'
			,icon:Ext.Msg.QUESTION
			,buttons:Ext.Msg.YESNO
			,scope:this
			,fn:function(response) {
				if('yes' !== response) {
					return;
				}
				var jsonData = {};
				jsonData['resource_uri'] = node.resource_uri;
				var params = this.applyBaseParams();
				
				var data = {'objects':jsonData}

				var o = Ext.apply(this.getOptions(), {
					action:'removeNode',
					node:node,
					url: App.get_api_url('glossary')+'/'+node.id,
					params:params,
					method:'DELETE',
					jsonData:data,
					headers:{
						'Content-Type':'application/json'
					}
				});

				if(false !== this.fireEvent('beforeremoverequest', this, o)) {
					// set loading indicator
					node.getUI().beforeLoad();
					Ext.Ajax.request(o);
				}
			}
		});
	}

});

//treeFilter = new Ext.ux.tree.TreeFilterX(App.dict.GlossaryTree);

Ext.reg('xglossarytree', App.dict.XGlossaryTree);
