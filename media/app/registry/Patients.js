Ext.ns('App');

App.Patients = Ext.extend(Ext.Panel, {
	initComponent:function(){
		
		this.patientGrid = new App.patient.PatientGrid({
			region:'center'
		});
		
		this.patientCard = new App.patient.PatientCard({
			region:'center'
		});
		
		this.defaultTitle = 'Выберите пациента';

		this.cardPanel = new Ext.Panel({
			region:'center',
			border:false,
			title:this.defaultTitle,
			layout:'fit',
			tools:[{
				id:'refresh',
				handler:this.updatePatientInfo.createDelegate(this),
				scope:this,
				qtip:'Обновить карточку пациента'
			},{
				id:'close',
				handler:function(){
					this.cardPanel.remove(this.patientCard);
					this.patientCard = new App.patient.PatientCard({
						region:'center'
					});
					this.initEvents();
					this.cardPanel.setTitle(this.defaultTitle);
					this.cardPanel.add(this.patientCard);
					this.cardPanel.doLayout();
				},
				scope:this,
				qtip:'Закрыть карту'
			}],
			items:[this.patientCard]
		});

		this.quickForm = new App.patient.QuickForm({
			region:'south'
		});
		
		config = {
			id:'patients',
			title:'Пациенты',
			layout:'border',
            defaults: {
				border:false
			},
			items:[this.cardPanel, {
				region:'west',
				width:'30%',
				split:true,
				layout:'border',
				items:[this.patientGrid, this.quickForm]
			}]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Patients.superclass.initComponent.apply(this, arguments);
		
		this.initEvents();
		
		App.eventManager.on('balanceupdate', this.updatePatientInfo, this); //
		App.eventManager.on('refundclose', this.updatePatientInfo, this); //
		this.on('destroy', function(){
			App.eventManager.un('balanceupdate', this.updatePatientInfo, this); //
			App.eventManager.un('refundclose', this.updatePatientInfo, this); //
		},this);

	},
	
	initEvents : function() {
		this.patientGrid.on('patientselect', this.patientSelect, this);
	},
	
	titleTpl : App.settings.strictMode ? new Ext.XTemplate(
			'Пациент: ',
			'{last_name} {first_name} {mid_name}',
			{}
		) : new Ext.XTemplate(
		'Пациент: ',
		'{last_name} {first_name} {mid_name}. ',
		'Скидка: {discount_name}. ',
		'Общая сумма: {billed_account}. ',
		'Баланс: <span style="color:{color}">{balance}</span>. ',
		'{ad_source_name:this.isEmpty}',
		{
			isEmpty:function(v){
				return v ? '' : '<span class="warn">Спросить источник рекламы!</span>'
			}
		}
	),
	
	updatePatientInfo : function(){
		var rec = this.patientCard.record;
		if(rec){
			App.direct.patient.updatePatientInfo(rec.id, function(res,e){
				var data = res.data;
				rec.beginEdit();
				for(k in data){
					rec.set(k,data[k]);
//					console.info(k,data[k]);
				}
//				console.info(rec.data);
//				rec.endEdit();
				this.patientSelect(rec);
//				this.patientCard.doRefresh();
			}, this);
		}
	},
	
	patientSelect: function(rec){
		var d = {};
		Ext.apply(d, rec.data);
		if(rec.data.balance>0) {
			d.color='green';
		} else if(rec.data.balance==0) {
			d.color='';
		} else {
			d.color='red';
		}
		this.cardPanel.setTitle(this.titleTpl.apply(d));
		this.quickForm.setActiveRecord(rec);
		this.patientCard.setActivePatient.createDelegate(this.patientCard,[rec])();
	}
});

Ext.reg('patients', App.Patients);