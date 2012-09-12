Ext.ns('App.visit');

App.visit.VisitForm = Ext.extend(Ext.FormPanel, {
	
	adHeight: 120,
	
	initComponent:function(){
		
		this.serviceClicked = false;
		
		// устанавливается при изменении типа цены;используется для занесения 
		// в лист истории при изменении плательщика и полиса.
		this.ptype_id = '';
		// лист истории действий. 
		this.historyList = [];
		// текущая позиция в истории действий
		this.curActionPos = -1;
		
		//Окно для сканирования штрих-кода. Появляется, если передан параметр hasBarcode
		this.barcodeWin = new Ext.Window({
			modal:true,
			height:100,
			width:300,
			layout:'fit',
			closable:false,
			onEsc:Ext.emptyFn,
			title:'Введите или просканируйте штрихкод',
			items:[{
				xtype:'textfield',
				fieldLabel:'Штрих-код',
				style:'font-size:3.5em; height:1em; width:140px',
				listeners:{
					scope:this,
					'specialkey':function(field,e) {
			     		if(e.getKey()==e.ENTER){
			     			this.onGetBarcode(field.getValue());
			     		}
			     	},
					'render': function(c) {
				     	var el = c.getEl();
				     	el.on('specialkey', function(field,e) {
				     		if(e.getKey()==e.ENTER){
				     			this.onGetBarcode(field.getValue());
				     		}
				     	}, this);
					}
				}
			}],
			listeners:{
				render:function(){
					this.barcodeWin.items.items[0].focus(false,500)
				},
				scope:this
			},
			scope:this
		})

		this.inlines = new Ext.util.MixedCollection({});
		
		this.contractTypeStore = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('contracttype'),
			model: App.models.contractTypeModel
		}),
		
		this.preorderStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			writer: new Ext.data.JsonWriter({
					    encode: false,
					    writeAllFields: false
					}),
			apiUrl : get_api_url('extpreorder'),
			model: App.models.preorderModel,
		    doTransaction : function(action, rs, batch) {
		        function transaction(records) {
		            try{
		                this.execute(action, records, undefined, batch);
		            }catch (e){
		                this.handleException(e);
		            }
		        }
		        this.batch=true;
		        transaction.call(this, rs);
		    }
		});
		
		this.orderedService = new App.visit.OrderedServiceInlineGrid({
//			record:this.record,
			type:this.type,
			region:'center',
			listeners:{
				scope:this,
				basketexception:function(){
					this.fireEvent('basketexception')
				},
				initcomplete:this.resetActionHistory,
				action:this.saveAction
			}
		});
		
		this.orderedService.store.on('write', function(){
			this.fireEvent('popstep');
		}, this);

		this.inlines.add('orderedservice', this.orderedService);
		
		
		this.servicePanel = new App.ServiceTreeGrid({
	        region: 'east',
//		    margins:'5 5 5 0',
		    baseParams:{
				payment_type:'н',
				promotion:true
			},
	        width: 400,
		    collapsible: true,
		    collapseMode: 'mini',
	        split: true,
	        listeners:{
	        	render: function(){
	        		this.loader.baseParams = {
	        			payment_type:'н',
	        			promotion:true
	        		}
	        	}
	        },
	        hidePrice:App.settings.strictMode
	    });	

