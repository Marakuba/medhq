Ext.ns('App.patient');

App.patient.AsgmtListWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.dataForm = new Ext.FormPanel({
			border:false,
			standardSubmit: true,
			url:'/scheduler/asgmtlist/',
			items:[{
				xtype:'hidden',
				name:'id_list'
			}],
			method:'POST'
		});
		
		config = {
			title:'Печать реестра',
			width:300,
			autoHeight:true,
			border:false,
			items: [{
				xtype:'box',
				html:'Печатать реестр направлений?',
				border:false,
				baseCls:'x-clear'
			}, this.dataForm],
			modal:true,
			buttons:[{
				text:'Печать',
				handler:function(){
					var form = this.dataForm.getForm();
					form.findField('id_list').setValue(this.idList);
					var el = form.getEl().dom;
				    var target = document.createAttribute("target");
				    target.nodeValue = "_blank";
				    el.setAttributeNode(target);
				    el.action = form.url;
				    el.submit();
				    this.close();
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
		App.patient.AsgmtListWindow.superclass.initComponent.apply(this, arguments);
	}

});