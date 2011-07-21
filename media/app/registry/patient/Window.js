Ext.ns('App');

App.PatientWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.insGrid = new App.insurance.PolicyGrid({
			record:this.instance
		});
		
		this.discountsStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:'/api/v1/dashboard/discount',
				method:'GET'
			}),
			baseParams: {
				//pid:this.patientId
			},
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','title','value','name']
		});
		this.discountsStore.load();
		this.discounts = new Ext.form.LazyClearableComboBox({
        	fieldLabel:'Скидка',
			anchor:'98%',
        	name:'discount',
        	proxyUrl:get_api_url('discount')
		});
		
		this.form = new Ext.form.FormPanel({
			defaults:{
				border:false
			},
			
			items:[{
				layout:'column',
				defaults:{
					border:false
				},
				bodyStyle:'padding:5px',
				items:[{
					columnWidth:.5,
					layout:'form',
					items:[{
						xtype:'textfield',
						name:'last_name',
                    	fieldLabel: 'Фамилия',
                    	allowBlank:false
					},{
						xtype:'textfield',
						name:'first_name',
                    	fieldLabel: 'Имя',
                    	allowBlank:false
					},{
						xtype:'textfield',
						name:'mid_name',
                    	fieldLabel: 'Отчество',
                    	value:''
					},{
						xtype:'textfield',
						name:'home_address_street',
                    	fieldLabel: 'Адрес',
                    	value:''
					},{
						xtype:'textfield',
						name:'email',
                    	fieldLabel: 'E-mail',
                    	value:''
					},{
						xtype:'numberfield',
						name:'initial_account',
                    	fieldLabel: 'Первоначальная сумма',
                    	value:0
					}]
				},{
					columnWidth:.5,
					layout:'form',
					items:[{
						xtype:'datefield',
						name:'birth_day',
						format:'d.m.Y',
                    	fieldLabel: 'Дата рождения',
                    	allowBlank:false
					},{
						xtype:'textfield',
						name:'mobile_phone',
                    	fieldLabel: 'Телефон',
                    	allowBlank:false,
                    	value:''
					},{
						xtype:'radiogroup',
						fieldLabel: 'Пол',
                    	allowBlank:false,
                    	id:'gender',
						defaults:{
							xtype:'radio'
						},
						items:[{
							boxLabel:'мужской',
							inputValue:'М',
							name:'gender_box'
						},{
							boxLabel:'женский',
							inputValue:'Ж',
							name:'gender_box'
						}]
					},this.discounts,{
						xtype:'textfield',
						name:'doc',
                    	fieldLabel: 'Удостоверение',
                    	value:''
					},{
						xtype:'textfield',
						name:'hid_card',
						fieldLabel:'№ карты',
						value:''
					}]
				}]
			},{
				title:'ДМС',
				height:200,
				plain:false,
				layout:'fit',
				disabled: !this.instance ? true : false,
				defaults:{
					border:false
				},
				items:[this.insGrid]
			}]
		});
		if (this.instance) {
			this.form.getForm().loadRecord(this.instance);
		}
		config = {
			title:'Пациент',
			width:650,
			height:350,
			layout:'fit',
			items:[this.form],
			modal:true,
			border:false,
			buttons:[{
				text:'Сохранить',
				handler:this.onSubmit.createDelegate(this,[])
			},{
				text:'Закрыть',
				handler:this.onCancel.createDelegate(this,[])
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.PatientWindow.superclass.initComponent.apply(this, arguments);
	},
	
	onSubmit: function(){
		var f = this.form.getForm();
		if (f.isValid()){
			if (this.instance){
				f.updateRecord(this.instance);
			} else {
				var s = this.store;
				var Patient = s.recordType;
				var p = new Patient();

				f.items.each(function(item) {
	                var value = item.getValue();
	                name = item.name
	                if ( value.getGroupValue ) {
	                	name = value.name;
	                    value = value.getGroupValue();
	                }
					p.set(name, value);
				});				
				s.add(p);
			}
		} else {
			Ext.MessageBox.alert('Ошибка при заполнении формы','Необходимо заполнить все поля, подчеркнутые красной линией!');
		}
	},
	
	onCancel: function(){
		this.close();
	}
});


Ext.reg('patientwindow', App.PatientWindow);