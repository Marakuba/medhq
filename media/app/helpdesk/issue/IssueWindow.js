Ext.ns('App.issue');

App.issue.IssueWindow = Ext.extend(Ext.Window, {
	
	initComponent: function(){
		
		this.form = new App.issue.IssueForm({
			model:this.model,
			record:this.record,
			fn:function(record){
				this.record = record;
				Ext.callback(this.fn, this.scope || window, [this.record]);
			},
			scope:this
		});
		
		config = {
			iconCls:this.record ? 'silk-pencil' : 'silk-add',
			title:'Тикет',
			width:650,
			height:450,
			modal:true,
			closeAction:'close',
			layout:'fit',
			defaults: {
				baseCls:'x-plain'
			},
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
		App.issue.IssueWindow.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('companycreate', this.onCompanyCreate, this);
	},
	
	onFormSave: function() {
		this.form.onSave();
	},
	
	onClose: function() {
		this.close();
	},
	
	onCompanyCreate: function(record) {
		this.record = record;
	}
	
});