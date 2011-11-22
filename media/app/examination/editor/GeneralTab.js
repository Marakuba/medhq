Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.GeneralTab = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {
		
		this.printNameField = new Ext.form.TextField({
			fieldLabel:'Заголовок для печати',
			width: 200,
			listeners:{
				'change': function(field,newValue,oldValue){
					this.fireEvent('printnamechange',newValue,oldValue)
				},
			scope:this
			}
		});
		
		this.dltBtn = new Ext.Button({
			text: 'Удалить шаблон',
			handler:function(){
				this.fireEvent('deletetmp')
			},
			scope:this
		});
		this.moveArchiveBtn = new Ext.Button({
			text: 'Переместить в архив',
			handler:function(){
				this.fireEvent('movearhcivetmp')
			},
			scope:this
		});
		
		this.reviewBtn = new Ext.Button({
			text: 'Просмотр',
			handler:function(){
				this.fireEvent('reviewtmp')
			},
			scope:this
		});
		
		this.centralPanel = new Ext.Panel({
			layout:'form',
			region: 'center',
			items:[this.printNameField]
		});
		
		this.menuPanel = new Ext.Panel({
			region: 'east',
			baseCls: 'x-plane',
			margins: '5 5 5 5',
//			frame:true,
			height:500,
			width:200,
	 		layout: {
	            type:'vbox',
	            padding:'10',
	            align:'stretch'
	        },
	        defaults:{margins:'5 5 5 0'},
	        scale: 'large',
			items:[this.reviewBtn,
				this.moveArchiveBtn,
				this.dltBtn
				]
		});
		
    	
		var config = {
			title: 'Общая',
			layout: 'border',
//			labelWidth: 70,
			border:false,
     		items: [
				this.centralPanel,
				this.menuPanel
     		]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.GeneralTab.superclass.initComponent.apply(this, arguments);
	},
	
	setPrintName: function (text){
		this.printNameField.setValue(text);
	}
	
});
