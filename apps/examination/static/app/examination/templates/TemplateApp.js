Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.TemplateApp = Ext.extend(Ext.Panel, {
    initComponent : function() {
        /*
         *Данный компонент является менеджером карт осмотра
         *На входе он получает следующие параметры:
         *tplRecord - запись шаблона для редактирования
         *tplId
         *
         *Если передан tplId, то этот шаблон ищется в store, оттуда берется поле data и передается в
         *редактор.
         *Если данные изменились, редактор шлет событие с измененными данными - полем data
         *Менеджер заносит это поле в редактируемую запись шаблона и сохраняет store.
         *
        */

        this.tplStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('examination','examtemplate'),
            model: App.models.Template,
            baseParams:{
                format:'json',
                staff:WebApp.active_staff,
                deleted:false
            }
        });

        this.tplStore.on('write',function(store, action, result, res, rs){
            if (action == 'create'){
                this.tplId = rs.data.id;
                this.openEditor(rs.data.data);
            }
            if (rs.data.deleted){
                this.destroy();
            }
        },this);

        this.serviceTree = new App.service.ServiceTreeGrid ({
//          layout: 'fit',
            region:'west',
            hidden:!!this.tplId,
            baseParams:{
                payment_type:'н',
                staff : WebApp.active_profile
            },
            hidePrice: true,
            autoScroll:true,
            width:250,
            searchFieldWidth: 200,
            border: false,
            collapsible:true,
            collapseMode:'mini',
            split:true
        });


        this.contentPanel = new Ext.Panel({
            region:'center',
            border:false,
            layout: 'fit',
//          title:this.title ? 'Шаблон '+ this.title : 'Выберите услугу',
            header:false,
            html:this.tplId ? '<div style="padding:40px;"><div class="start-help-text">Подождите, идет открытие шаблона...</div></div>' : '<div style="padding:40px;"><div class="start-help-text">&larr; Выберите услугу</div></div>',
            defaults:{
                border:false
            },
            items: [
            ]
        });

        var config = {
            closable:true,
            title: 'Шаблоны услуг',
            layout: 'border',
            items: [
                this.serviceTree,
                this.contentPanel
            ]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.TemplateApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(form){
            if (this.tplId){
                this.editTpl('tpl',this.tplId);
            }
        });

        this.serviceTree.on('serviceclick',function(attrs){
            this.attrs = attrs;
            this.onServiceClick(this.attrs);
        },this);
    },

    onServiceClick: function(attrs){
        var ids = attrs.id.split('-');
        var id = ids[0];
        this.baseServiceName = attrs.text;

        this.baseServiceId = id;

        this.tplStore.setBaseParam('base_service',id);
        this.tplStore.setBaseParam('staff',WebApp.active_staff);
        this.tplStore.setBaseParam('deleted',false);
        this.tplStore.load({
            callback:function(records,opts,success){
                if (records.length){
                    this.record = records[0];
                    this.openEditor(records[0].data.data);
                } else {
                    this.contentPanel.removeAll(true);
                    this.startPanel = this.newStartPanel({
                        baseServiceId:this.baseServiceId
                    });
                    this.contentPanel.setTitle('Выберите источник шаблона');
                    this.contentPanel.add(this.startPanel);
                    this.contentPanel.doLayout();
                }
            },
            scope:this
        });
    },

    newStartPanel: function(config){
        var tplConfig = {
            border:false
        };
        Ext.applyIf(config,tplConfig);
        var startPanel = new App.examination.TemplateStartPanel(config);

        startPanel.on('copy',this.copyFromSource,this);
        startPanel.on('edit',this.editTpl,this);
        startPanel.on('empty',this.createEmptyTpl,this);
        return startPanel;
    },

    createEmptyTpl:function(){
//      this.serviceTree.collapse();
//      this.serviceTree.hide();
        var emptyData = Ext.encode({'tickets':[]});
        this.record = new this.tplStore.recordType();
        this.record.set('data',emptyData);
        this.record.set('staff',App.utils.getApiUrl('staff','staff',WebApp.active_staff));
        if (this.baseServiceName){
            this.record.set('name',this.baseServiceName);
        }
        this.record.set('base_service',App.utils.getApiUrl('service','baseservice',this.baseServiceId));
        this.tplStore.add(this.record);
        this.tplStore.save();
    },

    copyFromSource: function(sourceType,sourceId){
        if (!sourceId){
            this.createEmptyTpl();
            return;
        } else {
            var store = this[sourceType+'Store'];
            store.baseParams = {
                id:sourceId,
                format:'json'
            };
//          delete store.baseParams['base_service'];
//          delete store.baseParams['staff'];
//          store.setBaseParam('id',sourceId);
            store.load({
                callback:function(records){
                    if (!records.length){
                        console.log('Источник не найден: ',sourceType,' ',sourceId);
                        this.createEmptyTpl();
                        return;
                    } else {
                        this.serviceTree.hide();
                        var source = records[0];
                        this.record = new this.tplStore.recordType();
                        Ext.applyIf(this.record.data,source.data);
                        delete this.record.id;
                        delete this.record.data.id;
                        store.baseParams = {
                            format:'json',
                            staff:WebApp.active_staff,
                            deleted:false
                        };
                        this.record.set('name',this.baseServiceName);
                        this.record.set('staff',App.utils.getApiUrl('staff','staff',WebApp.active_staff));
                        this.record.set('base_service',App.utils.getApiUrl('service','baseservice',this.baseServiceId));
                        this.tplStore.add(this.record);
                        this.tplStore.save();
                        this.openEditor(this.record.data.data);
                    }
                },
                scope:this
            });
        }
    },

    editTpl: function(source,tplId){

        if(source!='tpl'){
            console.log('На редактирование передан не шаблон');
            return;
        }
        if (!tplId){
            this.createEmptyTpl();
            return;
        } else {
            this.serviceTree.hide();
            this.tplId = tplId;
            this.tplStore.setBaseParam('id',tplId);
            this.tplStore.load({callback:function(records){
                if (!records.length){
                    console.log('Шаблон не найден: ',tplId);
                    this.createEmptyTpl();
                    return;
                } else {
                    this.record = records[0];
                    this.openEditor(this.record.data.data);
                }
            },scope:this});
        }
    },

    openEditor: function(data){
        var decodedData;
        decodedData = data ? Ext.decode(data) : {};
        this.tplBody = new App.examination.TplTicketTab({
            data:decodedData,
            sourceType: 'tpl',
            tplId : this.tplId,
            record: this.record,
            tplRecord : this.record,
            fromArchive:!this.record.data.base_service,
            listeners:{
                scope:this,
                dataupdate:this.updateData,
                nameupdate: function(value){
                    this.record.set('name', value);
                    this.setTitle('Шаблон: ' + value);
                    this.tplStore.save();
                    if (this.fn){
                        Ext.callback(this.fn, this.scope || window, []);
                    }
                },
                deletetpl:this.deleteTpl,
                close:function(){this.destroy();},
                movetoarhcive:this.moveToArchive
            }
        });
        this.contentPanel.removeAll(true);
        this.contentPanel.add(this.tplBody);
        this.contentPanel.doLayout();

        var title = 'Шаблон: '+this.record.data.name;
//      this.contentPanel.setTitle(title);
        this.setTitle(title);
    },

    updateData: function(data){
        var encodedData = Ext.encode(data);
        this.record.set('data',encodedData);
        this.tplStore.save();
    },

    deleteTpl: function(){
        this.record.set('deleted', true);
        this.tplStore.save();
    },

    moveToArchive: function(name){
        this.record.set('base_service', '');
//      this.record.set('name',name);
        var count = this.tplStore.save();
        if (count > -1){
            this.destroy();
        }
    }

});


Ext.reg('templateapp', App.examination.TemplateApp);


App.webapp.actions.add('templateapp', new Ext.Action({
    text: 'Шаблоны услуг',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','templateapp');
    }
}));
