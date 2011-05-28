Ext.ns('App.barcodepackage');

App.barcodepackage.Window = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new App.barcodepackage.Form({
			baseCls:'x-plain',
			record:this.record
		});
		
		config = {
			title:'Пакет штрих-кодов',
			width:400,
			autoHeight:true,
			items: this.form,
			modal:true,
			padding:5,
			buttons:[{
				text:'Сохранить',
				handler:function(){
					this.fireEvent('submit');
					var f = this.form.getForm(); 
					if(this.record){
						f.updateRecord(this.record);
						
					} else {
						var s = this.store;
						var Package = s.recordType;
						var p = new Package();
						f.items.each(function(item) {
			                var value = item.getValue();
			                if ( value.getGroupValue ) {
			                    value = value.getGroupValue();
			                }
							p.set(item.name, value);
						});				
						s.insert(0,p);
					}
					this.close();
					//
				},
				scope:this
			},{
				text:'Отмена',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.Window.superclass.initComponent.apply(this, arguments);
	}

});