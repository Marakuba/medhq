Ext.ns('App.visit');

App.visit.StaffWindow = Ext.extend(Ext.Window, {

    initComponent:function(){
        // this.staffStore = new Ext.data.ArrayStore({
        //     fields: ['id', 'staff_name'],
        //     data : this.staffList
        // });
        this.staffGrid = new App.visit.StaffGrid({
            state:this.state,
            service:this.service,
            scope:this,
            listeners: {
                scope: this,
                rowdblclick: this.onSubmit.createDelegate(this,[]),
                staffobtained: this.staffObtained
            }
        });
//        this.staff = new Ext.form.ComboBox({
//            fieldLabel:'Врач',
//            name:'staff',
//            allowBlank:false,
//            store:new Ext.data.ArrayStore({
//                fields: ['id', 'staff_name'],
//                data : this.staffList
//            }),
//            mode:'local',
//            selectOnFocus:true,
//            typeAhead: true,
//            triggerAction: 'all',
//            valueField: 'id',
//            displayField:'staff_name',
//            editable:false
//        });
//        this.staff.setValue(this.staffList[0][0]);
//        this.form = new Ext.form.FormPanel({
//            layout:'form',
//            items: this.staff
//        });

        config = {
            title:'Выберите врача: ' + this.service_name,
            width:700,
            height:400,
            layout:'fit',
            defaults:{
                baseCls:'x-border-layout-ct',
                border:false
            },
            items: this.staffGrid,
            modal:true,
            border:false,
            buttons:[{
                text:'Выбрать',
                handler:this.onSubmit.createDelegate(this,[])
            },{
                text:'Отменить',
                handler:function(){
                    this.fireEvent('declinestaff');
                    this.close();
                },
                scope:this
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.visit.StaffWindow.superclass.initComponent.apply(this, arguments);

        this.addEvents({
            validstaff:true,
            declinestaff:true
        });

    },

    getStaff: function(service, state){
        this.staffGrid.getStaffList(service, state);
        this.show();
    },

    staffObtained: function(staffList){
        if (staffList.length > 0){
            // this.show();
        } else {
            Ext.callback(this.fn, this.scope||window, [undefined]);
        }
    },

    onSubmit: function()
    {
        var staff = this.staffGrid.getSelected();
        Ext.callback(this.fn, this.scope||window, [staff]);

    }
});


App.visit.StaffBox = function() {

    var opts;
    var dlg;

    var getCmb = function() {
        var cmb = new Ext.form.ComboBox({
            fieldLabel:'Врач',
            name:'staff',
            allowBlank:false,
            store:new Ext.data.ArrayStore({
                fields: ['id', 'staff_name'],
                data : opts.staffList
            }),
            mode:'local',
            selectOnFocus:true,
            typeAhead: true,
            triggerAction: 'all',
            valueField: 'id',
            displayField:'staff_name',
            editable:false
        });
        cmb.setValue(opts.staffList[0][0]);
        return cmb;
    };

    return {
        handleButton: function(button) {
            var f = dlg.items.itemAt(0).getForm();
            var field = f.findField('staff');
            var val = field.getValue();
            var rec = field.findRecord(field.valueField, val);
            Ext.callback(opts.fn, opts.scope||window, [button, rec, opts], 1);
            dlg.close();
        },
        getDialog: function(options) {
            this.win = new Ext.Window({
                title:String.format('Выберите врача :: {0}', options.text),
                width:380,
                height:140,
                layout:'fit',
                defaults:{
                    baseCls:'x-border-layout-ct',
                    border:false
                },
                items: new Ext.form.FormPanel({
                    padding:7,
                    layout:'form',
                    items: [getCmb()]
                }),
                modal:true,
                border:false,
                buttons:[{
                    text:'Выбрать',
                    handler:this.handleButton.createDelegate(this,['ok']),
                    scope:this
                },{
                    text:'Отменить',
                    handler:this.handleButton.createDelegate(this,['cancel']),
                    scope:this
                }]
            });
            return this.win;
        },
        show: function(options) {
            opts = options;
            dlg = this.getDialog(opts);
            dlg.show();
        }
    };
}();