///
		
		this.policyCmb = new Ext.form.LazyClearableComboBox({
//			id:'visit-policy-cmb',
        	fieldLabel:'Полис ДМС',
			anchor:'98%',
        	name:'insurance_policy',
        	emptyText:'Выберите полис',
        	store:new Ext.data.JsonStore({
    			proxy: new Ext.data.HttpProxy({
    				url:get_api_url('insurance_policy'),
    				method:'GET'
    			}),
    			root:'objects',
    			idProperty:'resource_uri',
    			fields:['resource_uri','name','number','state_name','start_date','end_date']
    		}),
		    displayField: 'name',
		    listeners:{
		    	select: function(combo,record){
		    	},
		    	scope:this
		    }
//		    itemSelector: 'div.x-combo-list-item',
//		    tpl:new Ext.XTemplate(
//		    	'<tpl for="."><div class="x-combo-list-item">',
//		    	'№{number}, {state_name}',
//		    	'</div></tpl>'
//		    )
		});

		
		this.policyBar = new Ext.Panel({
//			id:'policy-bar',
			flex:1,
			border:false,
			layout:'hbox',
			hidden:this.record ? this.record.data.payment_type!='д' : true,
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[{
				flex:1,
				layout:'form',
				hideLabels:true,
				items:this.policyCmb
			},{
				//columnWidth:0.20,
				width:30,
				items:{
					xtype:'button',
					//text:'Добавить',
					iconCls:'silk-add',
					handler:function(){
						var win;
						if(!win && this.patientRecord) {
							win = new App.insurance.PolicyWindow({
								patientRecord:this.patientRecord,
								fn:function(uri){
									this.policyCmb.forceValue(uri);
									win.close();
								},
								scope:this
							});
							win.on('policyselect', function(uri){
								this.policyCmb.forceValue(uri);
								win.close();
							},this);
							win.show(this);
						}
					},
					scope:this
				}
			}]			
		});
		
		this.contractCmb = new Ext.form.LazyClearableComboBox({
//			id:'visit-policy-cmb',
        	fieldLabel:'Договор',
        	allowBlank: false,
			anchor:'98%',
        	name:'contract',
        	store:new Ext.data.JsonStore({
        		autoSave:true,
    			proxy: new Ext.data.HttpProxy({
    				url:get_api_url('contract'),
    				method:'GET'
    			}),
    			root:'objects',
    			idProperty:'resource_uri',
    			fields:['resource_uri','patient','created','expire','active','state','id','name','state_name']
    		}),
		    displayField: 'name',
		    listeners:{
		    	select: function(combo,record){
		    	},
		    	scope:this
		    }
		});

		this.contractBar = new Ext.Panel({
			layout:'hbox',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[{
				flex:0.99,
				layout:'form',
				items:this.contractCmb
			}]			
		});
		
		
		this.payerCmb = new Ext.form.LazyComboBox({
	        	fieldLabel:'Плательщик',
	        	layout: 'form',
	        	baseCls:'x-border-layout-ct',
				border:false,
	        	anchor:'98%',
	        	name:'payer',
			    minChars:3,
			    hidden:(App.settings.strictMode && this.types==='material'),
			    emptyText:'Выберите плательщика...',
			    proxyUrl:get_api_url('state'),
			    value:App.settings.strictMode ? App.getApiUrl('state',active_state_id) : '',
			    listeners:{
			    	select:function(combo,record){
			    		var sp = this.servicePanel;
						sp.getLoader().baseParams['payer'] = App.uriToId(record.data.resource_uri);
						sp.getLoader().load(sp.getRootNode());
						this.rePrice('б',App.uriToId(record.data.resource_uri));
			    	},
			    	scope:this
			    }
		});
		
		this.bioPayerCmb = new Ext.form.LazyClearableComboBox({
	        	fieldLabel:'Плательщик',
	        	layout: 'form',
	        	baseCls:'x-border-layout-ct',
				border:false,
	        	anchor:'98%',
	        	name:'payer',
			    minChars:3,
			    hidden:(App.settings.strictMode && this.types==='material'),
			    emptyText:'Выберите плательщика...',
			    proxyUrl:get_api_url('state'),
			    value:App.settings.strictMode ? App.getApiUrl('state',active_state_id) : '',
			    listeners:{
			    	select:function(combo,record){
			    		var sp = this.servicePanel;
						sp.getLoader().baseParams['payer'] = App.uriToId(record.data.resource_uri);
						sp.getLoader().baseParams['payment_type'] = 'к'; // корпоративный
						sp.getLoader().load(sp.getRootNode());
						this.paymentTypeField.setValue('к');
						this.rePrice('к',App.uriToId(record.data.resource_uri));
			    	},
			    	clearclick:function(combo,record){
			    		var sp = this.servicePanel;
						delete sp.getLoader().baseParams['payer'];
						sp.getLoader().baseParams['payment_type'] = 'н'; // наличный
						sp.getLoader().load(sp.getRootNode());
						this.paymentTypeField.setValue('н');
						this.rePrice('н');
			    	},
			    	scope:this
			    }
		})
		
		
		this.payerBar = new Ext.Panel({
			flex:1,
			border:false,
//			id:'policy-bar',
			layout:'hbox',
			hidden:this.record ? this.record.data.payment_type!='б' : true,
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[{
				flex:0.99,
				layout:'form',
				hideLabels:true,
				items:this.payerCmb
			}]			
		});
		
		

///
		this.discountCmb = new Ext.form.LazyClearableComboBox({
//			id:'visit-discount-cmb',
        	fieldLabel:'Скидка',
			anchor:'100%',
        	name:'discount',
        	proxyUrl:get_api_url('discount'),
			listeners:{
				select: function(){
					this.orderedService.onSumChange();
//					App.eventManager.fireEvent('sumchange');
				},
				scope:this
			}
		});
		
