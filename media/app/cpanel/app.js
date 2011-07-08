
Ext.onReady(function(){
	
	Ext.QuickTips.init();


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
        items:[{
            xtype:'button',
            text: 'Регистратура',
			scale: 'large',
			handler: function(){
				window.location.href = '/webapp/registry/';
			}
        },{
            xtype:'button',
            text: 'Лаборатория',
			scale: 'large',
			handler: function(){
				window.location.href = '/webapp/laboratory/';
			}
		},{
            xtype:'button',
            text: 'Обследование',
			scale: 'large',
			handler: function(){
				window.location.href = '/webapp/examination/';
			}
		},{
            xtype:'button',
            text: 'Календарь',
			scale: 'large',
			handler: function(){
				window.location.href = '/webapp/calendar/';
			}
        },{
            xtype:'button',
            text: 'Администрирование',
			scale: 'large',
			handler: function(){
				window.location.href = '/admin/';
			}
        }],
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
		width:300,
		typeAhead: true,
		triggerAction: 'all',
		valueField:'id',
		displayField:'title',
		mode: 'local',
		forceSelection:true,
		selectOnFocus:true,
		editable:false,
		renderTo:'active-profile-box'
    });
	
	cmb.setValue(active_profile);
	
});