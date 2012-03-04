Ext.ns('App.laboratory');


App.laboratory.ScannerWindow = Ext.extend(Ext.Window, {
	initComponent: function(){
		this.form = new Ext.form.FormPanel({
			defaults:{
				border:false,
				baseCsl:'x-plain'
			},
			height:60,
			labelWidth:130,
			padding:10,
			items:[{
				xtype:'textfield',
				name:'barcode',
				width:200,
				fieldLabel:'Штрих-код образца',
				style:{
					fontSize:'2em',
					height:'1.3em'
				},
				listeners: {
	                specialkey: function(field, e){
	                    if (e.getKey() == e.ENTER) {
	                        this.checkSpecimen();
	                    }
	                },
	                scope:this
	            }
			}],
			getBarcode:function(){
				return this.getForm().findField('barcode')
			},
			scope:this
		});
		
		this.info = new Ext.Panel({
			flex:1,
			border:false,
			style:{
				textAlign:'center',
				fontSize:'3em'
			}
		});
		
		config = {
			title:'Проверка образца',
			width:400,
			height:280,
			layout:{
				type:'vbox',
				align:'stretch'
			},
			defaults:{
				border:false,
				baseCsl:'x-plain'
			},
			items:[this.form,this.info],
			buttons:[{
				text:'Проверить...',
				handler:this.checkSpecimen.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}]
				
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.ScannerWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			this.form.getBarcode().focus(false, 300);
			this.mask = new Ext.LoadMask(this.info.getEl(), {
				msg:'Подождите...'
			});
		}, this);

	},
	
	checkSpecimen : function(){
		this.mask.show();
		App.direct.lab.getSpecimenStatus(this.form.getBarcode().getValue(), function(res,e){
			this.mask.hide();
			this.info.update(res.data.next);
			this.form.getBarcode().focus(true, 300);
		}, this);
	}
});