//		this.discountCmb.getStore().load();
		
		this.discounts = {
			layout:'form',
			items:this.discountCmb
		};
		if(this.patientRecord) {
			this.discountCmb.setValue(this.patientRecord.data.discount);
		};
		
		this.referralCB = new Ext.form.LazyComboBox({
			anchor:'98%',
        	fieldLabel:'Кто направил',
        	emptyText:'Выберите направившего врача...',
        	name:'referral',
        	proxyUrl:get_api_url('referral'),
        	tooltip:'Врач, который направил пациента'
		});
		
		this.referral = {
			layout:'form',
			columnWidth:0.98,
//			hideLabels:true,
			items:this.referralCB
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
							refWin = new App.ReferralWindow({
								fn: function(record){
									if (record){
										this.referralCB.forceValue(record.data.resource_uri);
									};
									refWin.close();
								},
								listeners:{
									scope:this,
									referralcreate:function(record){
										this.referralCB.forceValue(record.data.resource_uri);
										refWin.close();
									}
								},
								scope:this
							});
							refWin.show(this);
						}
					},
					scope:this
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
					emptyText:'время',
					width:50
				}]
			}
		};
		this.pregnancy = {
            layout: 'form',
            border:false,
            items:[{
				fieldLabel:'Беременность',
				name:'pregnancy_week',
				xtype:'numberfield',
    			anchor:'98%',
				emptyText:'кол-во недель'
			}]
		};
		this.menstruation = {
            layout: 'form',
            labelWidth:70,
            border:false,
            items:[{
				fieldLabel:'День цикла',
				anchor:'98%',
				name:'menses_day',
				xtype:'numberfield',
				emptyText:'кол-во дней'
			}]
		};
		this.mp = {
            layout: 'form',
            border:false,
            items:[{
				boxLabel:'Менопауза',
				hideLabel:true,
				xtype:'checkbox',
				name:'menopause'
			}]
		};
		this.cito = {
            layout: 'form',
            border:false,
            baseCls:'x-border-layout-ct',
            margins: '0 0 0 5',
            items:[{
				boxLabel:'Cito',
				hideLabel:true,
				xtype:'checkbox',
				name:'cito'
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
		
		this.paymentTypeItems = [
			{
				cls:'x-form-item',
				baseCls:'x-border-layout-ct',
                border:false,
			items:[{
				xtype:'label',
				width:95,
				text:'Форма оплаты: ',
				cls:'x-form-item-label'
			}]}
			,new Ext.Button({
				allowDepress:false,
				enableToggle:true,
				toggleGroup:'ex-ptype-cls',
				text:'Касса',
				ptype:'н',
				pressed: true,
				handler:this.onPaymentTypeChoice.createDelegate(this,['н']),
				scope:this
			}),
			new Ext.Button({
				enableToggle:true,
				toggleGroup:'ex-ptype-cls',
				text:'Юридическое лицо',
				ptype:'б',
				handler:this.onPaymentTypeChoice.createDelegate(this,['б']),
				scope:this
			}),
			new Ext.Button({
				enableToggle:true,
				toggleGroup:'ex-ptype-cls',
				text:'ДМС',
				ptype:'д',
				handler:this.onPaymentTypeChoice.createDelegate(this,['д']),
				scope:this
			}),this.policyBar,
				this.payerBar]
		
		this.paymentTypeGroup = new Ext.Panel({
			labelWidth:90,
//			baseCls:'x-border-layout-ct',
//			bodyStyle: 'padding:5px',
			defaults:{
				labelWidth:70
			},
//			margins:'0 0 5 0',
	        border:false,
			layout:'hbox',
			items: this.paymentTypeItems
		}),
		
		this.totalSum = new Ext.form.NumberField({
			name:'total_sum_field',
//			margins:'0 0 0 5',
			hideLabel:true,
			readOnly:true,
			value:0,
			style:{
				fontSize:'2.5em',
				height:'45px',
				width:'160px'
			}
		});

		this.paymentFs = {
            layout: 'form',
            border:false,
            defaults:{
            	baseCls:'x-border-layout-ct',
            	border:false
            },
			items:[
				this.paymentTypeGroup
			]
		};		
		
		this.autoBarcode = new Ext.form.Checkbox({
			boxLabel:'',
			handler:this.setBarcode,
			hidden:this.hasBarcode,
			checked:true,
			scope:this
		});
		
		this.barcodeId = new Ext.form.DisplayField({
			hidden:!this.hasBarcode,
			value:''
		})
		
		
		
		this.barcodeBtn = new Ext.Button({
			text:'Автоматически',
			handler:this.setBarcode.createDelegate(this,[false]),
			disabled:true,
			hidden:this.hasBarcode,
			scope:this
		});
		
		this.barcode = new Ext.form.CompositeField({
            layout: 'hbox',
            baseCls:'x-border-layout-ct',
            border:false,
            labelWidth:100,
            fieldLabel:'Штрих-код',
            items:[
            	this.autoBarcode,this.barcodeBtn, this.barcodeId,this.cito
			]
		});
		
		this.barcodeField = new Ext.form.Hidden({
			name:'barcode'
		});
		
		this.defaultItems = [{
			xtype:'hidden',
			name:'patient',
			value:this.patientRecord ? this.patientRecord.data.resource_uri : ''
        },this.barcodeField];
        
        this.additionalPanel = new Ext.Panel({
			layout:'form',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			baseCls:'x-border-layout-ct',
		    height:this.adHeight,
	        items:[
	        	this.barcode,
    	        {
    				layout:'hbox',
					defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
    				items:[this.pregnancy, this.menstruation, this.mp]
    			},
    			this.diagnosis,
    			this.comment
	        ],
	        listeners:{
	        	beforehide: function(panel){
	        		this.adHeight = panel.getHeight();
	        	},
	        	scope:this
	        }
		});
		
		this.toHideBtn = new Ext.Button({
			text:'Свернуть &uarr;',
			handler:this.hideAdPanel.createDelegate(this,[]),
			scope:this
		});
		
		this.paymentTypeField = new Ext.form.Hidden({
			name:'payment_type',
			value:this.type == 'material' ? 'л' : 'н'
		})
		
		this.types = {
			visit:[
				this.paymentTypeField,
				{
        			xtype:'hidden',
        			name:'cls',
        			value:'п'
        		},{
        			flex:98,
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
							height: 90,
	        				items:[{
	        					layout:'form',
	        					columnWidth:'0.8',
	        					defaults:{
									baseCls:'x-border-layout-ct',
									border:false
	        					},
	        					items:[
	        						this.contractBar,
	        						this.discounts,
	        						this.paymentFs	
	        					]
	        				},{
	        					columnWidth:'0.2',
	        					layout:{
	        						type:'vbox'
	        					},
	        					height:90,
//	        					defaults:{
//	        						border:false,
//	        						baseCls:'x-border-layout-ct',
//	        						layout:'form'
//	        					},
	        					items:[this.totalSum,{
	        						layout:{
	        							type:'hbox',
	        							pack:'end'
	        						},
	        						border:false,
	        						baseCls:'x-border-layout-ct',
	        						margins:'5 0 0 0',
	        						width:168,
	        						height:30,
	        						items:this.toHideBtn
	        					}]
	        				}]
	        			},
	        			this.additionalPanel
	        			
	        			
	        			
	        		]
        		}],
			material:[this.paymentTypeField,
				{
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
        				this.referralBar,
        				{
        					layout:'hbox',
        					labelWidth:100,
        					defaults:{
								baseCls:'x-border-layout-ct',
								border:false,
								layout:'form'
							},
        					items:[{
        						flex:1,
        						items:[this.bioPayerCmb]
        					},{
        						baseCls:'x-border-layout-ct',
        						defaults:{
									baseCls:'x-border-layout-ct'
								},
        						width:300,
        						items:[this.sample]
        					}]
        				},
	        			{
		    				layout:'hbox',
							defaults:{
								baseCls:'x-border-layout-ct',
								border:false
							},
		    				items:[this.pregnancy, this.menstruation, this.mp]
		    			},
	        			this.diagnosis,
	        			this.comment,
	        			this.barcode
	        		]
        		}]       	
		}

		if(this.type){
			var items = this.defaultItems.concat(this.types[this.type]);
		} else {
//			console.error('Не задан тип формы');
		};
		
		this.undoBtn = new Ext.Button({
			text:'Назад',
			disabled:true
		});
		

		this.generalPanel = new Ext.Panel({
			region:'north',
    		height:this.type == 'visit' ? 230: 160,
    		layout:'hbox',
    		border:false,
    		baseCls:'x-border-layout-ct',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
		    bodyStyle: 'padding:5px',
    		items:items,
    		header:false,
		    collapsible: true,
		    collapseMode: 'mini',
	        split: true
    	});
		config = {
//			bodyStyle:'padding:5px',
//			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
			border:false,
			layout:'border',
			labelWidth:90,
			items:[{
				layout:'border',
				region:'center',
				margins:'5 0 5 5',
				items:[this.generalPanel,this.orderedService]
			}, this.servicePanel]

		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.VisitForm.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			Ext.QuickTips.register({
				autoHide:true,
			    target: this.autoBarcode,
			    title: 'Штрих-коды',
			    text: 'Автоматически создать штрих-код',
			    width: 300,
			    dismissDelay: 30000 // Hide after 10 seconds hover
			});
			if (this.hasBarcode){
				this.barcodeWin.show();
			}
//			this.saveAction();
		},this);
		this.orderedService.on('sumchange', this.updateTotalSum, this);
		this.orderedService.on('undo',this.undoAction, this);
		this.orderedService.on('redo',this.redoAction, this);
		this.servicePanel.on('serviceclick', this.onServiceClick, this);
		
	},
	
	addPreorderRecords : function(records) {
		//Устанавливаем реферрала. У всех добавляемых предзаказов один реферрал
		if (records.length){
			var cur_ref = this.referralCB.getValue();
			var preorder_ref = records[0].data.referral
			if (cur_ref || (!cur_ref && this.orderedService.store.data.items.length)){
				if ((preorder_ref || '') != cur_ref){
					Ext.Msg.alert('Внимание!',String.format('Реферралы не совпадают! {0} и {1}',this.referralCB.getRawValue() || 'не указан',records[0].data.referral_name || 'не указан') )
					return false;
				}
			} else {
				if (preorder_ref){
					this.referralCB.forceValue(preorder_ref)
				}
			}
		}
		Ext.each(records, function(rec){
			if(rec.data.service){
				this.addPreorderService(rec);
				var pt = rec.data.payment_type;
				if(pt && pt!='н'){
					this.setPTypeValue(pt);
					this.onPaymentTypeChoice(pt);
				}
				var discount = rec.data.promo_discount;
				if (discount){
					var dsc = this.discountCmb;
					dsc.getStore().load({
						callback:function(){
							var r = dsc.findRecord(dsc.valueField,get_api_url('discount')+'/'+discount);
							if(r) {
								dsc.setValue(r.data.resource_uri);
								this.orderedService.onSumChange();
							}
						},
						scope:this
					});
				}
			}
		},this);
	},
	
	printBarcode: function()
	{
		var bc_win;
		bc_win = new App.barcode.PrintWindow({
			visitId:this.visitId
		});
		bc_win.show();
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
	        this.getForm().items.each(function(f){
	            if(f.isDirty()){
//	            	console.info('dirty field:',f);
	            }
	         });
			steps+=1;
		}
		this.inlines.each(function(inline,i,l){
			var s = inline.getSteps();
			steps+=s;
		});
		return steps
	},
	
	updateTotalSum:function(sum) {
		if(this.type=='visit'){
			var d = this.discountCmb;
			var dRec = d.getStore().getById(d.getValue());
			var value = dRec ? dRec.data.value : 0;
			var discount = sum*(100-value)/100;
			this.totalSum.setValue(discount);
			this.totalSum.originalValue = discount;
		}
	},
	
	addRow: function(attrs, cb, scope) {
		this.orderedService.addRow.createDelegate(this.orderedService, [attrs, attrs.shiftKey, cb, scope])();
	},
	
	onServiceClick : function(node) {
		if(!this.serviceClicked && this.type == 'visit'){
			this.hideAdPanel(true);
			this.serviceClicked = true;
		};
		var a = node.attributes;
		if (a.isComplex) {
			this.cNodes = new Array();
			this.cNodes = this.cNodes.concat(a.nodes);
			this.rowAdded = false;
			complexAdd = function() {
				var item = this.cNodes.pop();
				if (item) {
					this.addRow(item, function(added){
						if (added){
							this.rowAdded = added;
						};
						if(this.cNodes.length) {
							complexAdd.createDelegate(this,[])();
						} else {
							if (this.rowAdded){
								this.saveAction();
							}
						}
					}, this);
				} else {
					if(this.cNodes.length) {
						complexAdd.createDelegate(this,[])();
					}
				}
			}
			complexAdd.createDelegate(this,[])();
//			Ext.each(a.nodes, function(item,i){
//				this.addRow(item);
//			}, this);
			if (a.discount) {
				var dsc = this.discountCmb;
				dsc.getStore().load({
					callback:function(){
						var r = dsc.findRecord(dsc.valueField,get_api_url('discount')+'/'+a.discount);
						if(r) {
							dsc.setValue(r.data.resource_uri);
							this.orderedService.onSumChange();
						}
					},
					scope:this
				});
			}
		} else {
			this.addRow(a,function(){
				this.saveAction();
			},this);
		}
	},
	
	getSum : function() {
		var sum = this.getForm().findField('total_sum_field').getValue();
		return sum;
	},
	
	onPreorderChoice : function(){
		
		//собираем уже выбранные предзаказы, чтобы в окне их уже не показывать
		var preorderList = []
		this.orderedService.store.each(function(record){
			if (record.data.preorder) preorderList.push(App.uriToId(record.data.preorder));
		});
		
        this.preorderGrid = new App.registry.PatientPreorderGrid({
       		scope:this,
       		patient : this.patientRecord,
       		store : this.preorderStore,
       		fn:this.addPreorderRecords
       	 });
        	
       	this.preorderWindow = new Ext.Window ({
       		width:700,
			height:500,
			layout:'fit',
			title:'Предзаказы',
			items:[this.preorderGrid],
			modal:true,
			border:false
    	});
    	var today = new Date();
    	today.setHours(0);
    	today.setMinutes(0);
    	today.setSeconds(0);
//    	this.preorderGrid.store.setBaseParam('timeslot__start__gte',today.format('Y-m-d 00:00'));
    	this.preorderGrid.store.setBaseParam('visit__isnull',true);
    	this.preorderGrid.store.setBaseParam('patient',App.uriToId(this.patientRecord.data.resource_uri));
    	this.preorderGrid.store.on('load',function(store,records){
    		store.filterBy(function(record,id){
    			in_array = false;
    			Ext.each(preorderList,function(pr){
    				if (record.data.id == pr) in_array = true;
    			});
    			//не выводить все предзаказы до сегодняшнего дня
    			var actual = true;
    			if(record.data.start){
    				actual = record.data.start.getTime() > today.getTime();
    			}
    			return !in_array && actual
    		})
    	})
       	this.preorderWindow.show();
	},
	
	addPreorderService : function(record) {
		var p = new this.orderedService.store.recordType()
		p.beginEdit();
		p.set('preorder',record.data.resource_uri);
		p.set('price',record.data.price);
		p.set('assigment',record.data.resource_uri);
		p.set('service_name',record.data.service_name);
		p.set('service',App.getApiUrl('baseservice',record.data.base_service));
		if (record.data.staff){
			p.set('staff',App.getApiUrl('position',record.data.staff));
			p.set('staff_name',record.data.staff_name);
		};
		p.set('execution_place',App.getApiUrl('state',record.data.execution_place));
		p.set('count',1);
		p.data['id'] = '';
		p.endEdit();
		this.orderedService.store.add(p);
		this.orderedService.preorders.add(record.data.resource_uri,record);
		if (this.preorderWindow){
			this.preorderWindow.close();
		};
		this.saveAction();
	},
	
	onPaymentTypeChoice : function(id){
		
		this.paymentTypeField.setValue(id);
		
		switch(id){
			case 'д':
				this.hidePaymentCmb('payer');
				this.showPaymentCmb('policy');
				this.reloadTree(id);
				this.rePrice(id);
				break
			case 'б':
				this.servicePanel.getLoader().baseParams['payment_type'] = id;
				this.hidePaymentCmb('policy');
				this.showPaymentCmb('payer');
				break
			case 'н':
				this.hidePaymentCmb('policy');
				this.hidePaymentCmb('payer');
				this.reloadTree(id);
				this.rePrice(id);
				break
		};
		
	},
	
	reloadTree:function(ptype_id,payer){
		var sp = this.servicePanel;
		if (payer){
			sp.getLoader().baseParams['payer'] = payer;
		} else {
			delete sp.getLoader().baseParams['payer'];
		};
		if (this.type == 'material' && ptype_id == 'б'){
			ptype_id = 'к'
		}
		sp.getLoader().baseParams['payment_type'] = ptype_id;
		sp.getLoader().load(sp.getRootNode())
	},
	
	rePrice: function(ptype,payer){
		if (!ptype){
			console.log('пересчет цен: не указан тип цены')
			return false
		};
		var base_services = this.orderedService.store.data.items;
		//если услуг нет, ничего выполнять не надо
		if (!base_services.length) {
			this.saveAction();
			return false
		};
		var bs_ids = {} // список услуг, который был до обновления цен
		var id_list = [] // передается на сервер для выборки цен
		//сервер возвращает услуги с id формата 'idУслуги_idМестаВыполнения' - содержимое переменной comp_id
		Ext.each(base_services,function(rec){
			var id = []
			id[0] = App.uriToId(rec.data.service);
			id[1] = App.uriToId(rec.data.execution_place);
			var comp_id = String.format('{0}_{1}',id[0],id[1])
			bs_ids[comp_id] = {
				'price': rec.data.price,
				'name': rec.data.service_name,
				'id':id[0],
				'comp_id':comp_id
			};
			id_list.push(id)
		})
		var params = {}
		params['services'] = id_list;
		params['ptype'] = ptype;
		params['state'] = state;
		params['payer'] = payer;
		App.direct.service.getActualPrice(params,function(res){
			var new_prices = res.data;
			var missing_list = [];
			var store = this.orderedService.store;
			var ind;
			for (serv in bs_ids){
				var id = bs_ids[serv].id;
				var comp_id = bs_ids[serv].comp_id;
				var service = App.getApiUrl('baseservice',id)
				ind = store.find("service",service);
				if (new_prices[comp_id]==undefined || new_prices[comp_id] == 0){
					if (ind > -1){
						store.removeAt(ind);
						missing_list.push(bs_ids[comp_id].name);
					}
				} else {
					var rec = store.getAt(ind);
					//если цена все-таки изменилась, то меняем в store
					if (!(bs_ids[comp_id].price==String(new_prices[comp_id]))) {
						rec.beginEdit();
						rec.set('price',new_prices[comp_id])
						rec.endEdit();
					};
					this.orderedService.onSumChange()
				}
			};
			this.saveAction();
//			console.log(missing_list);
		},this)

	},
	
	hidePaymentCmb: function(type){
		if (!type) return false
		this[type+'Cmb'].allowBlank = true;
		this[type+'Cmb'].setRawValue('');
    	this[type+'Cmb'].originalValue = '';
    	this[type+'Cmb'].value = '';
		this[type+'Cmb'].reset();
		this[type+'Bar'].hide();
		this.paymentTypeGroup.doLayout();
	},
	
	showPaymentCmb: function(type){
		if (!type) return false
		this[type+'Cmb'].allowBlank = false;
		this[type+'Bar'].show();
		this.paymentTypeGroup.doLayout();
	},
	
	setPatientRecord: function(record){
		this.patientRecord = record;
		this.policyCmb.getStore().setBaseParam('patient',this.patientRecord.data.id);
		this.discountCmb.setValue(this.patientRecord.data.discount);
		this.getForm().findField('patient').setValue(this.patientRecord.data.resource_uri);
	},
	
	setContractRecord: function(patientId){
		this.contractCmb.store.setBaseParam('patient',patientId);
		this.contractCmb.store.setBaseParam('active',true);
		this.contractCmb.store.setBaseParam('state',state);
		var item = {
			width:40,
			items:[]
		}; 
		this.additionalMenu = [];
		this.contractTypeStore.load({callback:function(records){
			this.contractCmb.store.load({callback:function(records){
				this.contractAddBtn = new Ext.Button({
					iconCls:'silk-add',
					handler:this.contractChoice.createDelegate(this,[]),
					scope:this
				});
				
				this.contractSplitBtn = new Ext.SplitButton({
					iconCls:'silk-printer',
					handler:this.contractPrint.createDelegate(this,[]),
					menu: new Ext.menu.Menu({
						items:[{iconCls:'silk-add', text:'Выбрать',handler:this.contractChoice.createDelegate(this,[])}]
					}),
					scope:this
				});
				if (records.length){
					this.contractCmb.setValue(records[0].data.resource_uri)
					item.items.push(this.contractSplitBtn);
					this.contractBtnType = 'split';
				} else {
					item.items.push(this.contractAddBtn)
					this.contractBtnType = 'add'
				}
				this.contractBar.add(item);
				this.doLayout();
			},scope:this})
		},scope:this});
		
	},
	
	setVisitRecord: function(record,patientRecord){
		if(record) {
			this.record = record;
			this.getForm().loadRecord(this.record);
			var docSum = this.record.data.total_price-this.record.data.total_discount;
			this.totalSum.setValue(docSum);
			this.totalSum.originalValue = docSum;
			this.orderedService.setRecord(record);
			this.getForm().findField('patient').originalValue = patientRecord.data.resource_uri;
			this.getForm().findField('barcode').originalValue = record.data.barcode;
			this.autoBarcode.disable();
			this.setPTypeValue(record.data.payment_type);
			this.paymentTypeGroup.disable();
			this.onPaymentTypeChoice(this.record.data.payment_type);
			if (this.record.data.payer){
				this.reloadTree(this.record.data.payment_type,App.uriToId(this.record.data.payer));
			}
			this.payerCmb.disable();
			this.bioPayerCmb.disable();
			this.policyCmb.disable();
			this.contractCmb.disable();
		};
	},
	
	setPreorderRecord: function(record){
		var recs = [];
		if(Ext.isArray(record)){
			recs = record;
		} else if (record.data) {
			recs = [record];
		}
		
		this.addPreorderRecords(recs);
	},
	
	setBarcode: function(checkbox,checked){
		if (checked) {
			this.barcodeField.setValue('');
			this.barcodeBtn.setText('Автоматически');
			this.barcodeBtn.disable();
			this.barcodeValue = undefined;
		} else {
			var barcodeWindow = new App.choices.BarcodeChoiceWindow({
				patientId:this.patientRecord.data.id,
				fn:function(record){
					if (record){
						this.barcodeValue = record.data.resource_uri;
						this.barcodeField.setValue(this.barcodeValue);
						this.barcodeBtn.setText(record.data.id);
						this.barcodeBtn.enable();
						barcodeWindow.close();
					}
				},
				listeners:{
					close:function(){
						if(!this.barcodeValue){
							this.autoBarcode.setValue(true);
							this.barcodeBtn.setText('Автоматически');
						}
					},
					scope:this
				},
				scope:this
			});
			barcodeWindow.show();
		}
	},
	
	saveAction: function(){
		if (this.record){
			return false
		}
		this.historyTailPop();
		var actionItem = {};
		var services = [];
		this.orderedService.store.each(function(record){
			var p = new this.orderedService.store.recordType()
			p.beginEdit();
			Ext.apply(p.data,record.data);
			p.endEdit();
			services.push(p)
		},this)
		actionItem['services'] = services;
		actionItem['ptype'] = this.getPTypeValue();
		actionItem['payer'] = this.payerCmb.getValue();
		actionItem['biopayer'] = this.bioPayerCmb.getValue();
		actionItem['policy'] = this.policyCmb.getValue();
		this.historyList.push(actionItem);
		this.curActionPos += 1;
		if (this.curActionPos >0) this.orderedService.undoBtn.enable();
	},
	
	resetActionHistory: function(){
		this.historyList = [];
		this.curActionPos = -1;
		this.saveAction();
	},
	
	historyTailPop: function(){
		var historyCount = this.historyList.length - 1;
		if (historyCount < 0) return false;
		while (historyCount > this.curActionPos){
			this.historyList.pop();
			historyCount -= 1;
		};
		this.orderedService.redoBtn.disable();
	},
	
	undoAction: function(){
		var ptype = this.historyList[this.curActionPos]['ptype'];
		var payer = this.historyList[this.curActionPos]['payer'];
		var biopayer = this.historyList[this.curActionPos]['biopayer'];
		if (this.curActionPos < 0) return false;
		this.curActionPos -= 1;
		this.restorePosition(this.curActionPos,ptype,payer,biopayer);
//		console.log((this.curActionPos) + ' of ' + (this.historyList.length-1))
		if (this.curActionPos <= 0) this.orderedService.undoBtn.disable();
		this.orderedService.redoBtn.enable();
	},
	
	redoAction: function(){
		var ptype = this.getPTypeValue();
		var payer = this.payerCmb.getValue();
		var biopayer = this.bioPayerCmb.getValue();
		if (this.curActionPos >= (this.historyList.length - 1)) return false;
		this.curActionPos += 1;
//		console.log((this.curActionPos) + ' of ' + (this.historyList.length-1));
		this.restorePosition(this.curActionPos,ptype,payer,biopayer);
		if (this.curActionPos >= this.historyList.length-1) this.orderedService.redoBtn.disable();
		this.orderedService.undoBtn.enable();
	},
	
	restorePosition: function(pos,cur_ptype,cur_payer,cur_biopayer){
		var actionItem = this.historyList[pos];
		var services = actionItem['services'];
		this.orderedService.store.removeAll();
		this.orderedService.store.add(services);
		this.orderedService.doLayout();
		var payer = actionItem['payer'];
		var biopayer = actionItem['biopayer'];
		if (payer) {
			var payer_id = App.uriToId(payer);
		} else {
			payer_id = undefined
		}
		if (biopayer) {
			var biopayer_id = App.uriToId(biopayer);
		} else {
			biopayer_id = undefined
		}
		var ptype = actionItem['ptype'];
		var policy = actionItem['policy'];
		//Перегружать дерево только если поменялись значения типа оплаты или плательщика
		if (this.type == 'visit'){
			if (ptype==cur_ptype){
				if (!(payer == cur_payer)){
					this.reloadTree(ptype,payer_id)		
				}
			} else {
				this.reloadTree(ptype,payer_id)
			}
		};
		if (this.type == 'material'){
			if (ptype==cur_ptype){
				if (!(biopayer == cur_biopayer)){
					this.reloadTree(ptype,biopayer_id)		
				}
			} else {
				this.reloadTree(ptype,biopayer_id)
			}
		}
		this.setPTypeValue(ptype);
		this.paymentTypeField.setValue(ptype);
		switch(ptype){
			case 'д':
				if (policy){
					this.policyCmb.setValue(policy);
				} else {
					this.policyCmb.setRawValue('');
			    	this.policyCmb.originalValue = '';
			    	this.policyCmb.value = '';
					this.policyCmb.reset();
				};
				this.policyCmb.setValue(actionItem['policy']);
				this.hidePaymentCmb('payer');
				this.showPaymentCmb('policy');
				break
			case 'б':
				if (payer){
					this.payerCmb.setValue(payer);
				} else {
					this.payerCmb.setRawValue('');
			    	this.payerCmb.originalValue = '';
			    	this.payerCmb.value = '';
					this.payerCmb.reset();
				} 
				this.servicePanel.getLoader().baseParams['payment_type'] = ptype;
				this.hidePaymentCmb('policy');
				this.showPaymentCmb('payer');
				break
				
			case 'к':
				if (biopayer){
					this.bioPayerCmb.setValue(biopayer);
				}
				this.servicePanel.getLoader().baseParams['payment_type'] = ptype;
				this.hidePaymentCmb('policy');
				this.showPaymentCmb('payer');
				break
			case 'н':
				this.hidePaymentCmb('policy');
				this.hidePaymentCmb('payer');
				this.bioPayerCmb.setRawValue('');
		    	this.bioPayerCmb.originalValue = '';
		    	this.bioPayerCmb.value = '';
				this.bioPayerCmb.reset();
				break
			default:
				this.hidePaymentCmb('policy');
				this.hidePaymentCmb('payer');
				break
		};
		this.orderedService.onSumChange();
	},
	
	hideAdPanel: function(hide){
		var genHeight = this.generalPanel.getHeight();
		if(this.additionalPanel.hidden && !hide){
			this.generalPanel.setHeight(genHeight+this.adHeight);
			this.additionalPanel.show();
			this.toHideBtn.setText('Свернуть &uarr;');
			this.doLayout();
		}
		else {
			var adHeight = this.additionalPanel.getHeight();
			this.generalPanel.setHeight(genHeight-adHeight);
			this.additionalPanel.hide();
			this.toHideBtn.setText('Дополнительно &darr;');
			this.doLayout();
		}
		
	},
	
	setPTypeValue: function(ptype){
		if (this.type == 'visit'){
			Ext.each(this.paymentTypeItems,function(item){
				if(item.ptype == ptype && !item.pressed){
					item.toggle();
				}
			})
		}
		if (this.type == 'material'){
			this.paymentTypeField.setValue(ptype);
			if (ptype == 'к' && this.record){
				this.bioPayerCmb.forceValue(this.record.data.payer)
			}
		}
	},
	getPTypeValue: function(ptype){
		var ptype = ''
		if (this.type == 'visit'){
			Ext.each(this.paymentTypeItems,function(item){
				if(item.pressed){
					ptype = item.ptype
				}
			})
		}
		if (this.type == 'material'){
			ptype = this.paymentTypeField.getValue() || 'н';
		}
		return ptype
	},
	
	contractChoice: function(){
		var win;
		var contractGrid = new App.patient.ContractGrid({
			showChoiceButton: true,
			layout:'fit',
//			store:this.contractCmb.store,
			record:this.patientRecord,
			fn: function(record){
				if (record){
					this.contractCmb.forceValue(record.data.resource_uri);
				};
				win.close();
			},
			listeners:{
				afterrender: function(grid){
					grid.store.setBaseParam('patient',grid.record.data.id);
					grid.store.setBaseParam('active',true);
					grid.store.setBaseParam('state',state);
					grid.fillAddMenu();
				},
				contractcreate: function(record){
					if (this.contractBtnType=='add'){
						this.contractBar.remove(this.contractBar.items.items[1]);
						var item = {
							width:40,
							items:[this.contractSplitBtn]
						}; 
						this.contractBtnType = 'split';
						this.contractBar.add(item);
						this.doLayout();
						this.contractCmb.forceValue(record.data.resource_uri);
						win.close();
					}
				},
				scope:this
			},
			scope:this
		})
		win = new Ext.Window({
			items:[contractGrid],
			modal:true,
			layout:'fit',
			width:500,
			height:400
		});
		win.show(this);
		
	},
	
	contractPrint: function(){
		var id = this.contractCmb.getValue();
		id = App.uriToId(id);
		var url = String.format('/patient/contract/{0}/', id);
		window.open(url);
	},
	
	onGetBarcode:function(value){
		this.barcodeWin.close();
		if(value){
			App.direct.numeration.getBarcodePayer(value,function(res,e) {
				if(res && res.success) {
					var payer_id = res.data['payer_id'];
					this.bioPayerCmb.forceValue(App.getApiUrl('state',payer_id));
					this.barcodeId.setVisible(true);
					this.barcodeId.setValue('Штрих-код:  '+res.data['barcode_id']);
					this.doLayout();
					this.barcodeField.setValue(App.getApiUrl('barcode',res.data['barcode_id']));
				} else {
					Ext.Msg.alert('Ошибка!',res.data);
					this.fireEvent('closeall');
				}
		    }, this);
		} else {
			Ext.Msg.alert('Ошибка!','Введен пустой штрихкод!')
			this.fireEvent('closeall');
		}
	}
});

Ext.reg('visitform', App.visit.VisitForm);