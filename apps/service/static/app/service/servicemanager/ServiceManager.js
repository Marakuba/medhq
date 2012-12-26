Ext.ns('App', 'App.service', 'App.servicemanager');

var selectedServices = [];

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
                this.parentNode.expand();
                this.parentNode.appendChild({
                    text: rs.data.short_name,
                    id:rs.data.id,
                    leaf: rs.data.type != 'group',
                    parent: this.parentNode.id,
                    type: rs.data.type,
                    checked: false
                });
                this.parentNode.leaf = false;
                this.serviceTree.doLayout();
            }
        },this);


        this.serviceTree = new App.servicemanager.ServiceTree({
            region:'center',
            width:250,
            searchFieldWidth: 200,
            listeners: {
                scope: this,
                click: this.onServiceClick,
                additem: this.addService,
                checkchange: function(node, checked){
                    this.onNodeChecked(node, checked);
                    // this.serviceTree.doLayout();
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
        if (node.id == 'root') return false;
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
            }
        } else {
            if (this.selectedServices.length){
                this.selectedServiceGrid = this.newSelServGrid();
                this.selectedServiceGrid.loadRecords(this.selectedServices);
                this.contentPanel.insert(0, this.selectedServiceGrid);
                this.contentPanel.setActiveTab(this.selectedServiceGrid);
            }
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
                deselectnode: function(records){
                    if (!records) return false;
                    this.stopNodeCheckedEvent = true;
                    Ext.each(records, function(rec){
                        var n = this.serviceTree.getNodeById(rec.data.id);
                        n.getUI().toggleCheck(false);
                    }, this);
                    this.selectedServiceGrid.removeRecords(records);
                    this.serviceTree.uncheckGroups();
                    this.stopNodeCheckedEvent = false;
                },

                beforedestroy: function(){
                    this.selectedServiceGrid = undefined;
                },

                doaction: function(fn, scopeForm, opt){
                    //Если открыта услуга из списка выделенных,
                    //то сначала закрываем ее
                    if (this.bsForm && this.bsForm.record.id){
                        var id = this.bsForm.record.id;
                        var el = _.find(this.selectedServices, function(serv){
                            return serv[0] == id;
                        });
                        if (el){
                            this.bsForm.closeForm(function(thisForm){
                                thisForm.bsForm.destroy();
                                thisForm.bsForm = undefined;
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

    addService: function(node,type){
        var parent = node.attributes.type == 'group' ? node.id :
                node.parentNode && node.parentNode.id || undefined;
        if (parent && parent != 'root') {
            parent = App.utils.getApiUrl('service','baseservice',parent);
            this.parentNode = node.attributes.type == 'group' ? node : node.parentNode;
        } else {
            parent = '';
            this.parentNode = node;
        }

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
        var nodes = this.serviceTree.getChecked();
        nodes = _.filter(nodes, function(n){
            return n.attributes.type!='group';
        });
        this.selectedServices = _.map(nodes, function(n){
            return [n.attributes.id, n.attributes.code, n.attributes.text];
        });
        if(!this.stopNodeCheckedEvent){
            this.loadSelectedRecords();
        }
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
