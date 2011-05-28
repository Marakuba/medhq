Ext.ns('App.ServicePanel');

App.ServicePanel.Tree = Ext.extend(Ext.ux.tree.TreeGrid,{

	initComponent:function(){
		this.hiddenPkgs = [];
		config = {
		    rootVisible: false,
		    lines: false,
		    header: false,
	        animCollapse:false,
	        animate: false,
	        enableSort: false,
	        dataUrl:'/media/resources/js/app/ServicePanelData.json',
	        columns:[{
	        	header:'Название',
	        	dataIndex:'text',
	        	width:250
	        },{
	        	header:'Цена',
	        	dataIndex:'price',
	        	width:50,
	            tpl: new Ext.XTemplate('{price:this.formatPrice}', {
	            	formatPrice: function(v) {
	            		return v==0 ? '' : v
	            	}
	            })
	        }],
	        listeners:{
	        	dblclick:function(node,e){
	        		if(node.isLeaf()) {
	        			App.eventManager.fireEvent('servicedblclick', node.attributes);
	        		}
	        	}
	        },
		    tbar: [' ', new Ext.form.TextField({
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
		    })]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ServicePanel.Tree.superclass.initComponent.apply(this, arguments);
		
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
		this.expandAll();
		var re = new RegExp('^' + Ext.escapeRe(text), 'i');
		this.filter.filterBy(function(n){
			return re.test(n.text);
		});
		
		// hide empty packages that weren't filtered
		this.hiddenPkgs = [];
                var me = this;
		this.root.cascade(function(n){
			if(!n.attributes.isClass && n.ui.ctNode.offsetHeight < 3){
				n.ui.hide();
				me.hiddenPkgs.push(n);
			}
		});
	}
});

Ext.reg('servicepanel', App.ServicePanel.Tree);