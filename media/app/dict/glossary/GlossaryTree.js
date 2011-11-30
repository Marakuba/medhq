Ext.ns('App.dict');


App.dict.GlossaryTree = Ext.extend(Ext.tree.TreePanel, {
	
	initComponent: function(){

        config = {
                margins: '0 0 5 5',
                root:  new Ext.tree.AsyncTreeNode({
	            	expanded: false,
	            	text:'Глоссарий',
	            	id:'root'
                }),
                width:250,
                split:true,
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
		
		

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.GlossaryTree.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('glossarytree', App.dict.GlossaryTree);
