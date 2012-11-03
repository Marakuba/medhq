Ext.ns('App.sampling');

App.sampling.TubeTree = Ext.extend(Ext.tree.TreePanel,{

	initComponent: function(){

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('sampling')
		});

		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'visit', allowBlank:false},
		    {name: 'laboratory', allowBlank:false},
		    {name: 'tube', allowBlank:false},
		    {name: 'tube_count', allowBlank:true}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});

		this.store = new Ext.data.Store({
			autoLoad:true,
			autoSave:false,
		    baseParams: {
		    	format:'json',
		    	visit:this.visitId
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    listeners: {
		    	write: function(store,action,result,res,rs){
		    		this.reloadTree();
		    		if(action=='destroy'){
		    			this.fireEvent('tubedelete');
		    		}
		    	},
		    	scope:this
		    }
		});

		config = {
	        id:'tube-tree',
	        region:'west',
	        title:'Пробирки',
	        split:true,
	        width:300,
	        minSize: 175,
	        maxSize: 400,
	        collapsible: true,
	        margins:'0 0 5 5',
	        cmargins:'0 5 5 5',
	        rootVisible:false,
	        lines:false,
	        autoScroll:true,
	        enableDrop:true,
	        ddGroup:'GridDDGroup',
	        root: new Ext.tree.AsyncTreeNode('Лаборатории'),
	        dataUrl:'/webapp/sampling_tree/'+this.visitId+'/',
	        collapseFirst:false,
	        tbar: [{
	            iconCls:'silk-add',
	            //text:'Добавить',
	            handler: this.showWindow,
	            scope: this
	        },{
	            id:'delete',
	            iconCls:'silk-delete',
	            //text:'Удалить',
	            disabled:true,
	            handler: function(){
	                var s = this.getSelectionModel().getSelectedNode();
	                if(s){
	                	Ext.MessageBox.confirm('Подтверждение','Удалить пробирку?', function(){
	                		this.deleteTube(s.id);
	                	}, this);
	                }
	            },
	            scope: this
	        },'->','Количество',{
	        	id:'tube_count',
	        	xtype:'textfield',
	        	width:40
	        }, {
	        	text:'Изменить',
	        	handler:this.changeCount.createDelegate(this)
	        }]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.sampling.TubeTree.superclass.initComponent.apply(this, arguments);

		this.on('contextmenu', this.onContextMenu, this);

		this.getSelectionModel().on({
	        'beforeselect' : function(sm, node){
	             return node.isLeaf();
	        },
	        'selectionchange' : function(sm, node){
	            if(node){
	                this.fireEvent('tubeselect', node.attributes);
	            }
	            this.getTopToolbar().items.get('delete').setDisabled(!node);
	            var node_rec = this.store.getById(node.id);
	            this.getTopToolbar().items.get('tube_count').setValue(node_rec.data.tube_count);

	        },
	        scope:this
	    });

	},

	changeCount: function(){
		var node = this.getSelectionModel().getSelectedNode();
		var rec = this.store.getById(node.id);
		var c = this.getTopToolbar().items.get('tube_count').getValue();
		if (c) {
			rec.beginEdit();
			rec.set('tube_count',c);
			rec.endEdit();
			this.store.save();
		}
	},

	showWindow: function(){
		var win = new App.sampling.TubeWindow({

		});
		win.on('tubesubmit', this.onTubeSubmit, this);
		win.show();
	},

	deleteTube: function(id){
		var s = this.store;
		var tube = s.getById(id);
		console.log(tube);
		s.remove(tube);
		s.save();
		this.fireEvent('tubedelete');
	},

	onTubeSubmit: function(values) {
		var s = this.store;
		var Sampling = s.recordType;
		Ext.apply(values,{
			visit:'/api/v1/dashboard/visit/'+this.visitId
		});
		console.log(values);
		var new_sampling = new Sampling(values);
		s.add(new_sampling);
		s.save();
	},

	reloadTree: function() {
		this.getLoader().load(this.getRootNode());
	},

    onContextMenu : function(node, e){
        if(!this.menu){ // create context menu on first right click
            this.menu = new Ext.menu.Menu({
                id:'feeds-ctx',
                items: [{
                    id:'load',
                    iconCls:'load-icon',
                    text:'Load Feed',
                    scope: this,
                    handler:function(){
                        this.ctxNode.select();
                    }
                },{
                    text:'Remove',
                    iconCls:'delete-icon',
                    scope: this,
                    handler:function(){
                        this.ctxNode.ui.removeClass('x-node-ctx');
                        this.removeFeed(this.ctxNode.attributes.url);
                        this.ctxNode = null;
                    }
                },'-',{
                    iconCls:'add-feed',
                    text:'Add Feed',
                    handler: this.showWindow,
                    scope: this
                }]
            });
            this.menu.on('hide', this.onContextHide, this);
        }
        if(this.ctxNode){
            this.ctxNode.ui.removeClass('x-node-ctx');
            this.ctxNode = null;
        }
        if(node.isLeaf()){
            this.ctxNode = node;
            this.ctxNode.ui.addClass('x-node-ctx');
            this.menu.items.get('load').setDisabled(node.isSelected());
            this.menu.showAt(e.getXY());
        }
    },

    onContextHide : function(){
        if(this.ctxNode){
            this.ctxNode.ui.removeClass('x-node-ctx');
            this.ctxNode = null;
        }
    },

    afterRender : function(){
        App.sampling.TubeTree.superclass.afterRender.call(this);
        this.el.on('contextmenu', function(e){
            e.preventDefault();
        });
    }
});
