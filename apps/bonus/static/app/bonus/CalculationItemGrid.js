Ext.ns('App.bonus');

App.bonus.CalculationItemGrid = Ext.extend(Ext.grid.GridPanel, {

    nameColumnHeader : "Врач",

    orderReferralColumnHeader: "Внешние направления",

    staffReferralColumnHeader: "Собственные услуги",

    assigmentReferralColumnHeader: "Внутренние направления",

    totalColumnHeader: "Общая сумма",

    recalcButtonText : 'Пересчитать',

    registryButtonText : 'Сводный реестр',

    allCardsPrintButtonText : 'Печать всех карточек',

    cardPrintButtonText : 'Карточка врача',

    title: 'Реестр начислений',

    initComponent : function() {

        this.setTitle(String.format('{0} [{1}]', this.title, this.calculation_id));

        this.store = new Ext.data.JsonStore({
            autoLoad: false,
            root: 'rows',
            idProperty: 'referral_id',
            fields: [
                'referral_id',
                'name',
                'qorder__referral',
                'qstaff__staff__referral',
                'qassigment__referral',
                'total'
            ]
        });

        this.calcStore = new Ext.data.RESTStore({
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

        this.calcStore.setBaseParam('id', this.calculation_id);
        this.calcStore.load();


        this.columns =  [
            {
                header: this.nameColumnHeader,
                width: 200,
                sortable: false,
                dataIndex: 'name'
            },{
                header: this.orderReferralColumnHeader,
                width: 30,
                sortable: false,
                hidden: this.data.category!=='в',
                dataIndex: 'qorder__referral'
            },{
                header: this.staffReferralColumnHeader,
                width: 30,
                sortable: false,
                hidden: this.data.category==='в',
                dataIndex: 'qstaff__staff__referral'
            },{
                header: this.assigmentReferralColumnHeader,
                width: 30,
                sortable: false,
                hidden: this.data.category==='в',
                dataIndex: 'qassigment__referral'
            },{
                header: this.totalColumnHeader,
                width: 30,
                sortable: false,
                dataIndex: 'total'
            }
        ];

        this.recalcButton = new Ext.Button({
            // iconCls:'silk-add',
            text:this.recalcButtonText,
            handler:this.onRecalc.createDelegate(this, []),
            scope:this
        });

        this.registryButton = new Ext.Button({
            iconCls:'silk-printer',
            text:this.registryButtonText,
            handler:function(){
                var url = "/reporting/bonus-registry/print/?calculation="+this.calculation_id;
                window.open(url);
            },
            scope:this
        });

        this.allCardsPrintButton = new Ext.Button({
            iconCls:'silk-printer',
            text:this.allCardsPrintButtonText,
            handler:this.onAllCardsPrint.createDelegate(this, []),
            scope:this
        });

        this.cardPrintButton = new Ext.Button({
            iconCls:'silk-printer',
            text:this.cardPrintButtonText,
            handler:this.onCardPrint.createDelegate(this, []),
            scope:this
        });

        this.bbar_text = new Ext.XTemplate(
            'Период: {[fm.date(values.start_date, "d.m.y")]} - {[fm.date(values.end_date, "d.m.y")]}. ',
            'Категория: {category_name}.'
        ).apply(this.data);

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            closable: true,
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
                this.registryButton,
                this.allCardsPrintButton,
                this.cardPrintButton
            ],
            bbar:[
                this.bbar_text,
                'Комментарий:',
                new Ext.form.TextField({
                    width:600,
                    value:this.data.comment,
                    listeners:{
                        blur:function(f){
                            var rec = this.calcStore.getById(this.calculation_id);
                            rec.set('comment', f.getValue());
                            this.calcStore.save();
                        },
                        scope:this
                    }
                })
            ],
            viewConfig : {
                forceFit : true
            },
            listeners: {
                rowdblclick:this.onChoice.createDelegate(this, []),
                scope:this
            }
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.bonus.CalculationItemGrid.superclass.initComponent.apply(this, arguments);

        this.on('afterrender', function(){
            App.direct.bonus.getCategoryResult(this.calculation_id, function(res, opts){
                this.store.loadData(res);
            }, this);
        }, this);
    },

    onAllCardsPrint: function(){
        var url = String.format("/bonus/allcards/{0}/", this.calculation_id);
        window.open(url);
    },

    onCardPrint: function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        var url = String.format("/bonus/card/{0}/{1}/", this.calculation_id, rec.data.referral_id);
        window.open(url);
    },

    onChoice: function(){

    },

    onRecalc: function(){

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



Ext.reg('calculationitemgrid', App.bonus.CalculationItemGrid);
