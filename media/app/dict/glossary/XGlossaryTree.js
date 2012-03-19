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
		
		this.filter = new Ext.ux.tree.TreeFilterX(this);
		
		this.loader = new Ext.tree.TreeLoader({
			autoLoad:false,
        	nodeParameter:'parent',
        	dataUrl: get_api_url('glossary'),
        	requestMethod:'GET',
        	baseParams:this.baseParams || {
        		format:'json',
        		section:this.section,
				staff:this.staff ? App.uriToId(this.staff) : active_staff
        	},
        	scope:this,
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
			,enableKeyEvents:true
			,listeners:{
				render: function(f){
				},
				keyup:{buffer:150, fn:function(field, e) {
					if(Ext.EventObject.ESC == e.getKey()) {
						this.onTriggerClick();
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
        
        this.appendBtn = new Ext.Button({
        	text:'начало',
        	handler:this.onAppendChild.createDelegate(this,[true]),
        	scope:this
        });
        
        this.insertBtn = new Ext.Button({
        	text:'конец',
        	handler:this.onAppendChild.createDelegate(this,[]),
        	scope:this
        });
        
        this.editBtn = new Ext.Button({
        	text:'Изменить',
        	handler:this.editNode.createDelegate(this),
        	scope:this
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
					,expanded:false
					,uiProvider:false
				},
				tbar:['Добавить в',this.appendBtn,'\\',this.insertBtn,'-',this.editBtn],
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
				appendIconCls:'silk-arrow-right',
                appendText:'Добавить в конец',
                editable:true,
				collapseAllIconCls:'x-icon-collapse-all',
				collapseAllText:'Свернуть все',
				collapseIconCls:'no-icon',
				collapseText:'Свернуть',
				contextMenu:true,
				deleteIconCls:'silk-cross',
				deleteText:'Удалить',
				errorText:'Ошибка',
				expandAllIconCls:'x-icon-expand-all',
				expandAllText:'Развернуть все',
				expandIconCls:'no-icon',
				expandText:'Развернуть',
				insertIconCls:'silk-arrow-down',
				insertText:'Добавить в начало',
				newText:'Новый элемент',
				reallyWantText:'Вы действительно хотите',
				reloadIconCls:'x-tbar-loading',
				reloadText:'Обновить',
				renameIconCls:'silk-pencil',
				renameText:'Изменить',
                listeners:{
	            	contextmenu:function(node, e){
//						this.fireEvent('nodeclick',node.attributes);
						node.select();
			            var c = node.getOwnerTree().contextMenu;
			            c.contextNode = node;
			            c.showAt(e.getXY());
			            var actions = this.actions;
						var disable = true !== this.editable;
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
			this.fireEvent('nodeclick',node.attributes,node);
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
	    this.fireEvent('nodeclick',n.attributes,n)
//	    this.treeEditor.startEdit(n.ui.textNode);
	},

	
	onTreeEditComplete: function(treeEditor, o, n){
		//o - oldValue
   		//n - newValue

	},
	
	appendChild:function(childNode, insert) {

		var params = this.applyBaseParams();
		var position = insert ? 'first-child' : 'last-child';
		var jsonData = {};
		jsonData[this.paramNames.text] = childNode.text;
		jsonData['section'] = this.section;
		jsonData['position'] = position;
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
		console.log(this.actionNode);
		var params = this.applyBaseParams();
		params = {
			format:'json',
			newText:newText
		};
		var jsonData = {};
		
		jsonData[this.paramNames.text] = newText;
		jsonData['id'] = node.attributes.id;
		jsonData['resource_uri'] = App.get_api_url('glossary') + '/' + node.attributes.id;
		jsonData['section'] = this.section;
		jsonData['staff'] = this.staff;
		jsonData['base_service'] = this.base_service;
		jsonData['parent'] = node.parentNode.attributes.resource_uri || '';
		var data = {'objects':jsonData}

		var o = Ext.apply(this.getOptions(), {
			node:node,
			action:'renameNode',
			params:params,
			method:'PUT',
			jsonData:data,
			url:App.get_api_url('glossary') + '/' + node.attributes.id,
			headers:{
				'Content-Type':'application/json'
			},
			success: function(answer,opt){
				var obj = Ext.util.JSON.decode(answer.responseText);
				node.id = obj.objects.id;
			}
		});
		
		if(false !== this.fireEvent('beforerenamerequest', this, o)) {
			// set loading indicator
			node.getUI().beforeLoad();
			Ext.Ajax.request(o);
		};
		
	},
	
	removeNode:function(node) {
		if (node.id == 'root'){
			return false
		}
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
		if (movedNode.id == 'root'){
			return false
		}
		
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
				this.fireEvent('noderemove')
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
				options.node.id = o.objects.id;
				Ext.fly(options.node.getUI().elNode).set({'ext:tree-node-id':o.objects.id});
				this.registerNode(options.node);
				options.node.attributes['id'] = o.objects.id;
				options.node.attributes['resource_uri'] = App.getApiUrl('glossary')+'/'+o.objects.id;
				options.node.select();
			break;
		}
		//}}}
		this.fireEvent(options.action.toLowerCase() + 'success', this, options.node);

	},
	
	onRenameNode:function() {
		var node = this.selectedNode;
		if(!node) {
			return;
		}
		this.editNode()
//		this.editor.triggerEdit(node, 10);
	},
	
	beforeStartEdit: function( editor, boundEl, value ) {
		this.fireEvent('nodeclick',editor.editNode.attributes,editor.editNode);
//		this.editNode();
		return false;
	}, 

	editNode: function(){
		
		var node = this.getSelectionModel().getSelectedNode();
		if(!node) {
			return;
		};
		if (node.id == 'root'){
			return false
		}
		var oldValue = node.attributes.text;
		var editWin = new App.dict.EditNodeWindow({
			text:oldValue,
			fn:function(value){
				var inode = this.getSelectionModel().getSelectedNode();
				if (value){
					this.renameNode(inode,value)
					node.setText(value);
					this.fireEvent('nodeedit',node)
				} else {
					this.removeNode(inode)
				};
			},
			lesteners:{
				'cancel':function(){
				},
				scope:this
			},
			scope:this
		});
		
		editWin.show();
	},
	
	onTriggerClick:function() {
		this.search.setValue('');
		this.filter.clear();
	},
	
	onAppendChild:function(insert) {
		this.actionNode = this.actionNode || this.selectedNode;
		if(!this.actionNode) {
			var node = this.getRootNode();
		} else {
			var node = this.actionNode;
		};
		var child;
		node.leaf = false;
		node.expand(false, false, function(n) {
			if(true === insert) {
				child = n.insertBefore(this.loader.createNode({text:this.newText, loaded:true}), n.firstChild);
			}
			else {
				child = n.appendChild(this.loader.createNode({text:this.newText, loaded:true}));
			}
		}.createDelegate(this));
		
		var editWin = new App.dict.EditNodeWindow({
			text:this.newText,
			fn:function(value){
//				var node = this.actionNode;
				if (value){
					child.setText(value);
					this.appendChild(child,insert);
				} else {
					child.setText(this.newText)
				}
				this.fireEvent('nodecreate',child);
			},
			scope:this
		});
		
		editWin.show();

		this.actionNode = null;

	}
});

//treeFilter = new Ext.ux.tree.TreeFilterX(App.dict.GlossaryTree);

Ext.reg('xglossarytree', App.dict.XGlossaryTree);
