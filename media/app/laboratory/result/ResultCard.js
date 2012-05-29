Ext.ns('App.result');


App.result.ResultCard = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		
		this.infoTpl = new Ext.XTemplate(
			'<h1>',
				'<span id="last_name" class = "last_name">{last_name}</span>',
				' ','<span id="first_name" class="first_name">{first_name}</span>',
				' ', '<span id="mid_name" class="mid_name">{mid_name}</span>',
			'</h1> ',
			'<div>',
				'Дата рождения: ','<span id="birth_day" class="birth_day">{birth_day:this.parseDate}</span>',
				'<br>',
				' Возраст: <span id="age" class="age">{age}</span>',
				'<br>',
				' Пол: <span id="gender" class="gender">{gender}</span>',
			'</div> ',
			'<div>',
				'<span>{order_info}</span> ',
			'</div>',
			{
				parseDate : function(v){
					return Ext.util.Format.date(v,'d.m.Y')
				},
				
				nullFormatter: function(v) 
		    		{ return v ? v : 'не указано'; }
			}
		),
		
		this.dateField = new Ext.form.DateField({
			emptyText:'дата',
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			format:'d.m.Y',
			width:80
		});
		
		this.timeField = new Ext.form.TimeField({
			emptyText:'время',
			width:55,
			format:'H:i'
		});
		
		this.staffField = new Ext.form.LazyComboBox({
			emptyText:'врач',
			store: new Ext.data.JsonStore({
				autoLoad:true,
				proxy: new Ext.data.HttpProxy({
					url:get_api_url('position'),
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name','title']
			}),
			displayField:'name',
			width:200
		});
		
		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
//			disabled:true,
			handler:function(){
				var rec = this.labOrderRecord;
				if(rec) {
					var url = String.format('/lab/print/results/{0}/?preview=yes', rec.id);
					window.open(url);
				}
			},
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({ 
			items:[this.dateField, this.timeField, {
//					text:'Сейчас',
					iconCls:'silk-date-go',
					tooltip:'Устанавливает текущую дату и время',
					handler:this.setDateTime.createDelegate(this),
					scope:this
				},
			
				this.staffField, {
//					text:'Текущий',
					iconCls:'silk-user-go',
					tooltip:'Текущий пользователь',
					handler:this.setStaff.createDelegate(this),
					scope:this
				},
				
			new Ext.Toolbar.Separator(), {
					iconCls:'icon-save',
//					text:'Сохранить черновик',
					handler:function(){
						if(this.labOrderRecord){
							this.saveSDT(this.labOrderRecord);
						}
					},
					scope:this
				},this.printBtn,'-',{
					iconCls:'silk-accept',
					text:'Подтвердить',
					handler: function(){
						if(this.labOrderRecord){
							this.saveSDT(this.labOrderRecord);
						}
						var un = [];
						var records = [];
						var q = this.ResultGrid.store.queryBy(function(record,id){
							return record.data.validation == 0;
						});
						q.each(function(rec,i){
							un.push(rec.data);
							records.push(rec);
						},this);		
						if(un.length){
							Ext.MessageBox.confirm('Предупреждение!',
								new Ext.XTemplate('Внимание, данная операция приведет к удалению всех тестов, которые не были помечены как отвалидированные: ',
								'<tpl for="."><br>{#}. {analysis_name}</tpl><br><br>',
								'Продолжить?').apply(un),
								function(btn){
									if(btn=='yes') {
										this.confirm();
									}
							}, this);
						} else {
							this.confirm();
						}
					},
					scope:this
				},'->',{
//					text:'Восстановить',
					iconCls:'silk-arrow-undo',
					handler:function(){
						var s = this.ResultGrid.store;
						Ext.MessageBox.confirm('Подтверждение',
							'Восстановить все тесты?',
							function(btn){
								if(btn=='yes') {
									Ext.Ajax.request({
										url:'/lab/revert_results/',
										params:{
											laborder:this.labOrderRecord.id
										},
										method:'POST',
										success:function(response, opts) {
											var r = Ext.decode(response.responseText);
											this.labOrderRecord.set('is_completed',r.status);
											this.ResultGrid.store.reload();
										},
										failure: function(response, opts) {
										},
										scope:this
									});
								}
						}, this);
					},
					scope:this
				}]
		}); 
		
		this.ResultGrid = new App.result.ResultGrid({
			id:'lab-result-grid',
			closable:false
		});
		this.ResultComment = new Ext.form.FormPanel({
			layout:'fit',
			title:'Комментарий',
			padding:5,
			items:[{
				xtype:'htmleditor',
				name:'comment'
			}]
		});
		
		config = {
			border:false,
			title:'Результаты',
			layout:'fit',
			tbar:this.ttb,
			tools:[{
				id:'help',
				handler:this.showPatientInfo.createDelegate(this,[]),
				scope:this,
				qtip:'Посмотреть информацию о пациенте'
			}],
			items:new Ext.TabPanel({
				border:false,
				tabPosition:'bottom',
				activeTab:0,
				items:[this.ResultGrid,this.ResultComment]
			})
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.ResultCard.superclass.initComponent.apply(this, arguments);

	},
	
	setActiveRecord: function(rec) {
		this.labOrderRecord = rec;
		var d = rec.data;
		if(d.staff) {
			this.staffField.setValue(d.staff);
		} else {
			this.staffField.setRawValue('');
			this.staffField.originalValue='';
			this.staffField.value='';
			this.staffField.reset();
		}
		this.dateField.setValue(d.executed);
		this.timeField.setValue(d.executed);
		this.setTitle(String.format('Результаты: {0}, {2} &nbsp;&nbsp;&nbsp; {1}', 
				rec.data.patient_name, rec.data.info, rec.data.patient_age));
		this.ResultGrid.setActiveRecord(rec);
		this.items.itemAt(0).setActiveTab(0);
		this.ResultComment.getForm().findField('comment').setValue(rec.data.comment);
	},
	
	setDateTime : function() {
		var now = new Date();
		this.dateField.setValue(now);
		this.timeField.setValue(now);
		return now
	},
	
	setStaff : function() {
		var staff = App.getApiUrl('position',active_profile);
		var sf = this.staffField;
		sf.setValue(staff);
		return staff
	},
	
	saveSDT: function(rec) {
		var d = this.dateField.getValue();
		var t = this.timeField.getValue().split(':');
		if (!d) {
			d = this.setDateTime();
		} else {
			d = d.add(Date.HOUR, t[0]).add(Date.MINUTE,t[1]);
		}
		var staff = this.staffField.getValue();
		if(!staff){
			staff = this.setStaff();
		}
		if(rec) {
			rec.beginEdit();
			rec.set('executed', d);
			rec.set('comment', this.ResultComment.getForm().findField('comment').getValue());
			rec.set('staff', staff || null);
			rec.endEdit();
		}
	},
	
	confirm : function() {
		params = {
			order:this.labOrderRecord.id
		}
		App.direct.lab.confirmResults(this.labOrderRecord.id, function(r, e){
			this.ResultGrid.store.reload();
			if(r.success) {
				this.labOrderRecord.set('is_completed',true);
				Ext.ux.Growl.notify({
			        title: "Успешная операция!", 
			        message: r.message,
			        iconCls: "x-growl-accept",
			        alignment: "tr-tr",
			        offset: [-10, 10]
			    })
			}
		}, this);
		
/*		Ext.Ajax.request({
			url:'/lab/confirm_results/',
			params:params,
			method:'POST',
			success:function(response, opts) {
				var r = Ext.decode(response.responseText);
				this.ResultGrid.store.reload();
				if(r.success) {
					this.labOrderRecord.set('is_completed',true);
					Ext.ux.Growl.notify({
				        title: "Успешная операция!", 
				        message: r.message,
				        iconCls: "x-growl-accept",
				        alignment: "tr-tr",
				        offset: [-10, 10]
				    })
				}
			},
			failure: function(response, opts) {
			},
			scope:this
		});*/
	},
	
	onPrint: function() {
		var id = this.getSelected().data.id;
		var url = ['/lab/print/results',id,''].join('/');
		window.open(url);
	},
	
	showPatientInfo: function(){
		var rec = this.labOrderRecord;
		App.direct.lab.getPatientInfo(rec.id, function(res,e){
			var data = res.data;
			Ext.apply(data,{
				'age':rec.data.patient_age,
				'order_info': rec.data.info
				});
			this.infoTpl.apply(data);
			var infoPanel = new Ext.Panel({
				frame: false,
				border:false,
		    	html:'dsf',
		    	bodyBorder: false,
		    	bodyStyle: 'background:transparent'
		    });
			var patientInfoWin = new Ext.Window({
				modal:true,
				layout:'form',
				height:300,
				width:300,
				closable:true,
				items:[
					infoPanel
				]
			});
			patientInfoWin.show();
			this.infoTpl.overwrite(infoPanel.body,data);
		},this)
		
		
	}


})