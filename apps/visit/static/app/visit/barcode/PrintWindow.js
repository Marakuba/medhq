Ext.ns('App.barcode');

App.barcode.PrintWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.grid = new App.barcode.Grid({
			visitId:this.visitId
		});
		
		config = {
			title:'Печать штрих-кодов, прием №'+this.record.data.barcode_id,
			width:600,
			autoHeight:true,
			items: this.grid,
			modal:true,
			buttons:[{
				text:'Печатать',
				handler:function(){
					this.fireEvent('submit');
					
					if(App.WebSocket && App.WebSocket.readyState!==0){
						c = this.grid.getCount();
						params = [this.record.data.barcode_id,"Euromed",c,this.patient.data.lat];
						App.WebSocket.send(params.join("::"));
					} else {
						Ext.MessageBox.alert('Ошибка','Принтер штрих-кодов не подключен!');
					}
					this.close();
					//var url = "/numeration/forvisit/" + this.visitId + "/";
					//window.open(url);
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
		App.barcode.PrintWindow.superclass.initComponent.apply(this, arguments);
	}

});