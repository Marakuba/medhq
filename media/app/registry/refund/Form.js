Ext.ns('App.refund');

App.refund.Form = Ext.extend(Ext.FormPanel, {

	//

	initComponent:function(){

		this.isNew = true;

		this.refundId = undefined;
		this.refundRec = undefined;

///

		this.policyStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:App.getApiUrl('patient','insurance_policy'),
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
			//columnWidth:0.80,
			flex:1,
			layout:'form',
			items:new Ext.form.ClearableComboBox({
				id:'visit-policy-cmb',
	        	fieldLabel:'Полис ДМС',
				anchor:'98%',
	        	name:'insurance_policy',
			    store: this.policyStore,
			    typeAhead: true,
			    triggerAction: 'all',
			    valueField: 'resource_uri',
			    displayField: 'number',
			    selectOnFocus:true,
			    itemSelector: 'div.x-combo-list-item',
			    tpl:new Ext.XTemplate(
			    	'<tpl for="."><div class="x-combo-list-item">',
			    	'№{number}, {state_name}, {start_date:date("d.m.Y")} - {end_date:date("d.m.Y")}',
			    	'</div></tpl>'
			    ),
				editable:false
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
		this.discounts = {
			layout:'form',
			items:new Ext.form.ClearableComboBox({
				id:'visit-discount-cmb',
	        	fieldLabel:'Скидка',
				anchor:'98%',
	        	name:'discount',
			    store: this.discountsStore,
			    typeAhead: true,
			    //queryParam:'pid',
			    triggerAction: 'all',
			    //emptyText:'Выберите лабораторию...',
			    valueField: 'resource_uri',
			    displayField: 'title',
			    selectOnFocus:true,
			    itemSelector: 'div.x-combo-list-item',
			    tpl:new Ext.XTemplate(
			    	'<tpl for="."><div class="x-combo-list-item">',
			    	'{name}, {value}%',
			    	'</div></tpl>'
			    ),
				editable:false,
				listeners:{
					select: function(){
						App.eventManager.fireEvent('sumchange');
					},
					scope:this
				}
			})
		};

		this.labStore = new Ext.data.JsonStore({
			autoLoad:true,
			proxy: new Ext.data.HttpProxy({
				url:'/api/v1/dashboard/lab',
				method:'GET'
			}),
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','name']
		});

		this.lab = {
			layout:'form',
			items:new Ext.form.ClearableComboBox({
	        	fieldLabel:'Лаборатория',
	        	name:'source_lab',
			    store: this.labStore,
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите лабораторию...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
			})
		};

		this.referralStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:'/api/v1/dashboard/referral',
				method:'GET'
			}),
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','name']
		});
		this.referralStore.load();
		this.referral = {
			layout:'form',
			columnWidth:0.60,
			items:new Ext.form.ClearableComboBox({
				anchor:'95%',
	        	fieldLabel:'Кто направил',
	        	name:'referral_name',
	        	hiddenName:'referral',
			    store: this.referralStore,
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите врача...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
			})
		};
		this.referralBar = {
			layout:'column',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[this.referral,{
				columnWidth:0.40,
				items:{
					xtype:'button',
					//text:'Добавить',
					iconCls:'silk-add',
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
				xtype:'textarea',
        		anchor:'98%'
			}
		};
		this.ptStore = new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['н','Наличная оплата'],
					['б','Безналичный перевод'],
					['д','ДМС']]
		});
		this.paymentTypeCB = new Ext.form.ComboBox({
			id:'payment-type-cb',
			fieldLabel:'Форма оплаты',
			name:'payment_type',
			store:this.ptStore,
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'98%',
			listeners: {
				select:function(combo,rec,i){
					var pb = Ext.getCmp('policy-bar');
					var vpc = Ext.getCmp('visit-policy-cmb');
					if(rec.data.id=='д') {
						vpc.allowBlank = false;
						pb.show();
					} else {
						vpc.allowBlank = true;
						pb.hide();
					}

				},
				scope:this
			}
		});
