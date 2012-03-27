Ext.ns('App.patient');

App.patient.IDCardForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		config = {
			baseCls:'x-plain',
			border:false,
			defaults: {
				border:false,
				baseCls:'x-plain'
			},
			bodyStyle:'padding:5px',
			layout:'form',
			labelWidth:115,
			items:[{
				xtype:'hidden',
				name:'id_card_type',
				value:'1'
			},{
				xtype:'compositefield',
				items:[{
					xtype:'textfield',
					name:'id_card_series',
					width:50,
					maxLength:6, 
	            	fieldLabel: 'Серия',
	            	allowBlank:true,
	            	value: ''
				},{
					xtype:'textfield',
					name:'id_card_number',
					maxLength:10,
					width:78,
	            	fieldLabel: 'Номер',
	            	value: '',
	            	allowBlank:true
				}]
			},{
				xtype:'datefield',
				name:'id_card_issue_date',
				format:'d.m.Y',
				plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
				minValue:new Date(1901,1,1),
            	fieldLabel: 'Дата выдачи',
            	allowBlank:true
			},{
				xtype:'textarea',
				name:'id_card_org',
				maxLength:200,
            	fieldLabel: 'Кем выдан',
            	value: '',
            	width:300
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.IDCardForm.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
//			if(this.record) {
//				this.getForm().loadRecord(this.record);
//			}
			var field = this.getForm().findField('id_card_series');
			var value = field.getValue();
		},this);
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
			console.log(this.record)
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	getSteps : function() {
		var steps = 0;
		if(this.getForm().isDirty()) {
			steps+=1;
		}
		return 0;
	}

});


Ext.reg('idcardform', App.patient.IDCardForm);