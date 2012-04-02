Ext.ns('App.insurance');

App.insurance.PolicyWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.policyGrid = new App.insurance.PolicyGrid({
				record:this.patientRecord,
				showChoiceButton:true,
				fn:function(uri){
					Ext.callback(this.fn, this.scope || window, [uri]);
				},
				scope:this
			});
		config = {
			title:'Полисы ДМС',
			width:500,
			height:300,
			layout:'fit',
			items: this.policyGrid,
			modal:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.insurance.PolicyWindow.superclass.initComponent.apply(this, arguments);

		this.policyGrid.on('policyselect', function(uri){
			this.fireEvent('policyselect', uri);
			this.close();
		},this);
	}

});