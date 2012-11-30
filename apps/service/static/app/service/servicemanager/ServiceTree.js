Ext.ns('App', 'App.servicemanager');

App.servicemanager.ServiceTree = Ext.extend(Ext.tree.TreePanel,{

    initComponent:function(){

        this.baseServiceStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad: false,
            apiUrl: App.utils.getApiUrl('service','baseservice'),
            model: App.models.BaseService,
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
            width:300,
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
            id:'service-manager-tree',
            root : new Ext.tree.AsyncTreeNode({
                expanded: true,
                text:'Услуги',
                id:'root'
            }),
            loader : new Ext.tree.TreeLoader({
                dataUrl: '/service/service_tree/',
                requestMethod:'GET',
                preloadChildren: true,
                clearOnLoad: false,
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
                    id: 'add-service',
                    text: 'Добавить услугу',
                    defaultText: 'Добавить услугу',
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
                            case 'add-service':
                                n = item.parentMenu.contextNode;
                                this.addService(n);
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

    onDD: function(e){
        var n = e.dropNode, t = e.target, p = e.point, s = this.baseServiceStore;
        s.load({
            params:{
                id:n.attributes.id
            },
            callback:function(r, opts){
                var rec = r[0];
                if(!rec){ return; }
                if(p=='append'){
                    var uri = t.attributes.id=='root' ? null : App.utils.getApiUrl('service','baseservice',t.attributes.id);
                    rec.set('parent', uri);
                    this.fireEvent('servicemoved', n.attributes.id, uri);
                } else if(p=='above' || p=='below'){
                    App.direct.service.moveNode(n.attributes.id, t.attributes.id, p);
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

    addService: function(node){
        this.fireEvent('additem',node,'cons');
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
