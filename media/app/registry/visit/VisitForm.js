Ext.ns('App.visit');

App.visit.VisitForm = Ext.extend(Ext.FormPanel, {
	
	// 
	
	initComponent:function(){

		this.inlines = new Ext.util.MixedCollection({});
		
		this.orderedService = new App.visit.OrderedServiceInlineGrid({
			type:this.type,
			region:'center'
		});
		
		this.orderedService.store.on('write', function(){
			this.fireEvent('popstep');
		}, this);

		this.inlines.add('orderedservice', this.orderedService);

///
		
		this.policyStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:get_api_url('insurance_policy'),
				method:'GET'
			}),
			baseParams: {
				patient:this.patientId
			},
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','number','state_name','start_date','end_date'],
			listeners:{
				load:function(){
					if (this.policyToSet)
					{
						var pc = Ext.getCmp('visit-policy-cmb');
						pc.setValue(this.policyToSet);
						this.policyToSet = undefined;
					}
				},
				scope:this
			}
		});
		this.policy = {
			flex:1,
			layout:'form',
			items:new Ext.form.LazyClearableComboBox({
				id:'visit-policy-cmb',
	        	fieldLabel:'Полис ДМС',
				anchor:'98%',
	        	name:'insurance_policy',
	        	store:this.policyStore,
	        	proxyUrl:get_api_url('insurance_policy'),
			    displayField: 'number',
			    itemSelector: 'div.x-combo-list-item',
			    tpl:new Ext.XTemplate(
			    	'<tpl for="."><div class="x-combo-list-item">',
			    	'№{number}, {state_name}',
			    	'</div></tpl>'
			    )
			})
		};
		this.policyBar = {
			id:'policy-bar',
			layout:'hbox',
			hidden:true,
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[this.policy,{
				//columnWidth:0.20,
				width:30,
				items:{
					xtype:'button',
					//text:'Добавить',
					iconCls:'silk-add',
					handler:function(){
						var win;
						if(!win) {
							win = new App.insurance.PolicyWindow({
								patientRecord:this.patientRecord
							});
							win.on('policyselect', function(uri){
								var pc = Ext.getCmp('visit-policy-cmb');
								this.policyToSet = uri;
								pc.getStore().load();
							},this);
							win.show(this);
						}
					},
					scope:this
				}
			}]			
		};

