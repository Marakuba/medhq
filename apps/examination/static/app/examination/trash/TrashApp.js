Ext.ns('App.examination');

App.examination.TrashApp = Ext.extend(Ext.Panel, {
    initComponent : function() {

        this.staff = App.utils.getApiUrl('staff','staff', WebApp.active_staff);

        this.mode = 'template';

        this.contentPanel = new Ext.Panel({
            region:'center',
            autoScroll:true,
            border:true,
            layout: 'fit',
            title:'Предпросмотр',
            defaults:{
                border:false
            },
            items: [
            ]
        });

        this.templateBtn = new Ext.Button({
            text:'Шаблоны',
            toggled:true,
            enableToggle:true,
            toggleGroup:'doc-type',
            handler: this.switchPanel.createDelegate(this,['template',1]),
            scope:this
        });

        this.cardBtn = new Ext.Button({
            text:'Карты осмотра',
            enableToggle:true,
            toggleGroup:'doc-type',
            pressed:true,
            handler: this.switchPanel.createDelegate(this,['card',0]),
            scope:this
        });

        this.restoreBtn = new Ext.Button({
            text:'Восстановить',
            disabled:true,
            handler:this.restoreRecord.createDelegate(this),
            scope:this
        });

        this.reloadBtn = new Ext.Button({
            text:'Обновить',
            handler:this.reloadStore.createDelegate(this),
            scope:this
        });

        this.templateGrid = new App.examination.TmpGrid({
            baseParams:{
                deleted:true,
                base_service__isnull:true
            },
            hidden:true,
            emptyTbar:true,
            staff:this.staff,
            border: false,
            split:true,
//          layout:'fit',
            listeners:{
                rowselect:function(record){
                    if (record){
                        this.onPreview(record.data.id);
                        this.restoreBtn.enable();
                    }
                },
                rowdeselect:function(record){
                    this.restoreBtn.disable();
                },
                scope:this
            }
        });

        this.cardGrid = new App.examination.CardGrid({
            baseParams:{
                deleted:true
            },
            staff:this.staff,
//          autoWidth:true,
//          autoHeight:true,
//          layout:'fit',
            border: false,
            split:true,
            emptyTbar:true,
            listeners:{
                rowselect:function(record){
                    if (record){
                        this.onPreview(record.data.id);
                        this.restoreBtn.enable();
                    }
                },
                rowdeselect:function(record){
                    this.restoreBtn.disable();
                },
                scope:this
            }
        });

        this.cardGrid.store.on('load', function(){
            //не устанавливать при загрузке курсор на первую строчку
//          this.getSelectionModel().selectFirstRow();
        }, this);

        this.templateGrid.store.on('load', function(){
            //не устанавливать при загрузке курсор на первую строчку
//          this.getSelectionModel().selectFirstRow();
        }, this);

        this.trashPanel = new Ext.Panel({
            region:'west',
            border:false,
            collapsible:false,
//          collapseMode:'mini',
            width:550,
//          margins:'5 5 5 0',
            layout: 'card',
            activeItem : 0,
            tbar:[this.cardBtn,this.templateBtn,'-',this.restoreBtn, this.reloadBtn],
            defaults:{
                border:false
            },
            items: [ this.cardGrid, this.templateGrid ]
        });

        var config = {
            id:'trash-app',
            closable:true,
            title: 'Корзина',
            layout: 'border',
            items: [ this.trashPanel, this.contentPanel ]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.TrashApp.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){
        },this);
    },

    switchPanel : function(mode, activeItem){
        this.mode = mode;
        this.contentPanel.removeAll();
        var l = this.trashPanel.getLayout();
        l.setActiveItem(activeItem);
        var panel = l.activeItem;
        panel.getSelectionModel().selectFirstRow();
    },

    onPreview: function(id){
        var list = new Ext.Panel({
            autoScroll:true,
            autoLoad:String.format('/widget/examination/{0}/{1}/',this.mode,id)
        });
        this.contentPanel.removeAll();
        this.contentPanel.add(list);
        this.contentPanel.setTitle('Предпросмотр');
        this.contentPanel.doLayout();
        this.doLayout();
    },

    restoreRecord: function(){
        var gridName = this.mode+'Grid'
        var grid = this[gridName];
        var record = grid.getSelectionModel().getSelected();
        if(!record){
            console.log('нет записи');
            return false
        };
        Ext.Msg.confirm('Восстановление','Восстановить запись?',function(btn){
            if (btn=='yes'){
                record.set('deleted',false);
                record.store.load();
                this.contentPanel.removeAll();
                this.restoreBtn.disable();
            }
        },this);
    },

    reloadStore: function(){
        var gridName = this.mode+'Grid'
        var grid = this[gridName];
        this[gridName].store.load();
    }
});

Ext.reg('trashapp', App.examination.TrashApp);

App.webapp.actions.add('trashapp', new Ext.Action({
    text: 'Корзина',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','trashapp');
    }
}));
