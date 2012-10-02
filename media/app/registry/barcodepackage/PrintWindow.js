Ext.ns('App.barcodepackage');

App.barcodepackage.PrintWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.params = this.params || {};
		
		this.printer = Ext.state.Manager.getProvider().get('lab_printer');
		
		var d = this.record.data;
		var tpl = new Ext.Template(
			'<p>Серия штрих-кодов: {range_from} - {range_to}</p>',
			'<p>Лаборатория: {lab_name}</p>',
			'<p>Кратность / количество</p>',
			'<p>x2: {x2}</p>',
			'<p>x3: {x3}</p>',
			'<p>x4: {x4}</p>',
			'<p>x5: {x5}</p>',
			'<p>x6: {x6}</p>',
			'<p>x7: {x7}</p>',
			'<p>x8: {x8}</p>'
		);
		var t = tpl.apply(d);
		
		this.form = new Ext.form.FormPanel({
			baseCls:'x-plain',
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			labelAlign:'top',
			items:[{
				html:t
			}, new Ext.form.ComboBox({
				fieldLabel:'Принтер',
				anchor:'99%',
				store:new Ext.data.JsonStore({
					data:App.barcoding,
					root:'printers',
					fields:['id','name','address','port'],
					idProperty:'id'
				}),
				listeners:{
					select:function(cmb, rec, idx){
						this.printer = rec.data;
						Ext.state.Manager.getProvider().set('lab_printer', this.printer);
						this.msgBox = Ext.MessageBox.progress('Подождите','Идет подключение к принтеру');
						App.WebSocket = new WebSocket(String.format("ws://{0}:{1}/",this.printer.address,this.printer.port));
						App.WebSocket.onopen = function(){
							this.msgBox.hide();
						}.createDelegate(this);
						App.WebSocket.onerror = function(){
							this.msgBox.hide();
							Ext.MessageBox.alert('Ошибка','Невозможно подключиться к принтеру!');
						}.createDelegate(this);
					}
				},
				mode:'local',
				typeAhead: true,
				triggerAction:'all',
				valueField:'id',
				displayField:'name',
				value:this.printer || ''
			})]
		});
		config = {
			title:'Печать пакетов штрих-кодов',
			width:350,
			autoHeight:true,
			items: this.form,
			modal:true,
			padding:5,
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			buttons:[{
				text:'Печать',
				handler:this.onPrint.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.DuplicateWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			//this.form.getForm().findField('code').focus(true, 350);
		}, this);

	},
	
	onPrint : function(){
		var f = this.form.getForm();
		if(App.WebSocket && App.WebSocket.readyState!==0 ){
			if(f.isValid()) {
				var d = this.record.data, count;
				code = String.format('{0},{1}',d.range_from,d.range_to);
				if(d['x2']) count=2;
				if(d['x3']) count=3;
				if(d['x4']) count=4;
				if(d['x5']) count=5;
				if(d['x6']) count=6;
				if(d['x7']) count=7;
				if(d['x8']) count=8;
				lat = d.lat;
				params = [code,"Euromed",count,lat];
				App.WebSocket.send(params.join("::"));
			} else {
				Ext.MessageBox.alert('Ошибка','Необходимо заполнить все поля!');
			}
		} else {
			Ext.MessageBox.alert('Ошибка','Принтер штрих-кодов не подключен!');
		}
	}

});