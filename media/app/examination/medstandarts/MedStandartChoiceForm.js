Ext.ns('App.examination');

App.examination.MedStandartChoiceForm = Ext.extend(Ext.form.FormPanel, {

	initComponent : function() {
		this.stGrid = new App.examination.MedStandartGrid({
			mkb10:this.mkb10,
			listeners:{
				scope:this,
				standartselect:function(standart){
					this.stItemGrid.setStandart(standart)
				}
			}
		});
		
		this.stItemGrid = new App.examination.MedStandartServiceGrid({
			listeners:{
				scope:this,
				pushservices:function(records){
					this.fireEvent('pushservices',records);
				}
			}
		}); 
		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			layout:'border',
			border : true,
			listeners: {
			},
			items:[{
				xtype:'form',
				layout:'fit',
				items:[this.stGrid],
				region:'center'
			},{
				xtype:'form',
				layout:'fit',
				items:[this.stItemGrid],
				region:'east',
				width:400
			}]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.MedStandartChoiceForm.superclass.initComponent.apply(this, arguments);
	}
	
});



Ext.reg('medstandart',App.examination.MedStandartChoiceForm);