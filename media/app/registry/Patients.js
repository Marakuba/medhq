Ext.ns('App');

App.Patients = Ext.extend(Ext.Panel, {
	initComponent:function(){
		
		this.patientGrid = new App.patient.PatientGrid({
			region:'center'
		});
		
		this.patientCard = new App.patient.PatientCard({
			region:'center'
		});

		this.cardPanel = new Ext.Panel({
			region:'center',
			border:false,
			title:'Выберите пациента',
			layout:'fit',
			tools:[{
				id:'refresh',
				handler:function(){
					this.patientCard.doRefresh();
				},
				scope:this,
				qtip:'Обновить карточку пациента'
			}],
			items:this.patientCard
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
		
		this.patientGrid.on('patientselect', this.patientSelect, this);

	},
	
	titleTpl : new Ext.XTemplate(
		'Пациент: ',
		'{last_name} {first_name} {mid_name}. ',
		'Скидка: {discount_name}. ',
		'Общая сумма: {billed_account}. ',
		'Баланс: <FONT COLOR="red">{balance}</FONT>. ',
		'{ad_source_name:this.isEmpty}',
		{
			isEmpty:function(v){
				return v ? '' : '<span class="warn">Спросить источник рекламы!</span>'
			}
		}
	),
	
	patientSelect: function(rec){
		this.cardPanel.setTitle(this.titleTpl.apply(rec.data));
		this.quickForm.setActiveRecord(rec);
		this.patientCard.setActivePatient.createDelegate(this.patientCard,[rec])();
	}
});

Ext.reg('patients', App.Patients);