/*		this.totalPaid = {
			layout:'form',
			border:false,
			baseCls:'x-border-layout-ct',
			items:{
				id:'total-paid-field',
				xtype:'numberfield',
				name:'total_paid',
				fieldLabel:'Всего оплачено',
				style:{
					fontSize:'2.5em',
					height:'1em',
					width:'180px'
				}
			}
		};*/
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
		this.paymentTpl = new Ext.Template(
			'<div class="total-sum">',
			'<div class="">Сумма без скидки: <strong>{total} руб.</strong></div>',
			'<div class="">Сумма со скидкой: <strong>{total_discount} руб.</strong></div>',
			'<div class="">Скидка: <strong>{discount} руб.</strong></div>',
			'</div>'
		);

		this.paymentPanel = new Ext.Panel({
			//baseCls:'x-panel-body'
		});

		this.defaultItems = [{
    			xtype:'hidden',
    			name:'patient',
    			value:"/api/v1/dashboard/patient/"+this.patientId || null
        }];

		this.types = {
			visit:[{
        			xtype:'hidden',
        			name:'cls',
        			value:'п'
        		},{
        			flex:55,
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
        			flex:45,
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
		}


		config = {
			bodyStyle:'padding:5px',
			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
        	items:{
        		layout:'hbox',
        		border:false,
        		baseCls:'x-border-layout-ct',
				defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
        		items:items
        	},
        	tbar:[this.getPatientTitle(this.patientId),'->',{
        		text:'Закрыть',
				handler:function(){
					App.eventManager.fireEvent('refundclose', this.refundId);
				}
			},{
				id:'visit-submit-btn',
				text:'Сохранить',
				//disabled:true,
				handler: this.onSubmit.createDelegate(this,[])
        	}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.refund.Form.superclass.initComponent.apply(this, arguments);


	},

	getTotalField: function()
	{
		return this.totalPaid.items.itemAt(0);
	},

	getPatientTitle : function(id){
		//var p = Ext.getCmp('patient-grid');
		var rec = this.patientRecord; //p.store.getById(id);
		titles = ["Пациент:",rec.data.last_name,rec.data.first_name,rec.data.mid_name,"прием"];
		v = {};
		Ext.apply(v, rec.data);
		Ext.apply(v,{refund_id:this.refundId});
		tpl = new Ext.Template(
			'Пациент: {last_name} {first_name} {mid_name}, ',
			'прием №{refund_id}'
		);
		return tpl.apply(v);
	},

	toPrint:function(slug){
		var url = ['/visit/print',slug,this.visitId,''].join('/');
		window.open(url);
	},

	onCancel:function(){
        App.eventManager.fireEvent('refundclose', this.visitId);
	},

	onSubmit:function(){
		if(this.getForm().isValid()){
			var sb = Ext.getCmp('global-status-bar');
			sb.setStatus({
				text:'Подождите, идет сохранение документа...',
				iconCls:'x-status-busy'
			});
			Ext.getCmp('global-progress-bar').show();
			this.fireEvent('refundsubmit');
			Ext.getCmp('visit-submit-btn').disable();
		} else {
			Ext.MessageBox.alert('Ошибка формы','Пожалуйста, заполните все обязательные поля, которые подчеркнуты красной линией!');
		}
	},

	enablePrintBtn: function(){
		Ext.getCmp('visit-print-btn').enable();
		Ext.getCmp('sampling-print-btn').enable();
		Ext.getCmp('barcode-print-btn').enable();
	}

});

Ext.reg('visitform', App.visit.Form);



// --- A ComboBox with a secondary trigger button that clears the contents of the ComboBox
Ext.form.ClearableComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent : function(){
        Ext.form.ClearableComboBox.superclass.initComponent.call(this);

        this.triggerConfig = {
            tag:'span', cls:'x-form-twin-triggers', style:'padding-right:2px',  // padding needed to prevent IE from clipping 2nd trigger button
            cn:[
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-clear-trigger"},
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger"}
               ]
           };
    },

    getTrigger : function(index){
        return this.triggers[index];
    },

    initTrigger : function(){
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function(t, all, index){
            t.hide = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            t.show = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            var triggerIndex = 'Trigger'+(index+1);

            if(this['hide'+triggerIndex]){
                t.dom.style.display = 'none';
            }
            t.on("click", this['on'+triggerIndex+'Click'], this, {preventDefault:true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
    },

    onTrigger2Click : function() {this.onTriggerClick()},   // pass to original combobox trigger handler
    onTrigger1Click : function() {this.reset()}             // clear contents of combobox
});

Ext.reg('clearablecombobox', Ext.form.ClearableComboBox);
