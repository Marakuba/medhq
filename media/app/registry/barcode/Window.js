Ext.ns('App.barcode');

App.barcode.PrintWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.grid = new App.barcode.Grid({
			visitId:this.visitId
		});
		
		config = {
			title:'Печать штрих-кодов, прием №'+this.record.data.barcode,
			width:600,
			autoHeight:true,
			items: this.grid,
			modal:true,
			buttons:[{
				text:'Печатать',
				handler:function(){
					this.fireEvent('submit');
					if(ws) {
						c = this.grid.getCount();
						params = [this.record.data.barcode,"KIM",c];
						ws.send(params.join("::"));
					}
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