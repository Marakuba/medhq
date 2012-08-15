Ext.ns('App.auth');

App.auth.Form = Ext.extend(Ext.form.FormPanel, {
	
	initComponent: function(){
		
		config = {
			baseCls: 'x-plain',
			padding:10,
			labelWidth: 55,
			defaults:{
				xtype: 'textfield'
			},
			items:[{
				xtype:'hidden',
				name:'next',
				value:next
			},{
				fieldLabel:'Логин',
				name:'username',
				anchor:'99%',
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.getForm().findField('password').focus(true,100);
	                    }
	                },
	                scope:this
	            }
			},{
				inputType:'password',
				fieldLabel:'Пароль',
				name:'password',
				anchor:'99%',
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.onSubmit();
	                    }
	                },
	                scope:this
	            }
			}],
			buttonAlign:'center',
			buttons:[{
				text:'Вход',
				handler:this.onSubmit.createDelegate(this)
			}]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.auth.Form.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.getForm().findField('username').focus(false,150);
		},this);
		
		this.on('actioncomplete', function(form, action){
            if(action.type == 'submit'){
            	var res = action.result;
            	window.location.href = res.redirect_to || '/webapp/cpanel/';
            }
        }, this);

        this.on('actionfailed', function(form, action){
			Ext.Msg.show({
			   title:'Предупреждение',
			   msg: action.result.message,
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.ERROR
			});
		}, this);
	},
	
	onSubmit: function(){
		this.getForm().submit({
			url:'/webapp/auth/',
			waitMsg:'Подождите...'
		})
	}
});

Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	var w = new Ext.Window({
		title:'Авторизация',
		closable:false,
		resizable:false,
		width:300,
		autoHeight:true,
		items:new App.auth.Form({}),
		modal:true
	});
	
	w.show();
});