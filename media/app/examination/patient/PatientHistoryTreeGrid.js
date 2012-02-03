Ext.ns('App','App.ux.tree');

App.PatientHistoryTreeGrid = Ext.extend(Ext.ux.tree.TreeGrid,{
	
	initComponent:function(){
		this.hiddenPkgs = [];
		this.loader = new Ext.ux.tree.TreeGridLoader({
			baseParams:this.baseParams ? this.baseParams : 
			{
				get_years:true,
				get_months:true,
				get_visits:true,
				get_orders:true
			},
        	dataUrl:'/exam/history_tree/',
        	requestMethod:'GET',
        	listeners:{
        		load: function(){
        		},
        		scope:this
        	}
        });
		this.columns = [{
        	header:'Действие',
        	dataIndex:'text',
        	sortable:false,
        	width:400
        },{
        	header:'Дата',
        	dataIndex:'date',
        	sortable:false,
        	width:60,
        	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y'),
        	align:'right'
        },{
        	header:'Врач',
        	dataIndex:'staff',
        	sortable:true,
        	width:80,
        	align:'left'
        },{
        	header:'Оператор',
        	dataIndex:'operator',
        	sortable:false,
//	        	hidden:true,
        	width:80,
        	align:'left'
        }];
	    this.monthBtn = new Ext.Button({
			text:'Месяц',
			enableToggle: true,
			pressed: true,
			toggleHandler:function(button,state){
				if (state){
					this.loader.baseParams['get_months'] = true;
				} else {
					delete this.loader.baseParams['get_months']
				};
				this.loader.load(this.root);
			},
			scope:this
		});
	    this.yearBtn = new Ext.Button({
			text:'Год',
			pressed:true,
			enableToggle: true,
			toggleHandler:function(button,state){
				if (state){
					this.loader.baseParams['get_years'] = true;
					this.monthBtn.enable();
					if (this.monthBtn.pressed){
						this.loader.baseParams['get_months'] = true;
					}
				} else {
					delete this.loader.baseParams['get_years'];
					delete this.loader.baseParams['get_months']
					this.monthBtn.disable();
				};
				this.loader.load(this.root);
			},
			scope:this
		});
		this.visitBtn = new Ext.Button({
			text:'Визиты',
			enableToggle: true,
			pressed: this.loader.baseParams['get_visits'] ? true : false,
			toggleHandler:function(button,state){
				if (state){
					this.loader.baseParams['get_visits'] = true;
				} else {
					delete this.loader.baseParams['get_visits']
				};
				this.loader.load(this.root);
			},
			scope:this
		});
		
		this.orderBtn = new Ext.Button({
			text:'Услуги',
			enableToggle: true,
			pressed: this.loader.baseParams['get_orders'] ? true : false,
			toggleHandler:function(button,state){
				if (state){
					this.loader.baseParams['get_orders'] = true;
				} else {
					delete this.loader.baseParams['get_orders']
				};
				this.loader.load(this.root);
			},
			scope:this
		});
		config = {
			border:false,
		    /*rootVisible:true,
    		root:new Ext.tree.AsyncTreeNode({
//            	expanded: true,
            	text:'999',
            	id:'root'
            }),*/
		    header: false,
	        animCollapse:false,
	        bubbleEvents:['nodeclick'],
	        animate: false,
//	        containerScroll: false,
	        autoScroll: false,
	        loader:this.loader,
	        enableSort: false,
	        columns:this.columns,
	        listeners:{
	        	click:function(node,e){
	        		if(node.leaf) {
	        			node.attributes['shiftKey'] = e.shiftKey;
	        			this.fireEvent('nodeclick', node);
	        		};
	        	}
	        },
		    tbar: [
			    this.yearBtn,
			    this.monthBtn,
			    this.visitBtn,
			    this.orderBtn,
			    '->',{
			    	iconCls:'x-tbar-loading',
			    	handler:function(){
			    		this.getLoader().load(this.getRootNode());
			    	},
			    	scope:this
		    	}
		    ]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.PatientHistoryTreeGrid.superclass.initComponent.apply(this, arguments);
		
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

Ext.reg('patienthistorytreegrid', App.PatientHistoryTreeGrid);