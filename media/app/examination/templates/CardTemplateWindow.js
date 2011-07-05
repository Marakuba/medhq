Ext.ns('App.examination');

App.examination.CardTemplateWindow = Ext.extend(Ext.Window, {

	initComponent: function(){
		
		this.form = new App.examination.CardTemplateForm({
			model:this.model,
			record:this.record,
			fn:function(record){
				this.record = record;
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this
		});
		
		config = {
			iconCls:'silk-add',
			title:'Шаблон',
			width:800,
			height:450,
			modal:true,
			closeAction:'close',
			layout:'fit',
			items:[this.form],
			buttons:[{
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
		App.examination.CardTemplateWindow.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('cardtemplatecreate', this.onCardTemplateCreate, this);
	},
	
	onFormSave: function() {
		this.form.onSave();
	},
	
	onClose: function() {
		this.form.isModified();
		this.close();
	},
	
	onCardTemplateCreate: function(record) {
		this.record = record;
	}
	
});


//Ext.reg('cardtemplatewindow', App.CardTemplateWindow);