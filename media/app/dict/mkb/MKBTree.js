Ext.ns('App.dict');


App.dict.MKBTree = Ext.extend(Ext.tree.TreePanel, {

	initComponent: function(){

        config = {
                root : new Ext.tree.AsyncTreeNode({
	            	expanded: true,
	            	text:'МКБ-10',
	            	id:'root'
                }),
                loader : new Ext.tree.TreeLoader({
                	nodeParameter:'parent',
                	dataUrl: App.utils.getApiUrl('service','icd10'),
                	requestMethod:'GET',
                	baseAttrs : {
                		singleClickExpand : true
                	},
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
    	        animCollapse:false,
    	        animate: false,
                autoScroll: true,
                header: false,
                requestMethod:'GET',
                border:false

            }

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.MKBTree.superclass.initComponent.apply(this, arguments);

        this.on('dblclick', function(node, e){
			if (node.attributes.leaf) {
				Ext.callback(this.fn, this.scope || window, [node]);
			}
		}, this);

        this.getSelectionModel().on('beforeselect', function(sm, node){
	        return node.isLeaf();
	    });
	},

	/*
	 * Shortcut for getting selected node
	 */
	getSelected : function(){
		return this.getSelectionModel().getSelectedNode();
	}

});

Ext.reg('mkbtree', App.dict.MKBTree);
