Ext.ns('App.result');


App.result.ResultCard = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		
		this.dateField = new Ext.form.DateField({
			emptyText:'дата',
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
			width:120
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
					handler:function(){
						var now = new Date();
						this.dateField.setValue(now);
						this.timeField.setValue(now);
					},
					scope:this
				},
			
				this.staffField, {
//					text:'Текущий',
					iconCls:'silk-user-go',
					tooltip:'Текущий пользователь',
					handler:function(){
						this.staffField.setValue(String.format('/api/v1/dashboard/position/{0}', active_profile));
					},
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
						Ext.MessageBox.confirm('Предупреждение!',
							new Ext.XTemplate('Внимание, данная операция приведет к удалению всех тестов, которые не были помечены как отвалидированные: ',
							'<tpl for="."><br>{#}. {analysis_name}</tpl><br><br>',
							'Продолжить?').apply(un),
							function(btn){
								if(btn=='yes') {
									params = {
										order:this.labOrderRecord.id
									}
									Ext.Ajax.request({
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
									});
								}
						}, this);
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
/*			tools:[{
				id:'help',
				handler:function(){
				},
				scope:this,
				qtip:'Посмотреть информацию о работе с данным разделом'
			}],*/
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
			this.staffField.reset();
		}
		this.dateField.setValue(d.executed);
		this.timeField.setValue(d.executed);
		this.setTitle(String.format('Результаты: {0}', rec.data.patient_name));
		this.ResultGrid.setActiveRecord(rec);
		this.items.itemAt(0).setActiveTab(0);
		this.ResultComment.getForm().findField('comment').setValue(rec.data.comment);
	},
	
	saveSDT: function(rec) {
		var d = this.dateField.getValue();
		var t = this.timeField.getValue().split(':');
		if (d) {
			d = d.add(Date.HOUR, t[0]).add(Date.MINUTE,t[1]);
		}
		var staff = this.staffField.getValue();
		if(rec) {
			rec.beginEdit();
			rec.set('executed', d ? d : '');
			rec.set('comment', this.ResultComment.getForm().findField('comment').getValue());
			if(staff) {
				rec.set('staff', staff);
			}
			rec.endEdit();
		}
	},
	
	onPrint: function() {
		var id = this.getSelected().data.id;
		var url = ['/lab/print/results',id,''].join('/');
		window.open(url);
	}


})