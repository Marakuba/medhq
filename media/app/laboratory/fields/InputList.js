Ext.ns('App.fields');

App.fields.InputList = Ext.extend(Ext.form.ComboBox,{
	
	initComponent:function(){
		config = {
			store:new Ext.data.ArrayStore({
				fields:['title']
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'title',
			displayField:'title',
			mode: 'local',
			forceSelection:false,
			selectOnFocus:true,
			editable:true	
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.fields.InputList.superclass.initComponent.apply(this, arguments);
	}

});

Ext.reg('inputlistfield', App.fields.InputList);