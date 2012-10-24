Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.CardTicketTab = Ext.extend(App.examination.TicketTab, {
	
	addSubSecText : 'Добавить раздел',
	
	initComponent : function() {
		this.infoTpl = new Ext.XTemplate(
			'<div class="patient-info">',
				'<div class="info">Заказ: <span>{barcode}</span> &nbsp;&nbsp;&nbsp; Дата: <span>{created_date}</span></div>',
				'<div class="name">{patient_full}</div>',
			'</div>'
		);
		
		this.infoPanel = new Ext.Panel({
			region:'north',
			height:23,
			baseCls:'x-plain',
			style:{
//				backgroundColor:"#CCDBEE"
			},
			html:this.infoTpl.apply(this.orderRecord.data)
		});
		
		
		var config = {
			
		};
		
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardTicketTab.superclass.initComponent.apply(this, arguments);
				
	},
	
	//Пользовательская функция добавления элементов в тулбар. выполняется после добавления обязательных кнопок
	fillUsersMenu: function(){
		this.historyBtn = new Ext.Button({
			iconCls:'silk-package',
			text: 'История пациента',
			handler:this.onHistoryOpen.createDelegate(this),
			scope:this
		});
		this.ttb.add(this.historyBtn);
		this.doLayout();
	},
	
	
	setCardId: function(cardId){
		this.cardId = cardId;
		this.printBtn.enable();
		this.portalColumn.items.each(function(ticket){
			if (ticket.setCardId){
				ticket.setCardId(cardId);
			}
		})
	},
	
	fillUserBody: function(){
		this.add(this.infoPanel);
		this.doLayout();
	},
	
	printUrlTpl : "/widget/examination/card/{0}/",
	
	onPrint: function(){
		var url = String.format(this.printUrlTpl,this.cardId);
		window.open(url);
	},
	
	onHistoryOpen: function(){
//		var name = this.patient_name.split(' ');
		
		config = {
			closable:true,
//			title:name[0] + ': История',
    		patientId:this.patientId
//    		patient_name: this.patient_name,
//			staff:this.staff
		}
//		App.eventManager.fireEvent('launchapp', 'patienthistory',config);
	}
});
