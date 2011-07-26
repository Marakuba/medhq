Ext.ns('App.patient');

App.patient.PatientForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.inlines = new Ext.util.MixedCollection({});
		
		this.insPolicy = new App.insurance.PolicyGrid({
			record:this.record
		});
		
		this.insPolicy.store.on('write', function(){
			this.fireEvent('popstep');
		}, this);

		this.inlines.add('inspolicy', this.insPolicy);
		
		config = {
			baseCls:'x-plain',
			border:false,
			defaults: {
				border:false
			},
			items:[{
				layout:'column',
				defaults:{
					baseCls:'x-plain',
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
					},new Ext.form.LazyClearableComboBox({
			        	fieldLabel:'Скидка',
						anchor:'98%',
			        	name:'discount',
			        	proxyUrl:get_api_url('discount')
					}),{
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
				defaults:{
					border:false
				},
				items:[this.insPolicy]
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientForm.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		},this);
	},
	
	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				console.log('Ошибка: нет модели');
			}
		}
		return this.record;
	},
	
	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();
			f.updateRecord(Record);
			if(!Record.phantom) {
				this.inlines.each(function(inline,i,l){
					inline.onSave();
				});
			}
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	getSteps : function() {
		var steps = 0;
		if(this.getForm().isDirty()) {
			steps+=1;
		}
		this.inlines.each(function(inline,i,l){
			var s = inline.getSteps();
			steps+=s;
		});
		return steps
	}

});


Ext.reg('patientform', App.patient.PatientForm);