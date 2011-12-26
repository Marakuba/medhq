Ext.ns('App.dict');


App.dict.XGlossaryTree = Ext.extend(Ext.ux.tree.RemoteTreePanel, {
	
	initComponent: function(){
		
		this.CM = new Ext.ux.menu.IconMenu({
			onDestroy:function() {
			}	
		});
		
		this.editor = new Ext.tree.TreeEditor(this, {}, {
		    cancelOnEsc: true,
		    completeOnEnter: true,
		    selectOnFocus: true,
		    allowBlank: false,
		    listeners: {
		        complete: this.onTreeEditComplete,
		        beforestartedit : this.beforeStartEdit,
		        scope:this
		    }
		});
		
		
		
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
                animate: false,
//                contextMenu:this.contextMenu, 	
                root:{
					 nodeType:'async'
					,id:'root'
					,text:'Глоссарий'
					,expanded:true
					,uiProvider:false
				},
				tbar:['Поиск:', this.search],
				tools:[{
					 id:'refresh',
					handler:function() {
						this.items.item(0).actions.reloadTree.execute();
					}
				}],
				plugins:this.CM,
                loader: this.loader,
                rootVisible:true,
                lines:false,
                collapsible: true,
                collapseMode:'mini',
                autoScroll: true,
                header: false,
                requestMethod:'GET',
//                appendText:'Добавить в конец',
                editable:true,
				collapseAllText:'Свернуть все',
				collapseText:'Свернуть',
				contextMenu:true,
				deleteText:'Удалить',
				errorText:'Ошибка',
				expandAllText:'Развернуть все',
				expandText:'Развернуть',
				insertText:'Добавить в начало',
				newText:'Новый элемент',
				reallyWantText:'Вы действительно хотите',
				reloadText:'Обновить',
				renameText:'Изменить',
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
					afterrender: function(){
					},
					scope:this
	            }
//                tbar: [' ', new Ext.form.TextField({
//                    width:200,
 //               })]
 
            },
            
        
        this.on('click', function(node, e){
        	if (node.id=='root'){
        		return false
        	}
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
		
//		this.on('dblclick',this.onTreeNodeDblClick,this);
		
		

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.XGlossaryTree.superclass.initComponent.apply(this, arguments);
	},
	
	onTreeNodeDblClick: function(n) {
//	    this.treeEditor.editNode = n;
//	    console.log(n);
	    this.fireEvent('nodeclick',n.attributes)
//	    this.treeEditor.startEdit(n.ui.textNode);
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
		jsonData['parent'] = childNode.parentNode.attributes.resource_uri || '';
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			node:childNode,
			action:'appendChild',
			method: 'POST',
			params:params,
			jsonData:data,
			headers:{
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
		params = {
			format:'json'
		};
		var jsonData = {};
		
		jsonData[this.paramNames.text] = newText;
		jsonData['id'] = node.id;
		jsonData['resource_uri'] = App.get_api_url('glossary') + '/' + node.attributes.id;
		jsonData['section'] = this.section;
		jsonData['staff'] = this.staff;
		jsonData['base_service'] = this.base_service;
		jsonData['parent'] = node.parentNode.attributes.resource_uri || '';
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			node:node,
			action:'appendChild',
			params:params,
			method:'PUT',
			jsonData:data,
			url:App.get_api_url('glossary') + '/' + node.attributes.id,
			headers:{
				'Content-Type':'application/json'
			}
		});

		if(false !== this.fireEvent('beforerenamerequest', this, o)) {
			// set loading indicator
			node.getUI().beforeLoad();
			Ext.Ajax.request(o);
		};
		
		this.doLayout();

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
					url: App.get_api_url('glossary')+'/'+node.attributes.id,
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
	},
	
	onBeforeNodeDrop:function(e) {
		var movedNode = this.selectedNode;
		this.moveNode(e,movedNode);
		e.dropStatus = true;
		return false;

	},
	
	moveNode:function(e,movedNode) {
		
		if (!movedNode.attributes.id){
			return false
		}

		var params = this.applyBaseParams();
		var jsonData = {};
		jsonData['id'] = movedNode.attributes.id;
		jsonData['resource_uri'] = App.get_api_url('glossary') + '/' + movedNode.attributes.id;
		jsonData['section'] = this.section;
		jsonData['staff'] = this.staff;
		jsonData['base_service'] = this.base_service;
		jsonData['parent'] = e.target.attributes.resource_uri || '';
		jsonData['point'] = e.point;
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			action:'moveNode',
			e:e,
			node:e.dropNode,
			params:params,
			url:App.get_api_url('glossary') + '/' + movedNode.attributes.id,
			method:'PUT',
			jsonData:data,
			headers:{
				'Content-Type':'application/json'
			}
		});

		if(false !== this.fireEvent('beforemoverequest', this, o)) {
			// set loading indicator
			e.dropNode.getUI().beforeLoad();
			Ext.Ajax.request(o);
		}

	},
	
	actionCallback:function(options, success, response) {

		// remove loading indicator
		if(options.node) {
			options.node.getUI().afterLoad();
		}

		// {{{
		// failure handling
		if(true !== success) {
			this.showError(response.responseText);
			return;
		}
		if (options.action !== 'removeNode'){
			var o;
			try {
				o = Ext.decode(response.responseText);
			}
			catch(ex) {
				this.showError(response.responseText);
				return;
			}
			if(true !== o.success) {
				this.showError(o.error || o.errors);
				switch(options.action) {
					case 'appendChild':
					case 'insertChild':
						options.node.parentNode.removeChild(options.node);
					break;
	
					default:
					break;
				}
				return;
			}
		}
		if(!options.action) {
			this.showError('Developer error: no options.action');
		}
		// }}}
		//{{{
		// success handling - synchronize ui with server action
		switch(options.action) {
			case 'renameNode':
				options.node.setText(options.params.newText);
			break;

			case 'removeNode':
				options.node.parentNode.removeChild(options.node);
			break;

			case 'moveNode':
				if('append' === options.e.point) {
					options.e.target.expand();
				}
				this.dropZone.completeDrop(options.e);
			break;

			case 'appendChild':
			case 'insertChild':
				// change id of the appended/inserted node
				this.unregisterNode(options.node);
				options.node.id = o.id;
				Ext.fly(options.node.getUI().elNode).set({'ext:tree-node-id':o.id});
				this.registerNode(options.node);
				options.node.select();
			break;
		}
		//}}}
		this.fireEvent(options.action.toLowerCase() + 'success', this, options.node);

	},
	
	onRenameNode:function() {
		this.actionNode = this.actionNode || this.selectedNode;
		if(!this.actionNode) {
			return;
		}
		var node = this.actionNode;
		this.editNode(node,node.attributes.text)
//		this.editor.triggerEdit(node, 10);
		this.actionNode = null;
	},
	
	beforeStartEdit: function( editor, boundEl, value ) {
		this.editNode(editor.editNode, value);
		return false;
	}, 

	editNode: function(node, value){
		var editWin = new App.dict.EditNodeWindow({
			text:value,
			fn:function(value){
//				var node = this.actionNode;
				if (value){
					this.renameNode(node,value)
					node.setText(value);
				} else {
					this.removeNode(node)
				}
			},
			scope:this
		});
		
		editWin.show();
	}
});

//treeFilter = new Ext.ux.tree.TreeFilterX(App.dict.GlossaryTree);

Ext.reg('xglossarytree', App.dict.XGlossaryTree);
