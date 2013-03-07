Ext.ns('App', 'App.productmanager');

App.productmanager.ProductTree = Ext.extend(Ext.tree.TreePanel,{

    initComponent:function(){

        this.itemStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad: false,
            apiUrl: App.utils.getApiUrl('store','product'),
            model: App.models.Product,
            baseParams: {
                format:'json'
            }
        });


        this.treeFilter = new Ext.ux.tree.TreeFilterX(this, {
            // clearBlank: true,
            // autoClear: true
        });

        this.searchField = new Ext.form.TriggerField({
            xtype:'trigger',
            width:270,
            emptyText:'Поиск по названию',
            enableKeyEvents: true,
            triggerClass:'x-form-clear-trigger',
            onTriggerClick:this.onClear.createDelegate(this),
            listeners:{
                keyup: {
                    fn: function(field, e){
                        if(Ext.EventObject.ESC == e.getKey()) {
                            field.onTriggerClick();
                        }
                        else {
                            var val = field.getRawValue();
                            var re = new RegExp('.*' + val + '.*', 'i');
                            this.treeFilter.clear();
                            this.treeFilter.filter(re, 'text');
                        }
                    },
                    buffer: 150,
                    scope: this
                },
                scope: this
            }

        });

        config = {
            id:'product-manager-tree',
            root : new Ext.tree.AsyncTreeNode({
                expanded: true,
                text:'Материалы',
                id:'root'
            }),
            loader : new Ext.tree.TreeLoader({
                nodeParameter:'parent',
                dataUrl: App.utils.getApiUrl('store','producttree'),
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
                },
                preloadChildren: true,
                clearOnLoad: true,
                baseAttrs : {
                    singleClickExpand : true,
                    checked : false
                }
            }),
            useArrows: true,
            autoScroll:true,
            border: false,
            collapsible:true,
            collapseMode:'mini',
            split:true,
            rootVisible:true,
            lines:false,
            animCollapse:false,
            animate: false,
            enableDD:true,
            containerScroll: true,
            header: false,
            requestMethod:'GET',
            contextMenu: new Ext.menu.Menu({
                items: [{
                    id: 'add-group',
                    text: 'Добавить группу',
                    defaultText: 'Добавить группу',
                    editable: true
                },{
                    id: 'add-product',
                    text: 'Добавить материал',
                    defaultText: 'Добавить материал',
                    editable: true
                },'-',{
                    iconCls:'x-icon-collapse-all',
                    text:'Свернуть всё',
                    handler:function(item){
                        item.parentMenu.contextNode.collapse(true);
                    }
                },{
                    iconCls:'x-icon-expand-all',
                    text:'Развернуть всё',
                    handler:function(item){
                        item.parentMenu.contextNode.expand(true);
                    }
                }],
                listeners: {
                    itemclick: function(item) {
                        var n;
                        switch (item.id) {
                            case 'add-group':
                                n = item.parentMenu.contextNode;
                                this.addGroup(n);
                                break;
                            case 'add-product':
                                n = item.parentMenu.contextNode;
                                this.addItem(n);
                                break;
                        }
                    },
                    scope:this
                }
            }),
            tbar:[this.searchField,'->',{
                iconCls:'x-icon-expand-all',
                tooltip: 'Развернуть всё',
                handler: function(){ this.root.expand(true); },
                scope:this
            },'-',{
                iconCls:'x-icon-collapse-all',
                tooltip: 'Свернуть всё',
                handler: function(){ this.root.collapse(true); },
                scope:this
            },'-',{
                iconCls:'x-tbar-loading',
                handler:function(){
                    this.getLoader().load(this.getRootNode());
                    this.getRootNode().expand();
                },
                scope:this
            }],
            listeners: {
                contextmenu: function(node, e) {
        //          Register the context node with the menu so that a Menu Item's handler function can access
        //          it via its parentMenu property.
                    // node.select();
                    // var c = node.getOwnerTree().contextMenu;
                    // c.contextNode = node;
                    // c.showAt(e.getXY());
                },
                beforenodedrop: this.onDD.createDelegate(this),
                scope:this
            },
            scope:this
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.productmanager.ProductTree.superclass.initComponent.apply(this, arguments);

        // this.on('dblclick', function(node, e){
        //     if (node.attributes.leaf) {
        //         Ext.callback(this.fn, this.scope || window, [node]);
        //     }
        // }, this);

        // this.getSelectionModel().on('beforeselect', function(sm, node){
        //     return node.isLeaf();
        // });
    },

    onDD: function(e){
        var n = e.dropNode, t = e.target, p = e.point, s = this.itemStore;
        s.load({
            params:{
                id:n.attributes.id
            },
            callback:function(r, opts){
                var rec = r[0];
                if(!rec){ return; }
                if(p=='append'){
                    var uri = t.attributes.id=='root' ? null : App.utils.getApiUrl('store','product',t.attributes.id);
                    rec.set('parent', uri);
                    this.fireEvent('productmoved', n.attributes.id, uri);
                } else if(p=='above' || p=='below'){
                    App.direct.store.moveNode(n.attributes.id, t.attributes.id, p);
                }
                s.save();
            },
            scope:this
        });
    },

    onClear: function(){
        this.searchField.setValue('');
        this.treeFilter.clear();
    },

    addGroup: function(node){
        this.fireEvent('additem',node,'group');
    },

    addItem: function(node){
        this.fireEvent('additem',node,'leaf');
    },

    /*
     * Shortcut for getting selected node
     */
    getSelected: function(){
        return this.getSelectionModel().getSelectedNode();
    },

    uncheckGroups: function(){
        var nodes = this.getChecked();
        Ext.each(nodes, function(n){
            if (!n.leaf){
                if (!this.hasCheckedChilds(n.childNodes)){
                    n.getUI().toggleCheck(false);
                }
            }
        }, this);
    },

    hasCheckedChilds: function(nodes){
        var hasChecked = false;
        Ext.each(nodes, function(n){
            if (!n.leaf){
                if (this.hasCheckedChilds(n.childNodes)){
                    hasChecked = true;
                }
            } else {
                if (n.attributes.checked){
                    hasChecked = true;
                }
            }
        }, this);
        return hasChecked;
    }

});
