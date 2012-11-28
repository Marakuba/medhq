Ext.ns('App', 'App.service', 'App.servicemanager');

App.service.ServiceManager = Ext.extend(Ext.Panel,{

    initComponent:function(){

        this.selectedServices = [];

        this.baseServiceStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad: false,
            apiUrl: App.utils.getApiUrl('service','baseservice'),
            model: App.models.BaseService,
            baseParams: {
                format:'json'
            }
        });

        this.baseServiceStore.on('write', function(store, action, result, res, rs){
            if (action == 'create') {
                this.parentNode.appendChild({
                    text: rs.data.name,
                    id:rs.data.id,
                    leaf: rs.data.type != 'group',
                    parent:this.parentNode.id,
                    type: rs.data.type,
                    checked: false
                });
                this.parentNode.leaf = false;
                this.parentNode.expand();
                this.serviceTree.doLayout();
            }
        },this);


        this.serviceTree = new App.servicemanager.ServiceTree({
            region:'center',
            dataUrl:'/webapp/service_tree/',
            useArrows: true,
            autoScroll:true,
            width:250,
            searchFieldWidth: 200,
            border: false,
            collapsible:true,
            collapseMode:'mini',
            split:true,
            listeners: {
                scope: this,
                click: this.onServiceClick,
                additem: this.addService,
                checkchange: function(node, checked){
                    this.onNodeChecked(node, checked);
                    this.serviceTree.doLayout();
                    this.loadSelectedRecords();
                }
            },
            scope: this
        });

        this.contentPanel = new Ext.TabPanel({
            activeTab:0,
            width:900,
            split:true,
            items:[],
            region:'east'
        });

        config = {
            layout:'border',
            title:'Панель управления услугами',
            items:[this.serviceTree,this.contentPanel]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.service.ServiceManager.superclass.initComponent.apply(this, arguments);

        this.serviceTree.on('contextmenu', function(node, e) {
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

    onServiceClick: function(node){
        if (this.bsForm){
            this.bsForm.closeForm(function(thisForm){
                thisForm.bsForm.destroy();
                thisForm.bsForm = undefined;
                thisForm.openService(node);
            }, this);
        } else {
            this.openService(node);
        }
    },

    openService: function(node){
        this.baseServiceStore.setBaseParam('id',node.id);
        this.baseServiceStore.load({callback: function(records){
            if (!records.length){
                console.log('Услуга ', node.id, ' не найдена!');
                return;
            }
            var bsConfig = {
                record: records[0],
                title:node.text,
                fn:function(record){
                    node.setText(record.data.name);
                }
            };
            this.openBSForm(bsConfig);
        }, scope:this});
    },

    getParentName: function(node){
        return node.attributes.type == 'group' ? node.text :
                node.parentNode && node.parentNode.text || this.serviceTree.getRootNode().text;
    },

    loadSelectedRecords: function(){
        if (this.selectedServiceGrid){
            if (this.selectedServices.length){
                this.selectedServiceGrid.loadRecords(this.selectedServices);
                this.contentPanel.setActiveTab(this.selectedServiceGrid);
            } else {
                this.selectedServiceGrid.destroy();
                this.selectedServiceGrid = undefined;
            }
        } else {
            this.selectedServiceGrid = this.newSelServGrid();
            this.selectedServiceGrid.loadRecords(this.selectedServices);
            this.contentPanel.insert(0, this.selectedServiceGrid);
            this.contentPanel.setActiveTab(this.selectedServiceGrid);
        }


    },

    newSelServGrid: function(){
        return new App.servicemanager.SelectedServiceGrid({
            title: 'Выделенные услуги',
            listeners: {
                scope: this,
                rowdblclick: function(grid, idx, e){
                    var rec = grid.store.getAt(idx);
                    var n = this.serviceTree.getNodeById(rec.data.id);
                    this.onServiceClick(n);
                },
                deselectnode: function(rec){
                    var n = this.serviceTree.getNodeById(rec.data.id);
                    n.getUI().toggleCheck(false);
                },

                doaction: function(fn, scopeForm){
                    //Если открыта услуга из списка выделенных,
                    //то сначала закрываем ее
                    if (this.bsForm && this.bsForm.record.id){
                        var id = this.bsForm.record.id;
                        var idx = this.findService(this.selectedServices, id);
                        if (idx > -1){
                            this.bsForm.closeForm(function(thisForm){
                                thisForm.bsForm.destroy();
                                thisForm.bsForm = undefined;
                                fn(scopeForm);
                            }, this);
                        } else {
                            fn(scopeForm);
                        }
                    } else {
                        fn(scopeForm);
                    }
                }
            }
        });
    },

    addService: function(node,type){
        var parent = node.attributes.type == 'group' ? node.id :
                node.parentNode && node.parentNode.id || undefined;
        if (parent && parent != 'root') {
            parent = App.utils.getApiUrl('service','baseservice',parent);
        } else {
            parent = '';
        }
        this.parentNode = node.attributes.type == 'group' ? node : node.parentNode;
        var newRecord = new this.baseServiceStore.recordType();
        newRecord.set('parent_uri',parent);
        newRecord.set('type',type);
        var tabTitle = type=='group' ? 'группа' : 'услуга';

        var bsConfig = {
            record: newRecord,
            title:'Новая ' + tabTitle
        };

        if (this.bsForm){
            this.bsForm.closeForm(function(thisForm){
                thisForm.bsForm.destroy();
                thisForm.bsForm = undefined;
                thisForm.baseServiceStore.removeAll(true);
                thisForm.baseServiceStore.add(newRecord);
                thisForm.openBSForm(bsConfig);
            }, this);
        } else {
            this.baseServiceStore.removeAll(true);
            this.baseServiceStore.add(newRecord);
            this.openBSForm(bsConfig);
        }
    },

    newBSForm: function(formConfig){
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
                    this.bsForm = undefined;
                    form.destroy();
                },
                scope: this
            }
        };
        Ext.apply(initConfig, formConfig);
        bsForm = new App.servicemanager.BaseServiceForm(initConfig);
        return bsForm;
    },

    openBSForm: function(bsConfig){
        this.bsForm = this.newBSForm(bsConfig);
        this.contentPanel.add(this.bsForm);
        this.contentPanel.setActiveTab(this.bsForm);
        this.doLayout();
    },

    onNodeChecked: function(node, checked){

        if (node.attributes.type == 'group') {
            node.expand(true, true, function(){
                node.eachChild(function(n){
                    n.getUI().toggleCheck(checked);
                }, this);
            }, this);

        } else {
            var item = [node.attributes.id,node.attributes.text];
            var idx = this.findService(this.selectedServices, item[0]);
            if (checked){
                if (idx < 0){
                    this.selectedServices.push(item);
                }
            } else {
                if (idx > -1){
                    this.selectedServices.splice(idx, 1);
                }
            }

        }
    },

    findService: function(arr, value){
        var idx = -1;
        Ext.each(arr, function(item, i){
            if (item[0] == value) idx = i;
        });
        return idx;
    },

    serviceIsSelected: function(serviceId){
        if (this.selectedServiceGrid){
            return this.selectedServiceGrid.hasService(serviceId);
        } else {
            return false;
        }
    }

});

Ext.reg('servicemanager', App.service.ServiceManager);


App.webapp.actions.add('examordergrid', new Ext.Action({
    text: 'Управление услугами',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','servicemanager');
    }
}));
