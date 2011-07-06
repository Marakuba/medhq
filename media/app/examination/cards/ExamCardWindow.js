Ext.ns('App.examination');

App.examination.ExamCardWindow = Ext.extend(Ext.Window, {

	initComponent: function(){
		
		this.tmp_id = Ext.id();
		
		this.form = new App.examination.ExamCardForm({
			model:this.model,
			record:this.record,
			tmp_record:this.tmp_record, //данные из шаблона
			ordered_service:this.ordered_service,
			fn:function(record){
				this.record = record;
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this
		});
		
		config = {
			iconCls:'silk-add',
			title: this.tmp_record ? 'Карта осмотра ' + this.tmp_record.data.name : 'Карта осмотра ' + this.record.data.name,
			width:800,
			height:450,
			modal:true,
			autoScroll:true,
			closeAction:'close',
			layout:'fit',
			items:[this.form],
			buttons:[{
				id:this.tmp_id+'print',
				disabled:this.record ? false : true,
				text:'Просмотр',
				handler:this.onPrint.createDelegate(this),
				scope:this
			},{
				text:'Сохранить',
				handler:this.onFormSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ExamCardWindow.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('examcardcreate', this.onExamCardCreate, this);
	},
	
	onFormSave: function() {
		this.form.onSave();
		if (this.record) {
			Ext.getCmp(this.tmp_id+'print').enable();
			App.eventManager.fireEvent('examcardgrid_reload');
		}
		
	},
	
	onClose: function() {
		this.form.isModified();
		this.close();
	},
	onPrint: function() {
		window.open('/exam/card/'+this.record.data.id+'/');
	},
	
	onExamCardCreate: function(record) {
		this.record = record;
		
	}
	
});


//Ext.reg('examcardwindow', App.ExamCardWindow);