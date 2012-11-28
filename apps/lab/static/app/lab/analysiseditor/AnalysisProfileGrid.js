Ext.ns('App.laboratory');

App.laboratory.AnalysisProfileGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    initComponent : function() {

        this.comboRenderer = function(combo, field){
            return function(value, meta, rec){
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
            };
        };

        this.mm = new Ext.form.LazyClearableComboBox({
            valueField:'resource_uri',
            queryParam : 'name__istartswith',
            store:this.measurementStore,
            minChars:2,
            emptyText:'Выберите профиль...',
            listeners:{
                select: function(combo, rec,i) {
                },
                scope:this
            }
        });

        this.columns =  [{
            header: "Наименование",
            width: 55,
            sortable: false,
            dataIndex: 'name',
            editor:new Ext.form.TextField()
        },{
            header: "Код",
            width: 20,
            sortable: false,
            dataIndex: 'code',
            editor:new Ext.form.TextField()
        },{
            header: "Ед.изм",
            width: 20,
            sortable: false,
            dataIndex: 'measurement',
            editor: this.mm,
            renderer: this.comboRenderer(this.mm, 'measurement_name')
        },{
            header: "Реф.инт.",
            width: 30,
            sortable: false,
            dataIndex: 'ref_range_text'
        },{
            header: "Порядок",
            width: 10,
            sortable: false,
            dataIndex: 'order',
            editor:new Ext.form.NumberField()
        },{
            header: "Скрытый",
            width: 7,
            sortable: false,
            dataIndex: 'hidden',
            editor:new Ext.form.Checkbox(),
            renderer: function(val) {
                flag = val ? 'yes' : 'no';
                return "<img src='"+WebApp.MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>";
            }
        }];

        this.addProfileMenuItem = new Ext.menu.Item({
            text:'Добавить профиль',
            handler: Ext.emptyFn,
            menu:new Ext.menu.Menu()
        });

        this.moveToProfileMenuItem = new Ext.menu.Item({
            text:'Перенести тест в другой профиль',
            handler: Ext.emptyFn,
            menu:new Ext.menu.Menu()
        });

        config = {
            tbar: [{
                iconCls:'silk-add',
                xtype:'splitbutton',
                text:'Добавить тест',
                handler: this.addAnalysis.createDelegate(this),
                menu:new Ext.menu.Menu({
                    items:[this.addProfileMenuItem,{
                        text:'Добавить единицу измерения',
                        handler: this.addMeasurment.createDelegate(this)
                    }]
                })
           },{
                iconCls:'silk-pencil',
                xtype:'splitbutton',
                text:'Изменить реф.интервалы',
                handler: this.changeRefRanges.createDelegate(this),
                menu:[{
                    text:'Изменить маску ввода',
                    handler: this.changeInputList.createDelegate(this)
                },this.moveToProfileMenuItem]
            }/*,'-',{
                text:'Пронумеровать',
                menu:[{
                    text:'1,2,3, ...'
                },{
                    text:'10,20,30, ...'
                },{
                    text:'100,200,300, ...'
                }]
            }*/],
            clicksToEdit:2,
            store:this.analysisStore,
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
            view : new Ext.grid.GridView({
                forceFit : true,
                emptyText: 'Нет записей',
                getRowClass: function(record, index) {
                }
            }),
            listeners:{
                afteredit: function(e) {
                    if(this.baseService){
                        this.store.save();
                    }
                },
                scope:this
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.AnalysisProfileGrid.superclass.initComponent.apply(this, arguments);

        this.baseService = App.utils.getApiUrl('service','baseservice', this.baseServiceId);

        this.profileStore.on('load', function(s, records, opts){
            this.initProfileMenu();
        }, this);

        this.profileStore.on('write', function(store, action, result, res, rs){
            this.initProfileMenu();
        }, this);

        this.measurementStore.on('write', function(store, action, result, res, rs){
            if(action=='create'){
                var rec = this.getSelectionModel().getSelected();
                if(rec) {
                    rec.set('measurement', result[0].resource_uri);
                    if(this.baseService){
                        this.analysisStore.save();
                    }
                }
            }
        }, this);
    },

    initProfileMenu : function(){
        var m = new Ext.menu.Menu();
        var mAll = new Ext.menu.Menu();
        var mp = 'Основной профиль';
        if(this.profiles[mp]===undefined) {
            m.add({
                text:mp
            });
            m.add('-');
        }
        var sep = false;
        this.profileStore.each(function(rec){
            var n = rec.data.name;
            if(!this.profiles[n]) {
                sep = true;
                m.add({
                    text:n,
                    data:rec.data,
                    handler:function(m){
                        this.fireEvent('addprofile', m.data.name, m.data.resource_uri);
                    },
                    scope:this
                });
            }
            if(this.profile!=rec.data.resource_uri){
                mAll.add({
                    text:n,
                    data:rec.data,
                    handler:function(m){
                        this.moveToProfile(m.data.name, m.data.resource_uri);
                    },
                    scope:this
                });
            }
        }, this);
        if(sep){
            m.add('-');
        }
        m.add({
            iconCls:'silk-add',
            text:'Создать новый профиль',
            handler: this.addAnalysisProfile.createDelegate(this)
        });

        if(this.profile!==undefined){
            if(this.profileStore.getCount()){
                mAll.add('-');
            }
            mAll.add({
                text:mp,
                handler:function(){
                    this.moveToProfile(mp, this.profiles[mp]);
                },
                scope:this
            });
        }

        this.addProfileMenuItem.menu = m;
        this.moveToProfileMenuItem.menu = mAll;
        this.getTopToolbar().doLayout();
    },

    setProfileFilter : function(){
        this.store.filterBy(function(rec){
            return rec.data.profile===this.profile;
        }, this);
    },

    addAnalysis : function() {
        this.stopEditing();
        var Model = this.store.recordType;
        var new_model = new Model({
            service:this.baseService,
            profile:this.profile
        });
        this.store.add(new_model);
        if(this.baseService){
            this.store.save();
        }
        this.startEditing(this.store.getCount()-1,0);
    },

    addAnalysisProfile : function(){
        Ext.Msg.prompt('Новый профиль','Введите название профиля', function(btn, text){
            if(btn=='ok'){
                var s = this.profileStore;
                var new_profile = new s.recordType({
                    name:text
                });
                s.add(new_profile);
                s.save();
            }
        }, this);
    },

    addMeasurment : function(){
        Ext.Msg.prompt('Новая единица измерения','Введите название единицы измерения', function(btn, text){
            if(btn=='ok'){
                var s = this.measurementStore;
                var new_mm = new s.recordType({
                    name:text
                });
                s.add(new_mm);
                s.save();
            }
        }, this);
    },

    changeRefRanges : function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        var win = new App.laboratory.RefRangeChangeForm({
            text : rec.data.ref_range_text,
            analysis : rec.data.name,
            fn : function(refRange){
                rec.set('ref_range_text', refRange);
                if(this.baseService){
                    this.analysisStore.save();
                }
                win.close();
            },
            scope : this
        });
        win.show();
    },

    changeInputList : function(){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        var win = new App.laboratory.InputListChangeForm({
            inputList : rec.data.input_list,
            analysis : rec.data.name,
            fn : function(inputList){
                rec.set('input_list', inputList);
                if(this.baseService){
                    this.analysisStore.save();
                }
                win.close();
            },
            scope : this
        });
        win.show();
    },

    moveToProfile : function(title, resource_uri){
        var rec = this.getSelectionModel().getSelected();
        if(!rec) { return; }
        rec.set('profile', resource_uri);
        this.analysisStore.save();
        this.setProfileFilter();
        if(this.profiles[title]===undefined){
            this.fireEvent('addprofile', title, resource_uri, this.analysisStore.getCount()===0);
        }
    }

});