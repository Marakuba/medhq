Ext.ns('App','App.ux.tree');

App.ux.tree.ColspanNodeUI = Ext.extend(Ext.ux.tree.TreeGridNodeUI,{
	renderElements : function(n, a, targetNode, bulkRender){
        var t = n.getOwnerTree(),
            cols = t.columns,
            c = cols[0],
            i, buf, len;

        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        buf = [
             '<tbody class="x-tree-node">',
                '<tr ext:tree-node-id="', n.id ,'" class="x-tree-node-el x-tree-node-leaf ', a.cls, '">',
                    '<td class="x-treegrid-col"',n.isLeaf() ? '': ' colspan="'+cols.length+'"', '>',
                        '<span class="x-tree-node-indent">', this.indentMarkup, "</span>",
                        '<img src="' + this.emptyIcon + '" class="x-tree-ec-icon x-tree-elbow" />',
                        '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " "+a.iconCls : ""), '" unselectable="on" />',
                        '<a hidefocus="on" class="x-tree-node-anchor" href="', a.href ? a.href : '#', '" tabIndex="1" ',
                            a.hrefTarget ? ' target="'+a.hrefTarget+'"' : '', '>',
                        '<span unselectable="on">', (c.tpl ? c.tpl.apply(a) : a[c.dataIndex] || c.text), '</span></a>',
                    '</td>'
        ];
        
        if(n.isLeaf()){
	        for(i = 1, len = cols.length; i < len; i++){
	            c = cols[i];
	            buf.push(
	                    '<td class="x-treegrid-col ', (c.cls ? c.cls : ''), '">',
	                        '<div unselectable="on" class="x-treegrid-text"', (c.align ? ' style="text-align: ' + c.align + ';"' : ''), '>',
	                            (c.tpl ? c.tpl.apply(a) : a[c.dataIndex]),
	                        '</div>',
	                    '</td>'
	            );
	        }
        }

        buf.push(
            '</tr><tr class="x-tree-node-ct"><td colspan="', cols.length, '">',
            '<table class="x-treegrid-node-ct-table" cellpadding="0" cellspacing="0" style="table-layout: fixed; display: none; width: ', t.innerCt.getWidth() ,'px;"><colgroup>'
        );
        for(i = 0, len = cols.length; i<len; i++) {
            buf.push('<col style="width: ', (cols[i].hidden ? 0 : cols[i].width) ,'px;" />');
        }
        buf.push('</colgroup></table></td></tr></tbody>');

        if(bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()){
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", n.nextSibling.ui.getEl(), buf.join(''));
        }else{
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(''));
        }

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1].firstChild.firstChild;
        var cs = this.elNode.firstChild.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        this.anchor = cs[3];
        this.textNode = cs[3].firstChild;
    }
});

App.ServiceTreeGrid = Ext.extend(Ext.ux.tree.TreeGrid,{
	
	initComponent:function(){
		this.hiddenPkgs = [];
		this.columns = [{
	        	header:'Наименование',
	        	dataIndex:'text',
	        	sortable:false,
	        	width:this.large ? 700 : 215
	        },{
	        	header:'Цена',
	        	dataIndex:'price',
	        	sortable:false,
	        	hidden: this.hidePrice ? true : false,
	        	width:50,
	        	align:'right'
	        }/*,{
	        	header:'Время вып-я',
	        	dataIndex:'exec_time',
	        	sortable:false,
//	        	hidden:true,
	        	width:50,
	        	align:'left'
	        }*/];
		config = {
			border:false,
		    rootVisible: false,
		    header: false,
	        animCollapse:false,
	        animate: false,
//	        containerScroll: false,
	        autoScroll: true,
	        rootVisible: false,
	        loader:new Ext.ux.tree.TreeGridLoader({
				baseParams:this.baseParams ? this.baseParams : 
				{
					payment_type:'н'
				},
			    createNode : function(attr) {
			        if (!attr.uiProvider) {
			            attr.uiProvider = App.ux.tree.ColspanNodeUI;
			        }
			        return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
			    },
	        	dataUrl:'/webapp/service_tree/',
	        	requestMethod:'GET',
	        	listeners:{
	        		load: function(){
	        		},
	        		scope:this
	        	}
	        }),
	        enableSort: false,
	        columns:this.columns,
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
		        width: this.searchFieldWidth || 250,
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
		    }),{
		    	hidden:!this.wideActions,
		    	text:'Сбросить кэш',
		    	handler:function(){
		    		
		    	}
		    },{
		    	xtype:'datefield',
		    	hidden:!this.wideActions,
		    	listeners:{
		    		select:function(df){
		    			
		    		}
		    	}
		    },'->',{
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