Ext.ns('App.orderedservice');

App.orderedservice.LocalOrderGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent : function() {

        this.origTitle = 'Свои заказы';

        this.store = new Ext.data.RESTStore({
            autoLoad : false,
            apiUrl : App.utils.getApiUrl('visit','laborderedservice'),
            model: [
                {name: 'id'},
                {name: 'resource_uri'},
                {name: 'created'},
                {name: 'barcode'},
                {name: 'laboratory'},
                {name: 'patient_name'},
                {name: 'service_name'},
                {name: 'status'},
                {name: 'message'},
                {name: 'sampling'},
                {name: 'operator_name'},
                {name: 'in_progress', type:'bool'}
            ]
        });

        this.store.setBaseParam('execution_place__remotestate__isnull',true);
        this.store.setBaseParam('service__labservice__isnull',false);

        this.sm = new Ext.grid.CheckboxSelectionModel({
            singleSelect : false,
            listeners:{
                rowselect:function(sm,i,rec) {
                },
                rowdeselect:function(sm,i,rec) {
                },
                scope:this
            }
        });

        this.columns =  [this.sm, {
            header: "Дата",
            width:12,
            sortable: true,
            dataIndex: 'created',
            renderer: Ext.util.Format.dateRenderer('d.m.Y / H:i')
        },{
            header: "Заказ",
            width:10,
            sortable: true,
            dataIndex: 'barcode'
        },{
            header: "Лаборатория",
            width: 15,
            sortable: true,
            dataIndex: 'laboratory'
        },{
            header: "Пациент",
            width: 20,
            sortable: true,
            dataIndex: 'patient_name'
        },{
            header: "Исследование",
            width: 35,
            sortable: true,
            dataIndex: 'service_name'
        },{
            header: "Тара",
            width: 25,
            sortable: true,
            dataIndex: 'sampling'
        },{
            header: "Статус",
            width: 10,
            sortable: true,
            dataIndex: 'status',
            renderer: function(val,opts,rec) {
                var s = rec.data.status;
                switch(s) {
                    case 'т' :
                        return '<div class="x-grid-row-error">Не проведен!</div>';
                        break;
                    case 'з' :
                        return 'Готово';
                        break;
                }
            }
        },{
            header: "Оператор",
            width: 10,
            sortable: true,
            dataIndex: 'operator_name'
        }];

        this.modeBtn = new Ext.CycleButton({
            showText: true,
            prependText: 'Показывать: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'не проведенные',
                filterValue:'т'
            },{
                text:'в работе',
                filterValue:'л'
            },{
                text:'выполненные',
                filterValue:'з'
            }],
            changeHandler:function(btn, item){
                this.storeFilter('status',item.filterValue);
                this.manageBtn(item.filterValue);
            },
            scope:this
        });

        this.toLabBtn = new Ext.Button({
            text:'Провести',
            hidden:true,
            handler:this.onToLab.createDelegate(this),
            scope:this
        })

        var config = {
            closable:false,
            title:this.origTitle,
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            stripeRows:true,
            border : false,
            store:this.store,
            columns:this.columns,
            tbar: [this.modeBtn,this.toLabBtn],
            bbar: new Ext.PagingToolbar({
                pageSize: 100,
                store: this.store,
                displayInfo: true,
                displayMsg: 'Показана запись {0} - {1} из {2}',
                emptyMsg: "Нет записей"
            }),
            view : new Ext.grid.GridView({
                forceFit : true,
                emptyText: 'Нет записей',
                getRowClass : function(record, rowIndex, p, store){
                    var s = record.data.status, cls;
                    switch(s) {
                        case 'т' :
                            cls = 'x-grid-row-warning';
                            break;
                        case 'з' :
                            cls = 'x-grid-row-normal';
                            break;
                    }
                    return cls
                }
            })

        }

        this.on('afterrender',function(){
            if (this.searchValue){
                this.onGlobalSearch(this.searchValue)
            } else {
                this.store.load();
            }
        },this);

        this.on('destroy', function(){
            WebApp.un('globalsearch', this.onGlobalSearch, this);
        },this);

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.orderedservice.LocalOrderGrid.superclass.initComponent.apply(this, arguments);

        WebApp.on('globalsearch', this.onGlobalSearch, this);
    },

    manageBtn : function(s) {
        this.toLabBtn.hide();
        switch(s) {
            case 'т' :
                this.toLabBtn.show();
                this.getTopToolbar().doLayout();
                break;
        }
    },

    onGlobalSearch : function(v) {
        this.changeTitle = v!==undefined;
        this.storeFilter('search', v);
        if(!v){
            this.setTitle(this.origTitle);
        }
    },

    storeFilter : function(field, value){
        if(value===undefined) {
            delete this.store.baseParams[field]
        } else {
            this.store.setBaseParam(field, value);
        }
        this.store.load({
            callback:function(r){
                if(this.changeTitle){
                    this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
                }
            },
            scope:this
        });
    },

    getSelected : function() {
        return this.getSelectionModel().getSelected()
    },


    getSelectedId : function(){
        var records = this.getSelectionModel().getSelections(),
            ids = [];
        Ext.each(records, function(rec) {
            ids.push(rec.id);
        });
        return ids
    },

    onToLab : function() {
        var ids = this.getSelectedId();
        App.direct.visit.toLab(ids,function(result,e){
            this.modeBtn.setActiveItem(0);
        }, this);
    }

});



Ext.reg('localordergrid', App.orderedservice.LocalOrderGrid);
