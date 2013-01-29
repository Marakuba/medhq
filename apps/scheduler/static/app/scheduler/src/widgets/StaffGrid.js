
Ext.ns('Ext.calendar');
Ext.calendar.StaffGrid = Ext.extend(Ext.grid.GridPanel, {
    initComponent : function() {

        this.proxy = new Ext.data.HttpProxy({
            url: App.utils.getApiUrl('staff','possched')
        });

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, [
            {name: 'id'},
            {name: 'name'},
            {name: 'title'},
            {name: 'department'}
        ]);

        this.store = new Ext.data.Store({
            autoLoad:false,
            baseParams: {
                format:'json',
                'doctor__isnull':false,
                'is_active': true,
                'staff__status':'д'
            },
            paramNames: {
                start : 'offset',
                limit : 'limit',
                sort : 'sort',
                dir : 'dir'
            },
            restful: true,
            proxy: this.proxy,
            reader: this.reader
        });

        this.columns =  [{
            header: "Врачи",
            width: 80,
            sortable: false,
            dataIndex: 'name'
        },{
            header: " Должность",
            width: 75,
            sortable: false,
            dataIndex: 'title'
        }];

        this.store.on('load',function(){
            this.getSelectionModel().selectFirstRow(0);
        },this);

        this.on('afterrender',function(){
            if (this.doctorMode){
                this.store.setBaseParam('id', WebApp.active_profile);
            }
            this.store.load();
        });

        this.departmentStore = new Ext.data.RESTStore({
            autoLoad : true,
            apiUrl : App.utils.getApiUrl('state','department'),
            model: [
                    {name: 'resource_uri'},
                    {name: 'name'},
                    {name: 'title'},
                    {name: 'id'}
                ]
        });

        this.departmentCB = new Ext.form.ClearableComboBox({
            fieldLabel:'Отдел',
            width:170,
            forceSelection:true,
            store:this.departmentStore,
            triggerAction:'all',
            displayField: 'title',
            queryParam:'name__istartswith',
            listeners:{
                'select':function(combo,record,index){
                    if (record) {
                        this.store.filter('department',record.data.resource_uri);
                    } else {
                        this.store.clearFilter();
                    }
                },
                'clearclick': function() {
                    this.store.clearFilter();
                },
                scope:this
            }
        });

        var config = {
            //title:'Врачи',
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            stripeRows:true,
            border : false,
            store:this.store,
            columns:this.columns,
            tbar: [this.departmentCB],
            view : new Ext.grid.GridView({
                forceFit : false
            })
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.calendar.StaffGrid.superclass.initComponent.apply(this, arguments);

    }

});


/*    Ext.override(Ext.Panel, {
        syncHeight : function(){
        if(!(this.autoHeight || this.duringLayout)){
            var last = this.lastSize;
            if(last && !Ext.isEmpty(last.height)){
            var old = last.height, h = this.el.getHeight();
            if(old != 'auto' && old != h){
                var bd = this.body, bdh = bd.getHeight();
                h = Math.max(bdh + old - h, 0);
                if(bdh != h){
                bd.setHeight(h);
                var sz = bd.getSize();
                this.fireEvent('bodyresize', sz.width, sz.height);
                }
            }
            }
        }
        }
    });*/

Ext.reg('staffgrid', Ext.calendar.StaffGrid);
