Ext.ns('App.ServicePanel');

App.examination.GlossaryTree = Ext.extend(Ext.tree.TreePanel,{

	initComponent:function(){
		this.hiddenPkgs = [];
		
		this.helperTb = new Ext.Panel({ 
			cls: "x-hidden",
			height: 50, width: 150,
			border: false,
			tbar:[{
				iconCls:'silk-add'
			}],
			html:'test panel'
		});

		this.layerTb = new Ext.Layer({ isFocused: false }, this.helperTb.getEl());
		
		config = {
			title:'Глоссарий',
		    rootVisible: false,
		    lines: false,
		    header: false,
	        animCollapse:false,
	        animate: false,
	        containerScroll: true,
	        autoScroll: true,
	        loader:new Ext.tree.TreeLoader({
	        	dataUrl:'/webapp/service_tree/',
	        	requestMethod:'GET',
	        	listeners:{
	        		load: function(){
	        		}
	        	}
	        }),
	        rootVisible: false,
	        root:{
		        nodeType: 'async',
		        text: 'Услуги клиники',
		        draggable: false,
		        id: 'source'	        	
	        },
/*	        columns:[{
	        	header:'Название',
	        	dataIndex:'text',
	        	width:250,
	        	css:{
	        		whiteSpace:'normal'
	        	}
	        },{
	        	header:'Цена',
	        	dataIndex:'price',
	        	width:50,
	            tpl: new Ext.XTemplate('{price:this.formatPrice}', {
	            	formatPrice: function(v) {
	            		return v==0 ? '' : v
	            	}
	            })
	        }],*/
	        listeners:{
	        	click:function(node,e){
	        		if(node.isLeaf()) {
	        			App.eventManager.fireEvent('glossaryclick', node.attributes);
	        		}
	        	}
	        },
		    tbar: [new Ext.form.TextField({
		    	id:'service-tree-filter',
		        width: 250,
				emptyText:'Поиск по названию',
                enableKeyEvents: true,
				listeners:{
					render: function(f){
                    	this.filter = new Ext.tree.TreeFilter(this, {
                    		clearBlank: true,
                    		autoClear: true
                    	});
					},
                    keydown: {
                        fn: this.filterTree,
                        buffer: 350,
                        scope: this
                    },
                    scope: this
				}
		    }),'->',{
		    	iconCls:'x-tbar-loading',
		    	handler:function(){
		    		this.getLoader().load(this.getRootNode());
		    	},
		    	scope:this
		    }]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ServicePanel.Tree.superclass.initComponent.apply(this, arguments);
		
//		this.te = new Ext.tree.TreeEditor(this);
//		
//		this.te.on('beforestartedit',function(ed, boundEl, value) {
//					return ed.editNode.attributes.helper || false;
////					if (ed.editNode.leaf)
////						return false;
//				});
		
		this.on('click', function(node, e){
			this.showLayerTb(node.getUI());
		}, this);
		
	    this.getSelectionModel().on('beforeselect', function(sm, node){
//	        return node.attributes.helper;
	    });
	    
	    this.getSelectionModel().on('selectionchange', function(sm, node){
	    	if(this.lastHelpNode) {
	    		this.lastHelpNode.remove();
	    	};
	    	this.lastHelpNode = new Ext.tree.TreeNode({
	    		text:'Создать новый элемент',
	    		iconCls:'silk-add',
	    		cls:'help-node'
	    	});
	    	node.insertBefore(this.lastHelpNode, node.firstChild);
	    });

	},
	
	showLayerTb : function (el) {
		this.layerTb.alignTo(el.getEl());
		this.layerTb.show(false);
	},

	hideLayerTb : function (el) {
		this.layerTb.hide(false);
	},
	
	filterTree: function(t, e){
		var text = t.getValue();
		Ext.each(this.hiddenPkgs, function(n){
			n.ui.show();
		});
		if(!text){
			this.filter.clear();
			return;
		}
		this.expandAll();
		
		var re = new RegExp(Ext.escapeRe(text), 'i');
		this.filter.filterBy(function(n){
			//console.log(n.text,re.test(n.text));
			return !n.isLeaf() || re.test(n.text); //!n.attributes.isClass || 
		});
		
		// hide empty packages that weren't filtered
		this.hiddenPkgs = [];
		var me = this;
		this.root.cascade(function(n){
			if(!n.isLeaf() && n.ui.ctNode.offsetHeight < 1){ // 
				n.ui.hide();
				me.hiddenPkgs.push(n);
			}
		});
	}
});

Ext.reg('glossarytree', App.examination.GlossaryTree);