///
		
		this.discounts = {
			layout:'form',
			items:new Ext.form.LazyClearableComboBox({
				id:'visit-discount-cmb',
	        	fieldLabel:'Скидка',
				anchor:'98%',
	        	name:'discount',
	        	proxyUrl:get_api_url('discount'),
				listeners:{
					select: function(){
						App.eventManager.fireEvent('sumchange');
					},
					scope:this
				}
			})
		};
		if(this.patientRecord) {
			Ext.getCmp('visit-discount-cmb').setValue(this.patientRecord.data.discount);
		}

		this.lab = {
			layout:'form',
			items:new Ext.form.LazyComboBox({
	        	fieldLabel:'Лаборатория',
	        	name:'source_lab',
			    minChars:3,
			    emptyText:'Выберите лабораторию...',
			    proxyUrl:get_api_url('lab')
			})
		};

		this.referral = {
			layout:'form',
			columnWidth:1.0,
			items:new Ext.form.LazyComboBox({
				anchor:'98%',
	        	fieldLabel:'Кто направил',
	        	name:'referral',
	        	proxyUrl:get_api_url('referral')
			})
		};
		
		//this.referral.items.setValue('б/н');
		this.referralBar = {
			layout:'column',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[this.referral, {
				width:31,
				items:{
					xtype:'button',
					iconCls:'silk-add',
					qtip:'Новая организация',
					handler:function(){
						var refWin;
						if(!refWin) {
							refWin = new App.ReferralWindow({});
							refWin.show(this);
						}
					}
				}
			}]			
		};
		
		this.sample = {
            layout: 'form',
            border:false,
			items:{
				fieldLabel:'Проба взята',
				xtype:'compositefield',
				anchor:'95%',
				items:[{
					fieldLabel:'дата',
					xtype:'datefield',
					name:'sampled_date',
					emptyText:'дата'
				},{
					fieldLabel:'время',
					xtype:'timefield',
					format:'H:i',
					increment:15,
					name:'sampled_time',
					emptyText:'время'
				}]
			}
		};
		this.pregnancy = {
            layout: 'form',
            border:false,
            columnWidth:0.33,
            items:[{
				fieldLabel:'Беременность',
				name:'pregnancy_week',
				xtype:'textfield',
    			anchor:'95%',
				emptyText:'кол-во недель'
			}]
		};
		this.menstruation = {
            layout: 'form',
            border:false,
            columnWidth:0.33,
            items:[{
				fieldLabel:'День цикла',
				name:'menses_day',
				xtype:'textfield',
    			anchor:'95%',
				emptyText:'кол-во дней'
			}]
		};
		this.mp = {
            layout: 'form',
            border:false,
            columnWidth:0.34,
            items:[{
				fieldLabel:'Менопауза',
				xtype:'checkbox',
				name:'menopause'
			}]
		};
		this.diagnosis = { 
            layout: 'form',
            border:false,
			items:{
				fieldLabel:'Диагноз',
				name:'diagnosis',
				xtype:'textfield',
        		anchor:'98%'
			}
		};
		this.comment = { 
            layout: 'form',
            border:false,
			items:{
				fieldLabel:'Комментарий',
				name:'comment',
				xtype:'textfield',
        		anchor:'98%'
			}
		};
		this.paymentTypeCB = new Ext.form.ComboBox({
			fieldLabel:'Форма оплаты',
			name:'payment_type',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['н','Наличная оплата'],
					['б','Безналичный перевод'],
					['д','ДМС']]
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'98%',
			value:'н',
			listeners: {
				select:function(combo,rec,i){
					var pb = Ext.getCmp('policy-bar');
					var vpc = Ext.getCmp('visit-policy-cmb');
					if(rec.data.id=='д') {
						vpc.allowBlank = false;
						pb.show();
					} else {
						vpc.allowBlank = true;
						vpc.reset();
						pb.hide();
					}
					
				},
				scope:this
			}
		});

		this.totalSum = {
			layout:'form',
			border:false,
			baseCls:'x-border-layout-ct',
			items:{
				id:'total-sum-field',
				xtype:'numberfield',
				name:'total_sum',
				fieldLabel:'К оплате с учетом скидки',
				readOnly:true,
				value:0,
				style:{
					fontSize:'2.5em',
					height:'1em',
					width:'180px'
				}
			}
		};
		this.paymentFs = {
            layout: 'form',
            border:false,
			items: {
				title:'Оплата',
				xtype:'fieldset',
	            defaults:{
	            	baseCls:'x-border-layout-ct',
	            	border:false
	            },
				items:[this.discounts, 
					this.paymentTypeCB,
					this.policyBar,
					this.totalSum
				]
			}
		};		
		
		this.defaultItems = [{
    			xtype:'hidden',
    			name:'patient',
    			value:this.patientRecord.data.resource_uri
        }];
		
		this.types = {
			visit:[{
        			xtype:'hidden',
        			name:'cls',
        			value:'п'
        		},{
        			flex:40,
					defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
        			items:[
        				this.referralBar,  
	        			{
	        				layout:'column',
							defaults:{
								baseCls:'x-border-layout-ct',
								border:false
							},
	        				items:[this.pregnancy, this.menstruation, this.mp]
	        			},
	        			this.diagnosis,
	        			this.comment
	        		]
        		},{
        			flex:60,
        			baseCls:'x-border-layout-ct',
					defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
        			items:[this.paymentFs]
        		}],
			material:[{
        			xtype:'hidden',
        			name:'payment_type',
        			value:'л'
        		},{
        			xtype:'hidden',
        			name:'cls',
        			value:'б'
        		},{
        			flex:3,
					defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
        			items:[
        				this.lab,
        				this.referralBar,  
	        			this.sample,
	        			{
	        				layout:'column',
							defaults:{
								baseCls:'x-border-layout-ct',
								border:false
							},
	        				items:[this.pregnancy, this.menstruation, this.mp]
	        			},
	        			this.diagnosis,
	        			this.comment
	        		]
        		}]       	
		}

		if(this.type){
			var items = this.defaultItems.concat(this.types[this.type]);
		} else {
			console.error('Не задан тип формы');
		}
		

		config = {
//			bodyStyle:'padding:5px',
//			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
			layout:'border',
			items:[{
				region:'north',
        		height:150,
        		layout:'hbox',
        		border:false,
        		baseCls:'x-border-layout-ct',
				defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
			    bodyStyle: 'padding:5px',
        		items:items
        	},this.orderedService]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.VisitForm.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		},this);
		
	},
	
	addRow: function(attrs) {
		this.orderedService.addRow.createDelegate(this.orderedService, [attrs])();
	},
	
	printBarcode: function()
	{
		var bc_win;
		bc_win = new App.barcode.PrintWindow({
			visitId:this.visitId
		});
		bc_win.show();
	},
	
	getTotalField: function()
	{
		return this.totalPaid.items.itemAt(0);
	},
	
	toPrint:function(slug){
		var url = ['/visit/print',slug,this.visitId,''].join('/');
		window.open(url);
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
	
/*	onSubmit:function(){
		if(this.getForm().isValid()){
			var sb = Ext.getCmp('global-status-bar');
			sb.setStatus({
				text:'Подождите, идет сохранение документа...',
				iconCls:'x-status-busy'
			});
			Ext.getCmp('global-progress-bar').show();
			this.fireEvent('visitsubmit');
			Ext.getCmp('visit-submit-btn').disable();
		} else {
			Ext.MessageBox.alert('Ошибка формы','Пожалуйста, заполните все обязательные поля, которые подчеркнуты красной линией!');
		}
	},
	
	enablePrintBtn: function(){
		Ext.getCmp('visit-print-btn').enable();
		Ext.getCmp('sampling-print-btn').enable();
		Ext.getCmp('barcode-print-btn').enable();
	}*/
	
});

Ext.reg('visitform', App.visit.VisitForm);