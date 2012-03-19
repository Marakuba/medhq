Ext.ns('App','App.cashier','App.ws');

WEB_SOCKET_SWF_LOCATION = "http://localhost/medhq/media/web-socket-js/WebSocketMain.swf";
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
		
		this.visitStore = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : get_api_url('visit'),
			model: App.models.visitModel
		});
		
		this.visitField = new Ext.form.NumberField({ //Поле для ввода количества продуктов
            fieldLabel: 'Заказ №',
            width: 70,
            //name: 'amount',
            minValue: 1,
            //value: 1,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        this.prompt.fireEvent('submit');
                    }
                },
                scope:this
            }
        });
        
    
        this.prompt = new Ext.Window({
            layout:'fit',
            title: 'Введите номер заказа',
            width:280,
            height:180,
            closeAction:'hide',
            items: new Ext.FormPanel({
                labelWidth: 80, 
                bodyStyle: 'padding:5px 5px 0',
                width: 100,
                defaultType: 'textfield',
        
                items: [ this.visitField,
                {
                	xtype:'tbtext',
                	id:'patient-field',
                	text:''
                },{
                	xtype:'tbtext',
                	id:'sum-field',
                	text:''
                }],
                
                buttons: [{
                    text:'Найти',
                    scope: this,
                    handler: function(){this.prompt.fireEvent('submit')}
                },{
                	text:'Оплатить',
                	id: 'pay-button',
                    scope: this,
                    disabled:true,
                    handler: this.onPay.createDelegate(this)
                },{
                    text: 'Закрыть',
                    scope: this,
                    handler: function(){
                        this.prompt.hide();
                    }
                }]
            })
        });

        this.prompt.on('show',function(win){
            this.visitField.reset();
            this.visitField.focus(true,400);
            Ext.getCmp('patient-field').setText('');
            Ext.getCmp('sum-field').setText('');
            Ext.getCmp('pay-button').disable();
         },this);

        this.prompt.on('submit', function() {
        	var s = this.visitStore;
			s.baseParams = { format:'json' };
			var num = parseInt(this.visitField.getValue());
			if (num>0){
				s.setBaseParam('barcode', num);
			};
			s.load({callback:this.onVisitFinded,scope:this});
			rec = s.getAt(0);
			var a;
        },this);
		
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
        	defaults:{
        		margins:'0 0 5 0',
        		anchor:'100%'
        	},
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
			},{
    	        xtype:'button',
        	    text: 'Найти заказ',
				scale: 'large',
				handler: this.onVisitSearch.createDelegate(this),
				scope:this
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
				},{
					title:'Депозиторы',
					layout:'fit',
					xtype:'depositorgrid'
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
	},
	
	onVisitSearch: function(v){
		this.prompt.show();
		/*if (this.visitStore){
			var s = this.visitStore;
			s.load();
			s.baseParams = { format:'json' };
			vi = parseInt(v);
			if (!isNaN(vi)){
				s.setBaseParam('id', vi);
			} else {
			//	s.setBaseParam('last_name__istartswith', v);
			}
			s.load();
			rec = s.getAt(0);
			var a;
		}*/
	},
	
	onPay: function(){
		
			this.win = new App.billing.PaymentWindow({
				is_income : true,
				amount:Math.abs(this.amount),
				patient_id:this.patient_id
			});
			this.win.show();
		this.prompt.hide();
	},
	
	onVisitFinded: function(records,opt,success) {
		if (records) {
			var rec = records[0];
			Ext.getCmp('patient-field').setText('Пациент: '+rec.data.patient_name);
            Ext.getCmp('sum-field').setText('Сумма: ' + rec.data.total_price);
            Ext.getCmp('pay-button').enable();
            this.patient_id = rec.data.patient_id;
            this.amount = rec.data.total_price;
		}
	}
	
});

Ext.reg('cashiertab', App.cashier.CashierTab);
