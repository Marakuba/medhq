Ext.ns('App.patient');

App.patient.PatientForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){

		this.inlines = new Ext.util.MixedCollection({});

		this.insPolicy = new App.insurance.PolicyGrid({
			record:this.record,
			listeners:{
				scope:this,
				exception:function(){
					this.fireEvent('exception')
				}
			}
		});

		this.contractGrid = new App.patient.ContractGrid({
			record:this.record,
			listeners:{
				scope:this,
				exception:function(){
					this.fireEvent('exception')
				}
			}
		});

//		this.idCard = new App.patient.IDCardForm({
//			record:this.record
//		});
//
//		this.notifyForm = new App.patient.NotifyForm({
//			record:this.record
//		});

		this.inlines.add('inspolicy', this.insPolicy);
//		this.inlines.add('idcard', this.idCard);
		this.inlines.add('contracts', this.contractGrid);

		this.cl_acc_grid = new App.patient.ClientAccountGrid({
			clientHidden : true	,
			record:this.record
		});

		this.cl_acc_grid.on('newitem', function(){
			this.newAccount();
		},this)

		this.cl_acc_backend = App.getBackend('clientaccount');

		this.acc_store = new Ext.data.Store({
			autoLoad:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: new Ext.data.HttpProxy({
			    url: App.getApiUrl('account')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, [
    		    {name: 'id'},
    		    {name: 'resource_uri'},
                {name: 'amount', allowBlank: true}
			]),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		this.fireEvent('exception')
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		//App.eventManager.fireEvent('accountcreate', rs);
		    			this.onAccountCreate(rs);
		    		}
		    	},
		    	scope:this
		    }
		});

		this.bottom = new Ext.TabPanel({
			activeTab:0,
			height:200,
			plain:false,

			defaults:{
				border:false
			},
			items:[{
				title:'Удостоверение личности',
				layout:'form',
				padding:5,
				items:[{
					xtype:'textfield',
					fieldLabel:'Законный представитель',
					name:'guardian',
					anchor:'99%'
				},{
					xtype:'compositefield',
					items:[{
						xtype:'textfield',
						name:'id_card_series',
						width:50,
						maxLength:6,
		            	fieldLabel: 'Серия',
		            	allowBlank:true,
		            	autoCreate: {tag: 'input', type: 'text', size: '6', autocomplete: 'off', maxlength: '6'},
		            	value: ''
					},{
						xtype:'textfield',
						name:'id_card_number',
						maxLength:10,
						width:78,
		            	fieldLabel: 'Номер',
		            	value: '',
		            	autoCreate: {tag: 'input', type: 'text', size: '10', autocomplete: 'off', maxlength: '10'},
		            	allowBlank:true
					}]
				},{
					xtype:'datefield',
					name:'id_card_issue_date',
					format:'d.m.Y',
					plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
					minValue:new Date(1901,1,1),
	            	fieldLabel: 'Дата выдачи',
	            	allowBlank:true
				},{
					xtype:'textarea',
					name:'id_card_org',
					maxLength:200,
	            	fieldLabel: 'Кем выдан',
	            	value: '',
	            	autoCreate: {tag: 'textarea', type: 'text', size: '200', autocomplete: 'off', maxlength: '200'},
	            	width:305
				}]
			},{
				title:'ДМС',
				layout:'fit',
				items:[this.insPolicy]
			},
			this.cl_acc_grid,
			this.contractGrid,
			{
				title:'Уведомления',
				layout:'form',
				padding:5,
				items:[new Ext.form.ComboBox({
					fieldLabel:'Предварительная запись',
					name:'preorder_notify',
					store:new Ext.data.ArrayStore({
						fields:['id','title'],
						data: [
							['0','Не уведомлять'],
							['1','Уведомлять по SMS'],
							['2','Уведомлять по Email']
						]
					}),
					typeAhead: true,
					triggerAction: 'all',
					valueField:'id',
					displayField:'title',
					mode: 'local',
					forceSelection:true,
					selectOnFocus:true,
					editable:false,
					anchor:'68%',
					value:'0'
				}), new Ext.form.ComboBox({
					fieldLabel:'Направления врачей',
					name:'assignment_notify',
					store:new Ext.data.ArrayStore({
						fields:['id','title'],
						data: [
							['0','Не уведомлять'],
							['1','Уведомлять по SMS'],
							['2','Уведомлять по Email']
						]
					}),
					typeAhead: true,
					triggerAction: 'all',
					valueField:'id',
					displayField:'title',
					mode: 'local',
					forceSelection:true,
					selectOnFocus:true,
					editable:false,
					anchor:'68%',
					value:'0'
				})]
			}

			]
		});

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
					labelWidth:115,
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
                    	fieldLabel: 'Начальная сумма',
                    	value:0
					},new Ext.form.LazyClearableComboBox({
			        	fieldLabel:'Источник рекламы',
			        	width:170,
//						anchor:'80%',
			        	name:'ad_source',
			        	proxyUrl:App.getApiUrl('adsource')
					})]
				},{
					columnWidth:.5,
					layout:'form',
					items:[{
						xtype:'datefield',
						name:'birth_day',
						format:'d.m.Y',
						plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
						minValue:new Date(1901,1,1),
                    	fieldLabel: 'Дата рождения',
                    	allowBlank:false
					},{
						xtype:'textfield',
					    name: 'mobile_phone',
					     fieldLabel: 'Телефон',
					     allowBlank:false,
					     value:'',
//						plugins:[new Ext.ux.netbox.InputTextMask('(999)999-99-99')],
					     maxLength: 15, // for validation
					     autoCreate: {tag: 'input', type: 'text', size: '20', autocomplete:
						'off', maxlength: '15',value:''}
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
						anchor:'80%',
			        	name:'discount',
			        	proxyUrl:App.getApiUrl('discount')
					}),{
						xtype:'textfield',
						name:'doc',
                    	fieldLabel: 'Удостоверение',
                    	value:''
					},{
						xtype:'textfield',
						name:'hid_card',
						fieldLabel:'№ карты',
						stripCharsRe:new RegExp('[\;\?]'),
						value:''
					}]
				}]
			}, this.bottom]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientForm.superclass.initComponent.apply(this, arguments);

		this.contractGrid.store.on('write', this.popStep, this);
		this.insPolicy.store.on('write', this.popStep, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
				this.inlines.each(function(inline,i,l){
					if (inline.setPatientRecord){
						inline.setPatientRecord(this.record)
					}
				});
			};
		},this);
	},

	popStep: function(){
		this.fireEvent('popstep');
	},

	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				Ext.MessageBox.alert('Ошибка','нет модели');
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
	},

	setAcceptedTime: function(){
		var acceptedField = this.getForm().findField('accepted');
		var today = new Date();
		acceptedField.setValue(today);
		this.fireEvent('accepted');
	}

});


Ext.reg('patientform', App.patient.PatientForm);
