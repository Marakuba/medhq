Ext.ns('App','App.cashier','App.ws');

WEB_SOCKET_SWF_LOCATION = "/media/app/web-socket-js/WebSocketMain.swf";
WEB_SOCKET_DEBUG = true;

function websocket_init() {

  // Поднимаем Web Socket.
  // Адрес будет только 127.0.0.1, порт - любой.
  App.ws = new WebSocket("ws://127.0.0.1:8888/");

  // Определяем функцию, которая выполняется при подключении
  App.ws.onopen = function() {
    Ext.MessageBox.alert("Web Socket","printserver connected");
  };
  
  App.ws.onmessage = function(e) {
    // обрабатываем входящее сообщение от сервера
	Ext.MessageBox.alert("Web Socket","printserver message: " + e.data);
  };
  
  // функция при закрытии соединения
  App.ws.onclose = function() {
	  Ext.MessageBox.alert("Web Socket","printserver disconnected");
  };
  
  // при ошибке
  App.ws.onerror = function() {
	  Ext.MessageBox.alert("Web Socket","printserver error");
  };

}

App.cashier.CashierTab = Ext.extend(Ext.Panel, {
	
	initComponent: function(){
		
		websocket_init();
		
		this.menuBar = new Ext.Panel({
			region:'west',
			//frame:true,
			title:'Меню',
			width:100,
			//height:500,
 			layout: {
	            type:'vbox',
            	padding:'10',
            	align:'stretch'
        	},
        	defaults:{margins:'0 0 5 0'},
        	items:[{
	            xtype:'button',
    	        text: 'Z-Отчет',
				scale: 'large',
				handler: function(){
					App.ws.send('ENDSESSION')
				}
	        },{
    	        xtype:'button',
        	    text: 'X-Отчет',
				scale: 'large',
				handler: function(){
					App.ws.send('XREPORT')
				}
			}]
		});
	
		this.mainPanel = new Ext.TabPanel({
			activeTab:0,
			region:'center',
			items:[{
					title:'Платежи',
					layout:'fit',
					xtype:'paymentgrid'
				},{
					title:'Должники',
					layout:'fit',
					xtype:'debtorgrid'
				}]
		});
	
		config = {
			id:'cashier-tab',
			closable:true,
			title:'Кассир',
			region:'center',
			border:false,
			layout:'border',
			items:[this.menuBar,this.mainPanel]
			
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cashier.CashierTab.superclass.initComponent.apply(this, arguments);
	}
	
});

Ext.reg('cashiertab', App.cashier.CashierTab);
