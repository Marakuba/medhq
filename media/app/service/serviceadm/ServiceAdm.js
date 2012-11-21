Ext.ns('App', 'App.service');

App.service.ServiceAdm = Ext.extend(Ext.Panel,{

    initComponent:function(){


        this.baseServiceStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad: false,
            apiUrl: App.getApiUrl('service','baseservice'),
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


        this.serviceTree = new App.serviceadm.ServiceTree({
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
                scope:this,
                click:this.onServiceClick,
                additem:this.addService,
                'checkchange': function(node, checked){
                    if(checked){
                        node.getUI().addClass('complete');
                    }else{
                        node.getUI().removeClass('complete');
                    }
                }
            }
        });

        this.contentPanel = new Ext.TabPanel({
            // activeTab:0,
            width:800,
            items:[],
            region:'east'
        });

        config = {
            layout:'border',
            title:'Панель управления услугами',
            items:[this.serviceTree,this.contentPanel]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.service.ServiceAdm.superclass.initComponent.apply(this, arguments);
    },

    onServiceClick: function(node){
        if (this.bsForm){
            this.bsForm.closeForm(function(form){
                form.openService(node);
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

    addService: function(node,type){
        var parent = node.attributes.type == 'group' ? node.id :
                node.parentNode && node.parentNode.id || undefined;
        if (parent && parent != 'root') {
            parent = App.getApiUrl('service','baseservice',parent);
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
                openextservice:function(extServForm){
                    this.contentPanel.add(extServForm);
                    if(extServForm.record.data.id){
                        this.contentPanel.setActiveTab(extServForm);
                    }
                    this.doLayout();
                },
                activeme: function(form){
                    this.contentPanel.setActiveTab(form);
                },
                scope: this
            }
        };
        Ext.apply(initConfig, formConfig);
        bsForm = new App.serviceadm.BaseServiceForm(initConfig);
        return bsForm;
    },

    openBSForm: function(bsConfig){
        this.bsForm = this.newBSForm(bsConfig);
        this.contentPanel.add(this.bsForm);
        this.contentPanel.setActiveTab(this.bsForm);
        this.doLayout();
    }

});

Ext.reg('serviceadm', App.service.ServiceAdm);
