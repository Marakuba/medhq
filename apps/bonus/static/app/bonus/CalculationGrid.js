Ext.ns('App.bonus');

App.bonus.CalculationGrid = Ext.extend(Ext.grid.GridPanel, {

    pageSize : 50,

    periodColumnHeader : "Период",

    categoryColumnHeader: "Категория",

    referralsColumnHeader: "Врачи",

    amountColumnHeader: "Сумма",

    addButtonText : 'Добавить',

    removeButtonText : 'Удалить',

    choiceButtonText : 'Выбрать',

    registryButtonText : 'Сводный реестр',

    allCardsPrintButtonText : 'Печать всех карточек',

    title: 'Начисления бонусов',

    initComponent : function() {

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            autoSave : false,
            apiUrl : App.utils.getApiUrl('bonus','calculation'),
            model: [
                {name: 'id'},
                {name: 'resource_uri'},
                {name: 'start_date', allowBlank: false, type:'date', dateFormat:'c'},
                {name: 'end_date', allowBlank: false, type:'date', dateFormat:'c'},
                {name: 'category'},
                {name: 'category_name'},
                {name: 'referral_list'},
                {name: 'amount', type: 'float'},
                {name: 'comment'}
            ]
        });

        this.columns =  [
            {
                header: this.periodColumnHeader,
                width: 45,
                sortable: false,
                dataIndex: 'start_date',
                renderer: function(v, opts, rec){
                    var s = Ext.util.Format.date(rec.data.start_date, 'd.m.y');
                    var e = Ext.util.Format.date(rec.data.end_date, 'd.m.y');
                    return String.format('{0} - {1}', s, e);
                }
            },{
                header: this.categoryColumnHeader,
                width: 45,
                sortable: false,
                dataIndex: 'category_name'
            },{
                header: this.referralsColumnHeader,
                width: 45,
                sortable: false,
                dataIndex: 'referral_list'
            },{
                header: this.amountColumnHeader,
                width: 45,
                sortable: false,
                dataIndex: 'amount'
            }
        ];

        this.addButton = new Ext.Button({
            iconCls:'silk-add',
            text:this.addButtonText,
            handler:this.onAdd.createDelegate(this, []),
            scope:this
        });

        this.removeButton = new Ext.Button({
            iconCls:'silk-delete',
            text:this.removeButtonText,
            handler:this.onRemove.createDelegate(this, []),
            scope:this
        });

        this.choiceButton = new Ext.Button({
            iconCls:'silk-accept',
            text:this.choiceButtonText,
            handler:this.onRegistryPrint.createDelegate(this, []),
            scope:this
        });

        this.registryButton = new Ext.Button({
            iconCls:'silk-printer',
            text:this.registryButtonText,
            handler:this.onRegistryPrint.createDelegate(this, []),
            scope:this
        });

        this.allCardsPrintButton = new Ext.Button({
            iconCls:'silk-printer',
            text:this.allCardsPrintButtonText,
            handler:this.onAllCardsPrint.createDelegate(this, []),
            scope:this
        });

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            border: false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                singleSelect : true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                    },
                    rowdeselect: function(sm, row, rec) {
                    },
                    scope:this
                }
            }),
            tbar:[
                this.addButton,
                this.removeButton,
                '-',
                this.registryButton,
                this.allCardsPrintButton
            ],
            bbar: new Ext.PagingToolbar({
                pageSize: this.pageSize,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Записи {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            viewConfig : {
                forceFit : true,
                enableRowBody:true,
                getRowClass: function(record, index, p, store) {
                    if(record.data.comment) {
                        p.body = String.format('<p class="silk-note result-row-body">{0}</p>', record.data.comment);
                        return 'x-grid3-row-expanded';
                    } else {
                        p.body = "";
                    }
                }
            },
            listeners: {
                rowdblclick:this.onChoice.createDelegate(this, []),
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.bonus.CalculationGrid.superclass.initComponent.apply(this, arguments);

        this.store.on('write', this.onStoreWrite, this);
        this.store.on('exception', this.onStoreExc, this);

        this.on('afterrender', function(){
            this.store.load({
                callback:function(){
                    this.getSelectionModel().selectFirstRow();
                },
                scope:this
            });
        }, this);
    },

    onAdd: function(){
        this.win = new App.bonus.CalculationWindow({
            store: this.store,
            fn: function(record){
                if(record){
                    this.store.add(record);
                    this.store.save();
                }
                this.win.close();
            },
            scope: this
        });
        this.win.show();
    },

    onRemove: function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        Ext.MessageBox.confirm('Подтверждение','Удалить документ?', function(btn){
            if(btn=='yes'){
                this.store.remove(rec);
                this.store.save();
            }
        }, this);
    },

    onRegistryPrint: function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        var url = String.format("/reporting/bonus-registry/print/?calculation={0}", rec.data.id);
        window.open(url);
    },

    onAllCardsPrint: function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        var url = String.format("/bonus/allcards/{0}/", rec.data.id);
        window.open(url);
    },

    onChoice: function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        WebApp.fireEvent('launchapp', 'calculationitemgrid', {
            calculation_id: rec.data.id,
            data: rec.data
        });
    },

    onStoreWrite : function(store, action, result, res, rs){
        if(res.success){
            if(action=='create'){
                this.processCalc(rs);
            }
        }
    },

    onStoreExc: function(){
        console.info(arguments);
    },

    processCalc: function(rec){
        rec.set('amount','<span class="x-loading" style="padding-left:20px;font-style:italic">Подождите, идет расчет....</span>');
        App.direct.bonus.processCalculation(rec.id, function(res, opts){
            console.info(res);
            if(res.success){
                rec.set('amount', res.amount);
            }
        });
    }

});



Ext.reg('calculationgrid', App.bonus.CalculationGrid);


App.webapp.actions.add('calculationgrid', new Ext.Action({
    text: 'Начисления',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','calculationgrid');
    }
}));