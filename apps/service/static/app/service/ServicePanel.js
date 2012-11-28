Ext.ns('App');

App.ServicePanel = Ext.extend(Ext.tree.TreePanel,{

	initComponent:function(){
		this.hiddenPkgs = [];
		config = {
		    rootVisible: true,
		    lines: false,
		    header: false,
	        animCollapse:false,
	        animate: false,
	        dataUrl:this.dataUrl || '/webapp/service/groups/',
            root: {
	            nodeType: 'async',
	            text: 'Услуги',
	            draggable: false,
	            expanded:true
            },
			listeners:{
	        	dblclick:function(node,e){
	        		if(node.isLeaf()) {
	        			//App.eventManager.fireEvent('servicedblclick', node.attributes);
	        		}
	        	},
	        	click: function(node,e) {
	        	}
	        },
		    tbar: []
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ServicePanel.superclass.initComponent.apply(this, arguments);

	    this.getSelectionModel().on('beforeselect', function(sm, node){
	        //return node.isLeaf();
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

Ext.reg('servicepanel', App.ServicePanel);
