Ext.ns('App.visit');

App.visit.VisitForm = Ext.extend(Ext.FormPanel, {
	
	initComponent:function(){

		this.inlines = new Ext.util.MixedCollection({});
		
		this.preorderStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			writer: new Ext.data.JsonWriter({
					    encode: false,
					    writeAllFields: false
					}),
			apiUrl : get_api_url('extpreorder'),
			model: App.models.preorderModel
		});
		
		this.orderedService = new App.visit.OrderedServiceInlineGrid({
//			record:this.record,
			type:this.type,
			region:'center'
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
	        width: 300,
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
        	store:new Ext.data.JsonStore({
    			proxy: new Ext.data.HttpProxy({
    				url:get_api_url('insurance_policy'),
    				method:'GET'
    			}),
    			root:'objects',
    			idProperty:'resource_uri',
    			fields:['resource_uri','name','number','state_name','start_date','end_date']
    		}),
		    displayField: 'name'
//		    itemSelector: 'div.x-combo-list-item',
//		    tpl:new Ext.XTemplate(
//		    	'<tpl for="."><div class="x-combo-list-item">',
//		    	'№{number}, {state_name}',
//		    	'</div></tpl>'
//		    )
		});
		
		if(this.patientRecord) {
			this.policyCmb.getStore().setBaseParam('patient',this.patientRecord.data.id);
		};
		
		this.policyBar = new Ext.Panel({
//			id:'policy-bar',
			layout:'hbox',
			hidden:this.record ? this.record.data.payment_type!='д' : true,
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[{
				flex:1,
				layout:'form',
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
								patientRecord:this.patientRecord
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

///
		this.discountCmb = new Ext.form.LazyClearableComboBox({
//			id:'visit-discount-cmb',
        	fieldLabel:'Скидка',
			anchor:'98%',
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
		}

		this.lab = {
			layout:'form',
			hideLabel:true,
			hidden:App.settings.strictMode,
			items:new Ext.form.LazyComboBox({
	        	fieldLabel:'Лаборатория',
	        	name:'source_lab',
			    minChars:3,
			    emptyText:'Выберите лабораторию...',
			    proxyUrl:get_api_url('lab'),
			    value:App.settings.strictMode ? App.getApiUrl('lab',active_state_id) : ''
			})
		};

		this.referral = {
			layout:'form',
			columnWidth:1.0,
//			hideLabels:true,
			items:new Ext.form.LazyComboBox({
				anchor:'98%',
	        	fieldLabel:'Кто направил',
	        	emptyText:'Выберите направившего врача...',
	        	name:'referral',
	        	proxyUrl:get_api_url('referral'),
	        	tooltip:'Врач, который направил пациента'
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
					emptyText:'время',
					width:50
				}]
			}
		};
		this.pregnancy = {
            layout: 'form',
            border:false,
            columnWidth:0.5,
            items:[{
				fieldLabel:'Беременность',
				name:'pregnancy_week',
				xtype:'textfield',
    			anchor:'100%',
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
    			anchor:'50%',
				emptyText:'кол-во дней'
			}]
		};
		this.mp = {
            layout: 'form',
            border:false,
            columnWidth:0.5,
            items:[{
				boxLabel:'Менопауза',
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
					this.onPaymentTypeChoice(rec);
				},
				scope:this
			}
		});
		
		this.totalSum = new Ext.form.NumberField({
			name:'total_sum_field',
			fieldLabel:'К оплате с учетом скидки',
			readOnly:true,
			value:0,
			style:{
				fontSize:'2.5em',
				height:'1em',
				width:'180px'
			}
		});

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
					{
						layout:'form',
						border:false,
						baseCls:'x-border-layout-ct',
						items:this.totalSum
					}
				]
			}
		};		
		
		this.cito = {
	            layout: 'form',
	            border:false,
//	            columnWidth:0.5,
	            items:[{
					boxLabel:'Cito',
					xtype:'checkbox',
					name:'is_cito'
				}]
			};
		
		this.defaultItems = [{
			xtype:'hidden',
			name:'patient',
			value:this.patientRecord ? this.patientRecord.data.resource_uri : ''
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
	        				items:[this.pregnancy, this.mp]
	        			},
	        			this.menstruation, 
	        			this.diagnosis,
	        			this.comment,
	        			this.cito
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
	        				items:[this.pregnancy, this.mp]
	        			},
	        			this.menstruation, 
	        			this.diagnosis,
	        			this.comment,
	        			this.cito
	        		]
        		}]       	
		}

		if(this.type){
			var items = this.defaultItems.concat(this.types[this.type]);
		} else {
//			console.error('Не задан тип формы');
		}
		

		config = {
//			bodyStyle:'padding:5px',
//			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
			border:false,
			layout:'border',
			items:[{
				layout:'border',
				region:'center',
				margins:'5 0 5 5',
				items:[{
					region:'north',
	        		height:170,
	        		layout:'hbox',
	        		border:false,
	        		baseCls:'x-border-layout-ct',
					defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
				    bodyStyle: 'padding:5px',
	        		items:items,
	    		    collapsible: true,
	    		    collapseMode: 'mini',
	    	        split: true
	        	},this.orderedService]
			}, this.servicePanel]

		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.VisitForm.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
		},this);
		this.orderedService.on('sumchange', this.updateTotalSum, this);
		this.servicePanel.on('serviceclick', this.onServiceClick, this);
		
	},
	
	addPreorderRecords : function(records) {
		Ext.each(records, function(rec){
			if(rec.data.service){
				this.addPreorderService(rec);
				var pt = rec.data.payment_type;
				if(pt && pt!='н'){
					this.paymentTypeCB.setValue(pt);
					var ptRec = this.paymentTypeCB.findRecord(this.paymentTypeCB.valueField,pt);
					this.onPaymentTypeChoice(ptRec);
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
		var a = node.attributes;
		if (a.isComplex) {
			this.cNodes = a.nodes;
			complexAdd = function() {
				var item = this.cNodes.pop();
				this.addRow(item, function(){
					if(this.cNodes.length) {
						complexAdd.createDelegate(this,[])();
					}
				}, this);
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
			this.addRow(a);
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
    	console.log(today)
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
    				console.log(record.data.id)
    				console.log(record.data.start.getTime())
    				console.log()
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
	},
	
	onPaymentTypeChoice : function(rec){
		if(App.settings.reloadPriceByPaymentType) {
			var sp = this.servicePanel;
			sp.getLoader().baseParams['payment_type'] = rec.data.id;
			sp.getLoader().load(sp.getRootNode())
		}
		if(rec.data.id=='д') {
			this.policyCmb.allowBlank = false;
			this.policyBar.show();
		} else {
			this.policyCmb.allowBlank = true;
			this.policyCmb.reset();
			this.policyBar.hide();
		}
	},
	
	setPatientRecord: function(record){
		this.patientRecord = record;
		this.policyCmb.getStore().setBaseParam('patient',this.patientRecord.data.id);
		this.discountCmb.setValue(this.patientRecord.data.discount);
		this.getForm().findField('patient').setValue(this.patientRecord.data.resource_uri);
	},
	
	setVisitRecord: function(record){
		if(record) {
			this.record = record;
			this.getForm().loadRecord(this.record);
			var docSum = this.record.data.total_price-this.record.data.total_discount;
			this.totalSum.setValue(docSum);
			this.totalSum.originalValue = docSum;
			this.orderedService.setRecord(record);
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
	}
	
});

Ext.reg('visitform', App.visit.VisitForm);