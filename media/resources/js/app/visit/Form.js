Ext.ns('App.visit');

App.visit.Form = Ext.extend(Ext.FormPanel, {
	
	// 
	
	initComponent:function(){
		
		this.isNew = true;

		this.visitId = undefined;
		this.visitRec = undefined;

		this.discountsStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:'/dashboard/api/v1/discount',
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
					change: function(){
						App.eventManager.fireEvent('sumchange');
					},
					scope:this
				}
			})
		};

		this.labStore = new Ext.data.JsonStore({
			proxy: new Ext.data.HttpProxy({
				url:'/dashboard/api/v1/lab',
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
				url:'/dashboard/api/v1/referral',
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
			editable:true
			//value:'Наличная оплата'
		});
		//var obj = this.paymentTypeCB.getStore().getAt(0);
		//console.log(obj);
		this.totalPaid = {
			layout:'form',
			border:false,
			baseCls:'x-border-layout-ct',
			items:{
				id:'total-paid-field',
				xtype:'numberfield',
				name:'total_paid',
				fieldLabel:'Всего оплачено'
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
				items:[this.discounts, this.paymentTypeCB,this.totalPaid]
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
    			value:"/dashboard/api/v1/patient/"+this.patientId || null
        }];
		
		this.types = {
			visit:[{
        			xtype:'hidden',
        			name:'cls',
        			value:'п'
        		},{
        			flex:65,
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
        			flex:35,
        			baseCls:'x-border-layout-ct',
					defaults:{
						baseCls:'x-border-layout-ct',
						border:false
					},
        			items:[this.paymentFs, this.paymentPanel]
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
				defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
        		items:items
        	},
        	tbar:[this.getPatientTitle(this.patientId),'->',{
        		text:'Закрыть',
				handler:this.onCancel.createDelegate(this,[])
        	},{
				id:'visit-print-btn',
				text:'Печать направления',
				disabled:true,
				handler:this.toPrint.createDelegate(this,[])
        	},{
				id:'visit-submit-btn',
				text:'Сохранить',
				//disabled:true,
				handler: this.onSubmit.createDelegate(this,[])
        	}]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.Form.superclass.initComponent.apply(this, arguments);
		
	
	},
	
	getTotalField: function()
	{
		return this.totalPaid.items.itemAt(0);
	},
	
	getPatientTitle : function(id){
		var p = Ext.getCmp('patient-grid');
		var rec = p.store.getById(id);
		titles = ["Пациент:",rec.data.last_name,rec.data.first_name,rec.data.mid_name];
		return titles.join(" ");
	},
	
	toPrint:function(){
		window.open('/visit/visit/'+this.visitId+'/print/');
	},
	
	onCancel:function(){
        App.eventManager.fireEvent('visitclose');
	},
	
	onSubmit:function(){
		
		this.fireEvent('visitsubmit');
		
/*		this.getForm().submit({
			url:'/dashboard/api/v1/visit',
			waitMsg:'Подождите, идет сохранение...',
			submitEmptyText: false
		})
*/		
		Ext.getCmp('visit-submit-btn').disable();
/*		var grid = Ext.getCmp('patient-visit-grid');
		//var values = [];
		var v;
		var fields = this.getForm().items;
		var values = this.getForm().getFieldValues();
		if(!this.record){
			console.dir(this.getForm().getFieldValues());
			grid.addVisit({
				patient:values.patient,
				referral:values.referral,
				source_lab:values.source_lab,
				cls:values.cls,
				total_paid:values.total_paid
			});
		} else {
			App.eventManager.fireEvent('visitwrite',this.visitRec); // listener: viewport
		}*/
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