Ext.ns('App.assignment');

App.assignment.DeletePromptWindow = Ext.extend(Ext.Window, {

	initComponent:function(){


		this.store = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : App.getApiUrl('scheduler','rejection_cause'),
			model: [{name:'resource_uri'},
					{name:'id'},
					{name:'name'}]
		});

		this.infoText = this.manyRecords ? 'Внимание! Будут удалены все выделенные записи!':'';

		this.causeCombo = new Ext.form.LazyComboBox({
        	fieldLabel:'Причина отказа',
			anchor:'98%',
        	name:'insurance_policy',
        	emptyText:'Выберите причину отказа',
        	store:this.store,
		    displayField: 'name'
		});

		this.form = new Ext.form.FormPanel({
			layout:'fit',
			items:[this.causeCombo]
		})

		config = {
			title:'Удаление записи',
			width:300,
			autoHeight:true,
			border:false,
			items: [
				{
				xtype:'box',
				html:this.infoText,
				border:false,
				baseCls:'x-clear'
			}, this.form
			],
			modal:true,
			buttons:[{
				text:'Удалить',
				handler:function(){
					var cause = this.causeCombo.getValue();
					var form = this.form.getForm();
					if(this.fn) {
						Ext.callback(this.fn, this.scope || window, [cause]);
					}
				    this.close();
				},
				scope:this
			},{
				text:'Отмена',
				handler:function(){
					if(this.fn) {
						Ext.callback(this.fn, this.scope || window, []);
					}
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assignment.DeletePromptWindow.superclass.initComponent.apply(this, arguments);
	}

});
