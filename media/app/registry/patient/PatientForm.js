Ext.ns('App.patient');

App.patient.PatientForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.inlines = new Ext.util.MixedCollection({});
		
		this.insPolicy = new App.insurance.PolicyGrid({
			record:this.record
		});
		
		this.inlines.add('inspolicy', this.insPolicy);
		
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
			    url: get_api_url('account')
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
		    		console.log('Account Grid Exception!');
		    		console.log(proxy);
		    		console.log(type);
		    		console.log(action);
		    		console.log(options);
		    		console.log(response);
		    		console.log(arg);
		    	},
		    	write:function(store, action, result, res, rs){
		    		console.log('Account created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
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
				title:'ДМС',
				layout:'fit',
				items:[this.insPolicy]
			},this.cl_acc_grid
			
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
						anchor:'80%',
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
						stripCharsRe:new RegExp('[\;\?]'),
						value:''
					}]
				}]
			},this.bottom]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientForm.superclass.initComponent.apply(this, arguments);
		
		this.insPolicy.store.on('write', this.policyStoreWrite, this);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		},this);
	},
	
	policyStoreWrite: function(){
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
	}

});


Ext.reg('patientform', App.patient.PatientForm);