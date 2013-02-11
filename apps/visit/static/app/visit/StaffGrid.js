Ext.ns('App.visit');



App.visit.StaffGrid = Ext.extend(Ext.grid.GridPanel, {

    loadInstant: false,

    initComponent : function() {

        this.store = new Ext.data.ArrayStore({
            fields: ['id',
                     'staff_name',
                     'position',
                     'session-starts',
                     'session_ends',
                     'queue',
                     'has_shift']
        });

        this.columns =  [
            {
                hidden:true,
                width: 30,
                sortable: true,
                dataIndex: 'has_shift'
            },{
                header: "ФИО",
                width: 70,
                sortable: true,
                dataIndex: 'staff_name'
            },{
                header: "Должность",
                width: 40,
                sortable: true,
                dataIndex: 'position'
            },{
                header: "Начало смены",
                width: 30,
                sortable: true,
                dataIndex: 'session-starts',
                renderer: function(val){
                    var date = val.split(' ');
                    return date[1];
                }
//                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            },{
                header: "Конец смены",
                width: 30,
                sortable: true,
                dataIndex: 'session_ends',
                renderer: function(val){
                    var date = val.split(' ');
                    return date[1];
                }
//                renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
            },{
                header: "Очередь",
                width: 10,
                sortable: true,
                dataIndex: 'queue'

            }
        ];

        var config = {
            loadMask : {
                msg : 'Подождите, идет загрузка...'
            },
            layout:'fit',
            border : false,
            store:this.store,
            columns:this.columns,
            sm : new Ext.grid.RowSelectionModel({
                        singleSelect : true
                    }),
            viewConfig : {
                forceFit : true,
                showPreview:true,
                emptyText :this.emptyText,
                enableRowBody:true,
                getRowClass: function(record, index, p, store) {
                    var has_shift = record.get('has_shift');
                    if (!has_shift) {
                        return 'preorder-actual-row-body';
                    }
                    return 'preorder-deactive-row-body';
                }
            }

        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.StaffGrid.superclass.initComponent.apply(this, arguments);

        this.on('afterrender',function(){

        },this);

    },

    getStaffList: function(){
        var params = {};
        params['service'] = this.service;
        params['state'] = this.state;
        App.direct.staff.getWorkedStaff(params,function(res){
            var data = res.data['staffs'];
            this.store.loadData(data);
            this.fireEvent('staffobtained', data);
        },this);
    },

    getSelected: function() {
        return this.getSelectionModel().getSelected();
    }

});

