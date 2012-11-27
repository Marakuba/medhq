Ext.ns('App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.CardApp = Ext.extend(Ext.Panel, {
    initComponent : function() {
        /*
         *Данный компонент является менеджером карт осмотра
         *На входе он получает следующие параметры:
         *baseServiceId - для поиска шаблона по услуге
         *patientId - для открытия карты осмотра, для создания направлений
         *patient_name - для отображении в заголовке
         *orderId - для поиска уже созданных карт осмотра для текущего заказа - для их редактирования
         *cardId - если карта редактируется
         *
         *Если передан cardId, то эта карта ищется в store, оттуда берется поле data и передается в
         *редактор.
         *Если данные изменились, редактор шлет событие с измененными данными - полем data
         *Менеджер заносит это поле в редактируемую запись карты осмотра и сохраняет store.
         *
         *  Если cardId не передан, то вызывается cardStartPanel, которая определяет источник данных,
         *  которые будут редактироваться.
         *
        */

        this.tplStore = new Ext.data.RESTStore({
            autoSave: false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('examination','examtemplate'),
            baseParams:{
                format:'json',
                deleted:false
            },
            model: App.models.Template
        });

        this.cardStore = new Ext.data.RESTStore({
            autoSave : false,
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('examination','card'),
            baseParams:{
                format:'json',
                deleted:false
            },
            model: App.models.Card
        });

        this.saveTask = {
            run : function(){
                console.info('trying to save store...');
                this.cardStore.save();
            },
            interval : 5000,
            scope : this
        };

        this.cardStore.on('write',function(store, action, result, res, rs){
            if (action == 'create'){
                this.cardId = rs.data.id;
                this.openTickets(rs.data.data);
            }
            if (rs.data.deleted){
                this.destroy();
            }
            this.setIconClass('');
        },this);

        this.cardStore.on('exception', function(){

            this.setIconClass('silk-error');

            if(!this.isDestroyed){
                (function(){
                    this.cardStore.save();
                }).defer(5000, this);
            } else {
                return;
            }

        }, this);

        this.tplStore.on('write',function(store, action, result, res, rs){
            //карта перемещена в Мои шаблоны
            if (action == 'create' && !rs.data.base_service){
                this.destroy();
            }
        },this);

        this.contentPanel = new Ext.Panel({
            region:'center',
            border:false,
//          margins:'5 5 5 0',
            layout: 'fit',
            defaults:{
                border:false
            },
            items: [
            ]
        });

        this.contentPanel.on('afterrender', function(panel){
            this.mask = new Ext.LoadMask(panel.container, { msg: "Производится загрузка..." });
            this.mask.show();
        },this);

        var config = {
            id:'card-app-'+this.orderId,
            closable:true,
//          title: 'Карта осмотра',
            layout: 'border',
            items: [
//              this.patientPanel,
                this.contentPanel
            ]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.CardApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
            if (this.record){
                this.editCard('card',this.record.data.id)
            }
            else {
                this.startPanel = this.newStartPanel({
                    baseServiceId:this.baseServiceId,
                    orderId:this.orderId,
                    orderRecord:this.orderRecord,
                    patientId:this.patientId
                });
                this.contentPanel.add(this.startPanel);
            }
        },this);


    },


    newStartPanel: function(config){
        var cardConfig = {
            border:false
        };
        Ext.applyIf(config,cardConfig);
        var startPanel = new App.examination.CardStartPanel(config);

        startPanel.on('copy',this.copyFromSource,this);
        startPanel.on('edit',this.editCard,this);
        startPanel.on('empty',this.createEmptyCard,this);
        startPanel.on('loadcomplete', function(panel){
            this.mask.hide();
        }, this);
        return startPanel
    },

    createEmptyCard:function(){
        this.record = new this.cardStore.recordType();
        var emptyData = Ext.encode({'tickets':[]});
        this.record.set('data',emptyData)
        this.record.set('ordered_service',App.utils.getApiUrl('visit','orderedservice',this.orderId));
        this.record.set('name',this.orderRecord.data.service_name);
        this.cardStore.add(this.record);
        this.cardStore.save();
    },

    copyFromSource: function(sourceType,sourceId){
        if (!sourceId){
            this.createEmptyCard();
            return
        } else {
            var store = this[sourceType+'Store']
            store.setBaseParam('id',sourceId);
            store.load({callback:function(records){
                if (!records.length){
                    console.log('Источник не найден: ',sourceType,' ',sourceId);
                    this.createEmptyCard();
                    return
                } else {
                    var source = records[0];
                    this.record = new this.cardStore.recordType();
                    var dataField = Ext.decode(source.data.data);
                    var name = this.orderRecord.data.service_name;
                    Ext.each(dataField.tickets,function(ticket){
                        if (ticket.xtype == 'titleticket'){
                            name = ticket.value
                        }
                    });
                    Ext.applyIf(this.record.data,source.data);
                    delete this.record.data['id'];
                    this.record.set('ordered_service',App.utils.getApiUrl('visit','orderedservice',this.orderId));
                    this.record.set('name',name);
                    this.cardStore.add(this.record);
                    this.cardStore.save();
                    this.openTickets(this.record.data.data)
                }
            },scope:this});
        }
    },

    editCard: function(sourceType,cardId){
        if (sourceType !='card') {
            console.log('На редактирование передана не карта');
            return
        }
        if (!cardId){
            this.createEmptyCard();
            return
        } else {
            this.cardId = cardId
            this.cardStore.setBaseParam('id',cardId);
            this.cardStore.load({callback:function(records){
                if (!records.length){
                    console.log('Карта не найдена: ',cardId);
                    this.createEmptyCard();
                    return
                } else {
                    this.record = records[0];
                    this.openTickets(this.record.data.data)
                }
            },scope:this});
        }
    },

    openTickets: function(data){
        if (data) {
            var decodedData = Ext.decode(data)
        } else {
            var decodedData = {}
        }
        this.mask.hide();
        this.cardBody = new App.examination.CardTicketTab({
            data:decodedData,
            cardId : this.cardId,
            record: this.record,
            patientName: this.patientName,
            orderRecord:this.orderRecord,
            patientId:this.patientId,
            listeners:{
                scope:this,
                dataupdate:this.updateData,
                deletecard:this.deleteCard,
                closecard:function(){this.destroy();},
                movearhcivecard: this.moveToTpl
            }
        });
        this.contentPanel.removeAll(true);
        this.contentPanel.add(this.cardBody);
        this.contentPanel.doLayout();
    },

    updateData: function(data){
        var encodedData = Ext.encode(data);
        this.record.set('data',encodedData);
        if(this.record.dirty){
            this.setIconClass('x-loading');
        }
        this.cardStore.save();
    },

    deleteCard: function(){
        this.record.set('deleted',true);
        this.cardStore.save();
    },

    moveToTpl: function(name){
        var archiveRecord = new this.tplStore.model();
        Ext.applyIf(archiveRecord.data,this.record.data);
        archiveRecord.set('staff',App.utils.getApiUrl('staff','staff',WebApp.active_staff));
        archiveRecord.set('name',name);
        delete archiveRecord.data['base_service']
        delete archiveRecord.data['id'];
        this.tplStore.add(archiveRecord);
        this.tplStore.save();
    }
});


Ext.reg('cardapp', App.examination.CardApp);
