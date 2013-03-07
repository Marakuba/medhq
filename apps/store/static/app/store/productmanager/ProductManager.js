Ext.ns('App', 'App.store', 'App.productmanager');

var selectedItems = [];

App.store.ProductManager = Ext.extend(Ext.Panel,{

    initComponent:function(){

        this.selectedItems = [];

        this.itemStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad: false,
            apiUrl: App.utils.getApiUrl('store','product'),
            model: App.models.Product,
            baseParams: {
                format:'json'
            }
        });

        this.itemStore.on('write', function(store, action, result, res, rs){
            if (action == 'create') {
                this.onItemCreate(rs);
            }
        },this);


        this.itemTree = new App.productmanager.ProductTree({
            region:'center',
            width:250,
            searchFieldWidth: 200,
            listeners: {
                scope: this,
                click: this.onItemClick,
                additem: this.addItem,
                checkchange: function(node, checked){
                    this.onNodeChecked(node, checked);
                    // this.itemTree.doLayout();
                    // this.loadSelectedRecords();
                }
            },
            scope: this
        });

        this.contentPanel = new Ext.TabPanel({
            activeTab:0,
            width:900,
            border:false,
            split:true,
            items:[],
            region:'east'
        });

        config = {
            closable:true,
            layout:'border',
            title:'Панель управления материалами',
            items:[this.itemTree,this.contentPanel]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.store.ProductManager.superclass.initComponent.apply(this, arguments);

        this.itemTree.on('contextmenu', function(node, e) {
            node.select();
            var c = node.getOwnerTree().contextMenu;
            c.contextNode = node;
            var parentName = this.getParentName(node);
            c.items.each(function(item){
                if (item.editable){
                    item.setText(item.defaultText + ' в ' + parentName);
                }
            });
            c.showAt(e.getXY());
        },this);
    },

    onItemClick: function(node){
        if (node.id == 'root') return false;
        if (this.itemForm){
            this.itemForm.closeForm(function(thisForm){
                thisForm.itemForm.destroy();
                thisForm.itemForm = undefined;
                thisForm.openItem(node);
            }, this);
        } else {
            this.openItem(node);
        }
    },

    openItem: function(node){
        this.itemStore.setBaseParam('id',node.id);
        this.itemStore.load({callback: function(records){
            if (!records.length){
                console.log('Материал ', node.id, ' не найден!');
                return;
            }
            var itemConfig = {
                record: records[0],
                title:node.text,
                fn:function(record){
                    node.setText(record.data.name);
                }
            };
            this.openItemForm(itemConfig);
        }, scope:this});
    },

    getParentName: function(node){
        return node.attributes.is_group ? node.text :
                node.parentNode && node.parentNode.text || this.itemTree.getRootNode().text;
    },

    loadSelectedRecords: function(){
        if (this.selectedItemGrid){
            if (this.selectedItems.length){
                this.selectedItemGrid.loadRecords(this.selectedItems);
                this.contentPanel.setActiveTab(this.selectedItemGrid);
            } else {
                this.selectedItemGrid.destroy();
            }
        } else {
            if (this.selectedItems.length){
                this.selectedItemGrid = this.newSelItemGrid();
                this.selectedItemGrid.loadRecords(this.selectedItems);
                this.contentPanel.insert(0, this.selectedItemGrid);
                this.contentPanel.setActiveTab(this.selectedItemGrid);
            }
        }


    },

    newSelItemGrid: function(){
        return new App.productmanager.SelectedItemGrid({
            title: 'Выделенные материалы',
            listeners: {
                scope: this,
                rowdblclick: function(grid, idx, e){
                    var rec = grid.store.getAt(idx);
                    var n = this.itemTree.getNodeById(rec.data.id);
                    this.onItemClick(n);
                },
                deselectnode: function(records){
                    if (!records) return false;
                    this.stopNodeCheckedEvent = true;
                    Ext.each(records, function(rec){
                        var n = this.itemTree.getNodeById(rec.data.id);
                        n.getUI().toggleCheck(false);
                    }, this);
                    this.selectedItemGrid.removeRecords(records);
                    this.itemTree.uncheckGroups();
                    this.stopNodeCheckedEvent = false;
                },

                beforedestroy: function(){
                    this.selectedItemGrid = undefined;
                },

                doaction: function(fn, scopeForm, opt){
                    //Если открыта услуга из списка выделенных,
                    //то сначала закрываем ее
                    if (this.itemForm && this.itemForm.record.id){
                        var id = this.itemForm.record.id;
                        var el = _.find(this.selectedItems, function(item){
                            return item[0] == id;
                        });
                        if (el){
                            this.itemForm.closeForm(function(thisForm){
                                thisForm.itemForm.destroy();
                                thisForm.itemForm = undefined;
                                fn(scopeForm, opt);
                            }, this);
                        } else {
                            fn(scopeForm, opt);
                        }
                    } else {
                        fn(scopeForm, opt);
                    }
                }
            }
        });
    },

    addItem: function(node,type){
        var parent = node.attributes.is_group ? node.id :
                node.parentNode && node.parentNode.id || undefined;
        if (parent && parent != 'root') {
            parent = App.utils.getApiUrl('store','product',parent);
            this.parentNode = node.attributes.is_group ? node : node.parentNode;
        } else {
            parent = '';
            this.parentNode = node;
        }

        var newRecord = new this.itemStore.recordType();
        newRecord.set('parent_uri',parent);
        newRecord.set('is_group',type=='group');
        var tabTitle = type=='group' ? 'группа' : 'материал';

        var itemConfig = {
            record: newRecord,
            title:(type=='group' ? 'Новая ' : 'Новый ') + tabTitle
        };

        if (this.itemForm){
            this.itemForm.closeForm(function(thisForm){
                thisForm.itemForm.destroy();
                thisForm.itemForm = undefined;
                thisForm.itemStore.removeAll(true);
                thisForm.itemStore.add(newRecord);
                thisForm.openItemForm(itemConfig);
            }, this);
        } else {
            this.itemStore.removeAll(true);
            this.itemStore.add(newRecord);
            this.openItemForm(itemConfig);
        }
    },

    newItemForm: function(formConfig){
        var initConfig = {
            scope: this,
            listeners:{
                openform:function(form){
                    this.contentPanel.add(form);
                    this.doLayout();
                },
                activeme: function(form){
                    this.contentPanel.setActiveTab(form);
                },
                closeform: function(form){
                    this.itemForm = undefined;
                    form.destroy();
                },
                scope: this
            }
        };
        Ext.apply(initConfig, formConfig);
        itemForm = new App.productmanager.ProductForm(initConfig);
        return itemForm;
    },

    openItemForm: function(itemConfig){
        this.itemForm = this.newItemForm(itemConfig);
        this.contentPanel.add(this.itemForm);
        this.contentPanel.setActiveTab(this.itemForm);
        this.doLayout();
    },

    onNodeChecked: function(node, checked){
        if(this.stopNodeCheckedEvent) {
            return;
        }

        if (node.attributes.type == 'group') {
            this.stopNodeCheckedEvent = true;
            node.expand(true, false);
            node.cascade(function(n){
                n.getUI().toggleCheck(checked);
            }, this);
            this.stopNodeCheckedEvent = false;

        }
        var nodes = this.itemTree.getChecked();
        nodes = _.filter(nodes, function(n){
            return n.attributes.type!='group';
        });
        this.selectedItems = _.map(nodes, function(n){
            return [n.attributes.id, n.attributes.code, n.attributes.text];
        });
        if(!this.stopNodeCheckedEvent){
            this.loadSelectedRecords();
        }
    },

    itemIsSelected: function(itemId){
        if (this.selectedItemGrid){
            return this.selectedItemGrid.hasItem(itemId);
        } else {
            return false;
        }
    },

    onItemCreate: function(rs){
        this.parentNode.expand();
        this.parentNode.appendChild({
            text: rs.data.name,
            id:rs.data.id,
            leaf: !rs.data.is_group,
            parent: this.parentNode.id,
            checked: false
        });
        this.parentNode.leaf = false;
        this.itemTree.doLayout();
    }

});

Ext.reg('productmanager', App.store.ProductManager);


App.webapp.actions.add('productmanager', new Ext.Action({
    text: 'Управление материалами',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','productmanager');
    }
}));
