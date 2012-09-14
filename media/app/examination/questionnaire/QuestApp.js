Ext.ns('App.examinaiton');

App.examination.QuestApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.types = {
			'text':{
				'constructor':Ext.form.TextField,
				'config':{
					width:50,
					type:'text',
					getData:function(obj){
						return obj.getValue();
					}
				}
			},
			'label':{
				'constructor':Ext.form.DisplayField,
				'config':{
					type:'label',
					getData:function(obj){
						return obj.getValue();
					}
				}
			},
			'checkbox':{
				'constructor':Ext.form.CheckboxGroup,
				'config':{
//					fieldLabel:'Введите значения',
					columns:1,
					type:'checkbox'
					
				}
			},
			'radio':{
				'constructor':Ext.form.RadioGroup,
				'config':{
//					fieldLabel:'Введите значения',
					columns:1,
					type:'radio'
					
				}
			},
			'space':{
				'constructor':Ext.panel,
				'config':{
					height:10
				}
			}
		};
		
    	this.editor = new App.examination.QuestEditor({
    		region:'west',
    		border:true,
    		width:550,
 			margins:'5 5 5 0'
    	});
    	
		this.previewPanel = new App.examination.QuestPreviewPanel({
			region:'center',
 			margins:'5 5 5 0'
		});
		
		
		this.refreshBtn = new Ext.Button({
			text:'Посмотреть',
			iconCls:'x-tbar-loading',
			handler:this.onPreview.createDelegate(this),
        	scope:this
		});
		
		this.getDataBtn = new Ext.Button({
			text:'Собрать данные',
			handler:function(){
				this.dataStr = '';
				Ext.each(this.previewPanel.items.items,function(item){
					this.dataStr += ' ' + this.getData(item);
				},this);
				
				console.log(this.dataStr)
				
			},
        	scope:this
		});
		
		
		
		var config = {
			id:'questionnaire-app',
			closable:true,
			layout: 'border',	
     		items: [
				this.editor,
				this.previewPanel
			],
			tbar:[
				this.refreshBtn, this.getDataBtn
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.QuestApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
	},
	
	onPreview: function(){
		//Если после обработки отображаются не все элементы области, заключите область в квадратные скобки []
		//
		var rawdata = this.editor.getData();
		if (!rawdata) return;
		var data = Ext.decode(rawdata);
		console.log(data)
		var elems = [];
		if( Object.prototype.toString.call( data ) !== '[object Array]' ) {
		    data = [[data]]
		} else {
			if( data.length && Object.prototype.toString.call( data[0] ) !== '[object Array]' ) {
			    data = [data]
			}
		} 
		//добавляем элементы в главную панель
		Ext.each(data,function(obj){
			elems.push(this.buildPanel(obj))
		},this)
		this.previewPanel.clear();
		this.previewPanel.items.items=elems;
		this.previewPanel.doLayout();
		
	},
	
	//Для каждого массива создает отдельную панель и заполняет её объектами
	//Если массив содержит список массивов, то у текущей панели будет layout vbox. иначе auto.
	//поэтому массив должен содержать элементы одного типа: либо массивы, либо словари.
	buildPanel: function(arr){
		var layout = 'hbox'
		if(arr.length && Object.prototype.toString.call( arr[0] ) === '[object Array]' ) {
		    layout = 'vbox'
		};
		var panel = new Ext.form.FormPanel({
			layout:layout,
			type:'panel',
			border:false,
			items:[]
		})
		Ext.each(arr,function(obj){
			if(arr.length && Object.prototype.toString.call( obj ) === '[object Array]' ) {
			    panel.items.items.push(this.buildPanel(obj))
			} else {
				panel.items.add(this.buildObject(obj))
			};
		},this);
		return panel
	},
	
	//Создает объект согласно словаря компонентов
	buildObject: function(obj){
		var elem = undefined;
		//Если в редакторе указан тип для текущего элемента
		if (obj['type']){
			//выбираем компонент из словаря компонентов
			var comp = this.types[obj['type']];
			if (comp['constructor']){
				//объединяем пользовательскую и преднастроенную конфигурацию. 
				var config = obj['config'] || {};
				Ext.apply(comp['config']||{},config)
				elem = new comp['constructor'](config);
			}	
		};
		if (!elem) return new Ext.form.FieldLabel();
		return elem;
	},
	
	getData: function(item){
		var dataStr = '';
		if (item.type === 'panel'){
			Ext.each(item.items.items,function(panelItem){
				this.getData(panelItem)
			},this);
		} else {
			dataStr += ' ' + item.getData(item);
		}
		return dataStr
	}
	
});

Ext.reg('questionnaire', App.examination.QuestApp);