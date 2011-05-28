Ext.ns('App');

App.PrintWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new Ext.form.FormPanel({
			items:[{
				xtype:'checkbox',
				boxLabel:'Счет к приему №'+this.visitId,
				checked:true
			},{
				xtype:'checkbox',
				boxLabel:'Штрих-коды',
				checked:true
			},{
				xtype:'checkbox',
				boxLabel:'Направление в процедурный кабинет',
				checked:true
			}]
		});
		
		config = {
			title:'Выбор документов для печати',
			width:500,
			autoHeight:true,
			items: this.form,
			modal:true,
			buttons:[{
				text:'Печатать',
				handler:function(){
					this.fireEvent('submit');
				},
				scope:this
			},{
				text:'Отмена'
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.PrintWindow.superclass.initComponent.apply(this, arguments);
	}

});