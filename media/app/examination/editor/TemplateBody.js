Ext.ns('App.examination');


App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.anamnesisBody = new Ext.Panel({
			title:'Анамнез'
		});
		this.diagnosisBody = new Ext.Panel({
			title:'Диагноз'
		});
		this.conclusionBody = new Ext.Panel({
			title:'Заключение'
		});
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[this.anamnesisBody,
				this.diagnosisBody,
				this.conclusionBody]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('templatebody',App.examination.TemplateBody);