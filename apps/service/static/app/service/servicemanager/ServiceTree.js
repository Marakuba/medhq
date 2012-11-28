Ext.ns('App', 'App.servicemanager');

App.servicemanager.ServiceTree = Ext.extend(Ext.tree.TreePanel,{

    initComponent:function(){

        config = {
            root : new Ext.tree.AsyncTreeNode({
                expanded: true,
                text:'Услуги',
                id:'root'
            }),
            loader : new Ext.tree.TreeLoader({
                // nodeParameter:'parent',
                dataUrl: '/service/service_tree/',
                requestMethod:'GET',
                baseAttrs : {
                    singleClickExpand : true,
                    checked : false
                },
                baseParams:this.baseParams ? this.baseParams :
                {
                    all:true
                },
                // processResponse : function(response, node, callback, scope){
                //     var json = response.responseText;
                //     try {
                //         var o = response.responseData || Ext.decode(json);
                //         o = o.objects;
                //         node.beginUpdate();
                //         for(var i = 0, len = o.length; i < len; i++){
                //             var n = this.createNode(o[i]);
                //             if(n){
                //                 node.appendChild(n);
                //             }
                //         }
                //         node.endUpdate();
                //         this.runCallback(callback, scope || node, [node]);
                //     }catch(e){
                //         this.handleFailure(response);
                //     }
                // }
            }),
            rootVisible:true,
            lines:false,
            animCollapse:false,
            animate: false,
            autoScroll: true,
            enableDD:true,
            containerScroll: true,
            header: false,
            requestMethod:'GET',
            border:false,
            contextMenu: new Ext.menu.Menu({
                items: [{
                    id: 'add-group',
                    text: 'Добавить группу',
                    defaultText: 'Добавить группу',
                    editable: true
                },{
                    id: 'add-service',
                    text: 'Добавить услугу',
                    defaultText: 'Добавить услугу',
                    editable: true
                }],
                listeners: {
                    itemclick: function(item) {
                        var n;
                        switch (item.id) {
                            case 'add-group':
                                n = item.parentMenu.contextNode;
                                this.addGroup(n);
                                break;
                            case 'add-service':
                                n = item.parentMenu.contextNode;
                                this.addService(n);
                                break;
                        }
                    },
                    scope:this
                }
            }),
            listeners: {
                contextmenu: function(node, e) {
        //          Register the context node with the menu so that a Menu Item's handler function can access
        //          it via its parentMenu property.
                    node.select();
                    var c = node.getOwnerTree().contextMenu;
                    c.contextNode = node;
                    c.showAt(e.getXY());
                },
                scope:this
            },
            scope:this
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.servicemanager.ServiceTree.superclass.initComponent.apply(this, arguments);

        // this.on('dblclick', function(node, e){
        //     if (node.attributes.leaf) {
        //         Ext.callback(this.fn, this.scope || window, [node]);
        //     }
        // }, this);

        // this.getSelectionModel().on('beforeselect', function(sm, node){
        //     return node.isLeaf();
        // });
    },

    addGroup: function(node){
        this.fireEvent('additem',node,'group');
    },

    addService: function(node){
        this.fireEvent('additem',node,'cons');
    },

    /*
     * Shortcut for getting selected node
     */
    getSelected: function(){
        return this.getSelectionModel().getSelectedNode();
    }

});
