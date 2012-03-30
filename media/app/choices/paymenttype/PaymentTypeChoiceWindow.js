Ext.ns('App.choices');

App.choices.PaymentTypeChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
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
		
		
		this.payerCmb = new Ext.form.LazyComboBox({
	        	fieldLabel:'Плательщик',
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
		})
		
		
		this.payerBar = new Ext.Panel({
			layout:'hbox',
			hidden:this.record ? this.record.data.payment_type!='б' : true,
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items:[{
				flex:1,
				layout:'form',
				items:this.payerCmb
			}]			
		});
		
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
					this.payerBar,
					{
						layout:'form',
						border:false,
						baseCls:'x-border-layout-ct',
						items:this.totalSum
					}
				]
			}
		};
		
		config = {
			width:700,
			height:500,
			modal:true,
			layout:'fit',
			title:'Штрих-коды',
			items:[
				this.paymentFs
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.PaymentTypeChoiceWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('beforeclose',function(){
			if (!this.sended){
				Ext.callback(this.fn, this.scope || window, []);
			}
		},this)
		
	},
	
	onPaymentTypeChoice : function(rec){
		
		switch(rec.data.id){
			case 'д':
				this.hidePaymentCmb('payer');
				this.showPaymentCmb('policy');
				this.reloadTree(rec.data.id);
				this.rePrice(rec.data.id);
				break
			case 'б':
				this.servicePanel.getLoader().baseParams['payment_type'] = rec.data.id;
				this.hidePaymentCmb('policy');
				this.showPaymentCmb('payer');
				break
			case 'н':
				this.hidePaymentCmb('policy');
				this.hidePaymentCmb('payer');
				this.reloadTree(rec.data.id);
				this.rePrice(rec.data.id);
				break
			default:
				this.hidePaymentCmb('policy');
				this.hidePaymentCmb('payer');
				this.reloadTree(rec.data.id);
				this.rePrice(rec.data.id);
				break
		};
		
	},
	
	hidePaymentCmb: function(type){
		if (!type) return false
		this[type+'Cmb'].allowBlank = true;
		this[type+'Cmb'].setRawValue('');
    	this[type+'Cmb'].originalValue = '';
    	this[type+'Cmb'].value = '';
		this[type+'Cmb'].reset();
		this[type+'Bar'].hide();
	},
	
	showPaymentCmb: function(type){
		if (!type) return false
		this[type+'Cmb'].allowBlank = false;
		this[type+'Bar'].show();
	},
});