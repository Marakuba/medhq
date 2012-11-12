Ext.ns('App.examination');
Ext.ns('App.patient');
Ext.ns('Ext.ux');

App.examination.TplTicketTab = Ext.extend(App.examination.TicketTab, {
	
	addSubSecText : 'Добавить раздел',
	
	initComponent : function() {

		this.infoTpl = new Ext.XTemplate(
			'<div class="patient-info">',
				'<div class="name">Шаблон: {name}</div>',
			'</div>'
		);
		
		this.infoPanel = new Ext.Panel({
			region:'north',
			height:23,
			baseCls:'x-plain',
			style:{
				backgroundColor:"#c9f497"
			},
			html:this.infoTpl.apply(this.tplRecord.data)
		});

		var config = {
			
		};
		
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TplTicketTab.superclass.initComponent.apply(this, arguments);
				
	},
	
	//Пользовательская функция добавления элементов в тулбар. выполняется после добавления обязательных кнопок
	fillUsersMenu: function(){
		this.deleteBtn = new Ext.Button({
			iconCls:'silk-cancel',
			text: 'Удалить шаблон',
			handler:this.onDelete.createDelegate(this),
			scope:this
		});
		this.moveArchiveBtn = new Ext.Button({
			text: 'Переместить в Мои шаблоны',
			hidden:this.fromArchive,
			handler:function(){
				this.fireEvent('movetoarhcive');
			},
			scope:this
		});
		this.closeBtn = new Ext.Button({
			iconCls:'silk-door-out',
			text: 'Закрыть шаблон',
			handler:this.onClose.createDelegate(this),
			scope:this
		});
		this.ttb.add(this.moveArchiveBtn);
		this.ttb.add(this.deleteBtn);
		this.ttb.add(this.closeBtn);
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
	
	printUrlTpl : "/widget/examination/template/{0}/",
	
	onPrint: function(){
		var url = String.format(this.printUrlTpl,this.cardId);
		window.open(url);
	},
	
	onDelete: function(){
		this.fireEvent('deletetpl')
	},
	
	onClose: function(){
		this.fireEvent('close')
	}
	
});
