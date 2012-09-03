Ext.ns('App.patient');

App.patient.NotifyForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.preordNotifyCombo = new Ext.form.ComboBox({
			fieldLabel:'Предварительная запись',
			name:'preorder_notify',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['0','Не уведомлять'],
					['1','Уведомлять по SMS'],
					['2','Уведомлять по Email']
				]
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'68%',
			value:'0'
		});
		
		this.asgmtNotifyCombo = new Ext.form.ComboBox({
			fieldLabel:'Направления врачей',
			name:'assignment_notify',
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['0','Не уведомлять'],
					['1','Уведомлять по SMS'],
					['2','Уведомлять по Email']
				]
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'68%',
			value:'0'
		});
		
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
			items:[this.preordNotifyCombo,
				this.asgmtNotifyCombo]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.NotifyForm.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
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


Ext.reg('notifyform', App.patient.NotifyForm);