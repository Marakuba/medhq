Ext.ns('App');

App.ServiceTreeGrid = Ext.extend(Ext.ux.tree.TreeGrid,{
	
	initComponent:function(){
		this.hiddenPkgs = [];
		config = {
//			renderTo:'service-tree',
//			width:480,
//			height:400,
		    rootVisible: false,
		    lines: false,
		    header: false,
	        animCollapse:false,
	        animate: false,
	        containerScroll: true,
	        autoScroll: true,
	        rootVisible: false,
	        loader:new Ext.ux.tree.TreeGridLoader({
				baseParams:{
					payment_type:'н'
				},
	        	dataUrl:'/webapp/service_tree/',
	        	requestMethod:'GET',
	        	listeners:{
	        		load: function(){
	        		},
	        		scope:this
	        	}
	        }),
//	        root:{
//		        nodeType: 'async',
//		        text: 'Услуги клиники',
//		        draggable: false,
//		        id: 'source'	        	
//	        },
	        columns:[{
	        	header:'Наименование',
	        	dataIndex:'text',
	        	width:this.large ? 700 : 180
	        },{
	        	header:'Цена',
	        	dataIndex:'price',
	        	width:50,
	        	align:'right'
	        },{
	        	header:'Время вып-я',
	        	dataIndex:'exec_time',
//	        	hidden:true,
	        	width:50,
	        	align:'left'
	        }],
	        listeners:{
	        	click:function(node,e){
	        		if(node.leaf) {
	        			node.attributes['shiftKey'] = e.shiftKey;
	        			this.fireEvent('serviceclick', node);
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
		App.ServiceTreeGrid.superclass.initComponent.apply(this, arguments);
		
	    this.getSelectionModel().on('beforeselect', function(sm, node){
	        return node.isLeaf();
	    });
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
//		this.expandAll();
		this.getRootNode().cascade(function(node){
			node.expandChildNodes();
		});
		
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

Ext.reg('servicetreegrid', App.ServiceTreeGrid);