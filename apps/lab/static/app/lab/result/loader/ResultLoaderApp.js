Ext.ns('App.laboratory');


App.laboratory.ResultLoaderApp = Ext.extend(Ext.Panel, {
    initComponent: function(){

        this.fields = [
                ['start_date','visit__created__gte','Y-m-d 00:00'],
                ['end_date','visit__created__lte','Y-m-d 23:59'],
                ['laboratory','laboratory'],
                ['office','visit__office'],
                ['patient','visit__patient'],
                ['is_completed','is_completed'],
                ['cito','visit__is_cito']
            ];

        this.singleDate = true;

        this.form = new Ext.form.FormPanel({
            border:false,
            baseCls:'x-plain',
            labelWidth:80,
            height:240,
            padding:5,
            layout:'fit',
            items:[new Ext.TabPanel({
                activeItem:0,
                border:true,
//                  baseCls:'x-plain',

                defaults:{
                    border:false,
                    baseCls:'x-plain',
                    autoHeight:true,
                    padding:5
                },
                items:[{
                    title:'По дате',
                    layout:'form',
                    items:[new Ext.form.LazyComboBox({
                        fieldLabel:'Лаборатория',
                        name:'laboratory0',
                        anchor:'100%',
                        valueField:'id',
                        store:new Ext.data.RESTStore({
                            autoLoad : true,
                            apiUrl : App.utils.getApiUrl('state','medstate'),
                            model: ['id','name']
                        }),
                        minChars:2,
                        emptyText:'Выберите лабораторию...',
                        listeners:{
                            select: function(combo, rec,i) {
                            },
                            scope:this
                        }
                    }), new Ext.form.ComboBox({
                        fieldLabel:'Дата',
                        name:'date_type',
                        store:new Ext.data.ArrayStore({
                            fields:['id','title'],
                            data: [
                                [0,'подтверждения'],
                                [1,'выполнения'],
                                [2,'создания']]
                        }),
                        typeAhead: true,
                        triggerAction: 'all',
                        valueField:'id',
                        displayField:'title',
                        mode: 'local',
                        forceSelection:true,
                        selectOnFocus:true,
                        editable:false,
                        anchor:'-2',
                        listeners:{
                            afterrender:function(c){
                                c.setValue(0);
                            }
                        }
                    }), {
                        xtype:'datefield',
                        format:'d.m.Y',
                        name:'start',
                        fieldLabel:'От',
                        value:new Date()
                    }, {
                        xtype:'datefield',
                        format:'d.m.Y',
                        name:'end',
                        fieldLabel:'До',
                        value:new Date()
                    }]
                },{
                    title:'По образцам',
                    layout:'form',
                    labelAlign:'top',
                    items:[new Ext.form.LazyComboBox({
                        fieldLabel:'Лаборатория',
                        name:'laboratory1',
                        anchor:'100%',
                        valueField:'id',
                        store:new Ext.data.RESTStore({
                            autoLoad : true,
                            apiUrl : App.utils.getApiUrl('state','medstate'),
                            model: ['id','name']
                        }),
                        minChars:2,
                        emptyText:'Выберите лабораторию...',
                        listeners:{
                            select: function(combo, rec,i) {
                            },
                            scope:this
                        }
                    }), {
                        xtype:'textarea',
                        fieldLabel:'Номера образцов',
                        anchor:'100%',
                        name:'specimens'
                    }]
                }]
            })],
            buttons:[{
                text:'Загрузить',
                handler:this.doLoad.createDelegate(this)
            },{
                text:'Закрыть',
                handler:function(){
                    WebApp.fireEvent('closeapp','lab-result-loader-app')
                },
                scope:this
            }]
        });

        this.panel = new Ext.Panel({
            region:'center',
            margins:'3 3 3 3',
            autoScroll:true,
            baseCls:'hq-pretty-doc',
            /*tbar:[{
                text:'Печать',
                iconCls:'silk-printer',
                handler:function(){
                    var opts = {
                        printable:1
                    }
                    var url = String.format("/lab/print/register/?{0}", Ext.urlEncode(Ext.apply(opts, this.opts)))
                    window.open(url);
                },
                scope:this
            }],*/
            listeners:{
/*              render: function(p){
                    p.body.on({
                        'click': function(e, t){ // if they tab + enter a link, need to do it old fashioned way
                            e.stopEvent();
                            var type = t.href.split('#')[1];
                            var val = t.text || t.innerText;
                            switch (type) {
                            case 'search':
                                this.centralPanel.gsf.imitate(val);
                                this.centralPanel.mainPanel.setActiveTab(0);
                                break;

                            default:
                                break;
                            }
                        },
                        delegate:'a',
                        scope:this
                    }, this);
                },
                scope:this*/
            }
        });

        config = {
            id:'lab-result-loader-app',
            title:'Загрузка результатов',
            closable:true,
            layout:'border',
            border:false,
            items:[this.panel,{
                region:'east',
                width:300,
                baseCls:'x-plain',
                items:this.form
            }]
        }

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.laboratory.ResultLoaderApp.superclass.initComponent.apply(this, arguments);

        this.panel.on('afterrender', function(){
            this.loadMask = new Ext.LoadMask(this.panel.getEl(), {msg:"Подождите, производится загрузка..."});
        }, this);

    },

    doLoad: function(){
        this.loadMask.show();
        var tab = this.form.items.itemAt(0);
        var index = tab.items.indexOf(tab.getActiveTab());
        var f = this.form.getForm();
        var params;
        if (index==0) {
            params = {
                state_id:f.findField('laboratory0').getValue(),
                start:f.findField('start').getValue(),
                end:f.findField('end').getValue(),
                date_type:f.findField('date_type').getValue()
            }
        } else if (index==1) {
            params = {
                state_id:f.findField('laboratory1').getValue(),
                specimens:f.findField('specimens').getValue()
            }
        }
        Ext.Ajax.request({
            url:'/lab/result_loader/',
            method:'POST',
            success:function(response, opts){
                this.loadMask.hide();
                var obj = Ext.decode(response.responseText);
                if(obj.error) {
                    this.renderError(obj.error);
                } else if(obj.results) {
                    this.renderResults(obj.results);
                } else {
                    this.renderError('Нет данных');
                }
            },
            failure:function(response, opts){
                this.renderError('Ошибка загрузки данных');
            },
            params:params,
            scope:this
        });
//      var f = this.form.getForm();
//      var o = {};
//      Ext.each(this.fields, function(field){
//          var ff = f.findField(field[0]);
//          var v = ff.getValue();
//          if((v!==undefined && v!='') || v===0) {
//              if(v instanceof Date) {
//                  v = v.format(field[2] || 'Y-m-d');
//              }
//              o[field[1]] = v;
//          }
//      }, this);
//      this.opts = o;
//      this.panel.load(String.format("/lab/print/register/?{0}", Ext.urlEncode(o)));
//      var url = String.format("/lab/print/register/?{0}", Ext.urlEncode(o));
//      window.open(url);
    },

    renderError : function(msg){
        this.panel.update(String.format('<h1 style="color:red">{0}</h1>',msg));
    },

    renderResults : function(results){
        var tpl = new Ext.XTemplate(
            '<h1>Результаты</h1>',
            '<table class="hq-pretty-doc">',
            '<tpl for="orders">',
                '<tr>',
                    '<th width="10%" class="name">Пациент</th>',
                    '<td width="60%" class="bold">{patient:this.fullName} </td>',
                    '<th class="name">Заказ</th>',
                    '<td class="">{specimen}</td>',
                    '<th class="name">Дата</th>',
                    '<td nowrap class="">{created:this.date}</td>',
                '</tr>',
                '<tpl for="services">',
                    '<tpl for="tests">',
                        '<tr>',
                            '<td colspan="2" class="">{name}</td><td colspan="4">{value}</td>',
                        '</tr>',
                    '</tpl>',
                '</tpl>',
                '<tr><td colspan="6" class="splitter">&nbsp;</td></tr>',
            '</tpl>',
            '</table>',
        {
                fullName:function(patient){
                    return String.format("{0} {1} {2}", patient.last_name, patient.first_name, patient.mid_name)
                },

                date:function(date) {
                    var d = Date.parseDate(date,'Y-m-d H:i:s');
                    return d.format("d.m.Y H:i")
                }
        });
        this.panel.update(tpl.apply(results));
    }
});


Ext.reg('labresultloaderapp', App.laboratory.ResultLoaderApp);


App.webapp.actions.add('labresultloaderapp', new Ext.Action({
    text: 'Загрузка результатов',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','labresultloaderapp');
    }
}));
