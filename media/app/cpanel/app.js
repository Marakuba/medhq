
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
			hidden: !permissions['registry'],
			handler: function(){
				window.location.href = '/webapp/registry/';
			}
        },{
            xtype:'button',
            text: 'Лаборатория',
			scale: 'large',
			hidden: !permissions['laboratory'],
			handler: function(){
				window.location.href = '/webapp/laboratory/';
			}
		},{
            xtype:'button',
            text: 'Обследование',
			scale: 'large',
			hidden: !permissions['examination'],
			handler: function(){
				window.location.href = '/webapp/examination/';
			}
		},{
            xtype:'button',
            text: 'Обследование (стар. версия)',
			scale: 'large',
			hidden: !permissions['examination'],
			handler: function(){
				window.location.href = '/webapp/oldexam/';
			}
		},{
            xtype:'button',
            text: 'Администрирование',
			scale: 'large',
			hidden: !permissions['admin'],
			handler: function(){
				window.location.href = '/admin/';
			}
        },{
        	xtype:'spacer',
        	flex:1,
        },{
            xtype:'button',
            text: 'Выход',
			scale: 'medium',
			handler: function(){
				window.location.href = '/webapp/logout/';
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