
Ext.onReady(function(){
    
    Ext.QuickTips.init();

    var items = _.map(apps, function(app){
        return {
            xtype:'button',
            text: app[0],
            scale: 'large',
            handler: function(){
                window.location.href = app[1];
            }
        };
    });

    items.push({
        xtype:'spacer',
        flex:1
    });

    items.push({
        xtype:'button',
        text: 'Выход',
        scale: 'medium',
        handler: function(){
            window.location.href = '/webapp/logout/';
        }
    });



    var p = new Ext.Panel({
        title:'Приложения',
        frame:true,
        height:500,
        layout: {
            type:'vbox',
            padding:'10',
            align:'stretch'
        },
        defaults:{margins:'0 0 5 0'},
        items:items,
        renderTo:"side-box-inner"
    });
    
    var cmb = new Ext.form.ComboBox({
        id:'profile-cmb',
        fieldLabel:'Профиль',
        name:'payment_type',
        store:new Ext.data.ArrayStore({
            fields:['id','title'],
            data: profiles
        }),
        listeners:{
            select: function(c, rec, i){
                var p = rec.data.id;
                window.location.href = '/webapp/setactiveprofile/'+p+'/';
            }
        },
        width:500,
        typeAhead: true,
        triggerAction: 'all',
        valueField:'id',
        displayField:'title',
        mode: 'local',
        forceSelection:true,
        selectOnFocus:false,
        editable:false,
        renderTo:'active-profile-box'
    });
    
    cmb.setValue(active_profile);
    
});