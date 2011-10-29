Ext.ns('App.cards');

App.cards.Sperm = Ext.extend(App.cards.BaseCard,{
	initComponent: function(){
		
		this.form = new Ext.form.FormPanel({
			border:false,
			padding:4,
			items:[{
				layout:{
					type:'hbox',
					align:'stretch'
				},
				padding:10,
				border:false,
				height:42,
				defaults:{
					border:false,
					flex:1
				},
				items:[{
					layout:'form',
					labelWidth:200,
					items:{
						xtype:'inputlistfield',
						fieldLabel:'Воздержание',
						name:'CONT',
						anchor:'95%'
					}
				},{
					xtype:'spacer'
				}]
			},{
				xtype:'fieldset',
				title:'Исследование семенной плазмы',
//				border:true,
				defaults:{
					layout:{
						type:'hbox',
						align:'stretch'
					},
					border:false,
					defaults:{
						border:false,
						layout:'form',
						labelWidth:200,
						flex:1,
						defaults:{
							xtype:'inputlistfield',
							anchor:'95%'
						}
					},
					height:25,
				},
				items:[{
					items:[{
						items:{
							fieldLabel:'Объем',
							name:'VOL'
						},
					},{
						items:{
							fieldLabel:'Консистенция',
							name:'CONS'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Цвет',
							name:'COL'
						},
					},{
						items:{
							fieldLabel:'рН',
							name:'PH'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Концентрация лейкоцитов',
							name:'LEUK'
						},
					},{
						items:{
							fieldLabel:'Эритроциты',
							name:'ERT'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Агглютинация сперматозоидов',
							name:'AGGL'
						}
					},{
						xtype:'spacer'
					}]
				}]
			},{
				xtype:'fieldset',
				title:'Исследование сперматозоидов',
				defaults:{
					border:false,
				},
				items:[{
					defaults:{
						layout:{
							type:'hbox',
							align:'stretch'
						},
						border:false,
						defaults:{
							border:false,
							layout:'form',
							labelWidth:200,
							flex:1,
							defaults:{
								xtype:'inputlistfield',
								anchor:'95%'
							}
						},
						height:25,
					},
					items:[{
						items:[{
							items:{
								fieldLabel:'Концентрация сперматозоидов',
								name:'CONC'
							},
						},{
							items:{
								fieldLabel:'Подвижность (%)',
								name:'MOB'
							},
						}]
					},{
						items:[{
							items:{
								fieldLabel:'А - быстрые прогрессивные',
								name:'MOBA'
							},
						},{
							items:{
								fieldLabel:'С - движение на месте',
								name:'MOBC'
							},
						}]
					},{
						items:[{
							items:{
								fieldLabel:'В - медленные прогрессивные',
								name:'MOBB'
							},
						},{
							items:{
								fieldLabel:'D - неподвижные',
								name:'MOBD'
							},
						}]
					}]
				}]
			},{
				xtype:'fieldset',
				title:'Заключение',
				padding:0,
				defaults:{
					border:false,
					layout:{
						type:'hbox',
						align:'stretch'
					},
					height:25,
					defaults:{
						border:false,
						defaults:{
							xtype:'inputlistfield',
							border:false,
							anchor:'95%'
						},
						layout:'form',
						labelWidth:200,
						flex:1
					}
				},
				items:[{
					items:[{
						items:{
							fieldLabel:'Нормальный эякулят',
							name:'NORM'
						},
					},{
						items:{
							fieldLabel:'Астенозооспермия',
							name:'ASZS'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Нормальный с агглютинацией',
							name:'NRMA'
						},
					},{
						items:{
							fieldLabel:'Криптозооспермия',
							name:'KZS'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Тератозооспермия',
							name:'TZS'
						},
					},{
						items:{
							fieldLabel:'Азооспермия',
							name:'AZS'
						},
					}]
				},{
					items:[{
						items:{
							fieldLabel:'Олигозооспермия',
							name:'OZS'
						},
					},{
						items:{
							fieldLabel:'Аспермия',
							name:'AS'
						},
					}]
				}]
			}]
		});
		
		config = {
			title:'Спермограмма',
			items:[this.form]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.Sperm.superclass.initComponent.apply(this, arguments);
		
		if(this.record && this.service) {
			this.store.setBaseParam('order',this.record.id);
			this.store.setBaseParam('analysis__service',this.service);
			this.store.load({
				callback:function(r, opts, success){
					Ext.each(r, function(rec){
						var code = rec.data.analysis_code;
						var field = this.form.getForm().findField(code);
						if(field) {
							var s = field.getStore();
							if(s){
					    		s.loadData(rec.data.inputlist);
							}
							field.setValue(rec.data.value);
						}
					}, this);
				},
				scope:this
			})
		}
	},
	
	onSave: function(){
		this.store.each(function(rec){
			var code = rec.data.analysis_code;
			var field = this.form.getForm().findField(code);
			if(field) {
				var val = field.getValue();
				rec.set('value',val);
				rec.set('validation', val ? 1 : 0);
			}
		}, this);
		this.store.save();
	}
	
});


Ext.reg('spermmanualtest',App.cards.Sperm);