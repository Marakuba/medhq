Ext.ns('App');

App.PatientWindow = Ext.extend(Ext.Window, {

	initComponent:function(){

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
                    	fieldLabel: 'Отчество'
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
                    	fieldLabel: 'Телефон'
					},{
						xtype:'radiogroup',
						fieldLabel: 'Пол',
                    	allowBlank:false,
						items:[{
							boxLabel:'мужской',
							inputValue:'М',
							name:'gender'
						},{
							boxLabel:'женский',
							inputValue:'Ж',
							name:'gender'
						}]
					}]
				}]
			},{
				xtype:'tabpanel',
				activeTab:0,
				height:120,
				plain:false,
				defaults:{
					border:false
				},
				items:[{
					title:'Дополнительно',
					layout:'form',
					bodyStyle:'padding:5px',
					items:[{
						xtype:'textfield',
						name:'home_address_street',
                    	fieldLabel: 'Домашний адрес'
					},{
						xtype:'textfield',
						name:'email',
                    	fieldLabel: 'E-mail'
					}]
				},{
					title:'ДМС',
					layout:'form',
					bodyStyle:'padding:5px',
					items:[{
						xtype:'textfield',
						name:'insurance_doc',
                    	fieldLabel: '№ полиса ДМС'
					}]
				}]
			}]
		});
		if (this.instance) {
			this.form.getForm().loadRecord(this.instance);
		}
		config = {
			title:'Пациент',
			width:650,
			height:270,
			layout:'fit',
			items:[this.form],
			modal:true,
			border:false,
			buttons:[{
				text:'Сохранить',
				handler:this.onSubmit.createDelegate(this,[])
			},{
				text:'Отменить',
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
				var p = new Patient(f.getValues());
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