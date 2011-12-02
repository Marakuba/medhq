Ext.ns('App.dict');


App.dict.XGlossaryTree = Ext.extend(Ext.ux.tree.RemoteTreePanel, {
	
	initComponent: function(){
		
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


        config = {
                margins: '0 0 5 5',
                width:250,
                split:true,
                root:{
					 nodeType:'async'
					,id:'root'
					,text:'Глоссарий'
					,expanded:true
					,uiProvider:false
				},
				tbar:['Поиск:', {
					 xtype:'trigger'
					,triggerClass:'x-form-clear-trigger'
					,onTriggerClick:function() {
						this.setValue('');
						treeFilter.clear();
					}
//					,id:'filter'
					,enableKeyEvents:true
					,listeners:{
						keyup:{buffer:150, fn:function(field, e) {
							if(Ext.EventObject.ESC == e.getKey()) {
								field.onTriggerClick();
							}
							else {
								var val = this.getRawValue();
								var re = new RegExp('.*' + val + '.*', 'i');
								treeFilter.clear();
								treeFilter.filter(re, 'text');
							}
						}}
					}
				}]
				,tools:[{
					 id:'refresh'
					,handler:function() {
						win.items.item(0).actions.reloadTree.execute();
					}
				}]
				,plugins:[new Ext.ux.menu.IconMenu()],
                loader: new Ext.tree.TreeLoader({
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
                }),
                rootVisible:true,
                lines:false,
                collapsible: true,
                collapseMode:'mini',
                autoScroll: true,
                header: false,
                requestMethod:'GET'
//                tbar: [' ', new Ext.form.TextField({
//                    width:200,
 //               })]
 
            }
        
        this.on('click', function(node, e){
			this.fireEvent('nodeclick',node.attributes);
			if (node.attributes.leaf) {
				Ext.callback(this.fn, this.scope || window, [node]);
			}
		}, this);
		
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

	}

});

treeFilter = new Ext.ux.tree.TreeFilterX(App.dict.GlossaryTree);

Ext.reg('xglossarytree', App.dict.XGlossaryTree);
