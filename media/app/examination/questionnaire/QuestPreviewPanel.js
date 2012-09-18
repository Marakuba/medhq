Ext.ns('App.examination');

App.examination.QuestPreviewPanel = Ext.extend(Ext.form.FormPanel, {
	
    initComponent: function() {
    	
    	this.questComponents = {
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
    	
    	var config = {
    		autoScroll:true,
			layout: 'auto',
			padding:3,
			labelWidth:10,
			items:[]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.QuestPreviewPanel.superclass.initComponent.call(this);
    },
    
    clear: function(){
    	this.items.clear();
    	this.update();
    },
    
    //Для каждого массива создает отдельную панель и заполняет её объектами
	//Если массив содержит список массивов, то у текущей панели будет layout vbox. иначе auto.
	//поэтому массив должен содержать элементы одного типа: либо массивы, либо словари.
	buildElem: function(obj,deep,index){
		if (!deep) deep = 0;
		if (!index) {
			index = 0
		} else {
			index += 1;
		}
		var panel_conf = {
			type:'panel',
			section:obj['section'],
			border:false,
			items:[]
		};
		if (obj['title']){
			panel_conf['title'] = obj['title'];
		};
		if (obj['items']){
			if (obj['layout'] && obj['layout']=='tab') {
				panel_conf['activeTab'] = 0;
				var elem = new Ext.TabPanel(panel_conf);
			} else {
				panel_conf['layout'] = obj['layout'] || 'auto';
				var elem = new Ext.form.FormPanel(panel_conf);
			}
			var i = 0;
			Ext.each(obj.items,function(item){
				elem.add(this.buildElem(item,deep+1,i));
				i += 1;
			},this)
		} else {
			var elem = this.buildObject(obj,deep,index)
		}
		
		return elem
	},
    
		//Создает объект согласно словаря компонентов
	buildObject: function(obj,deep,index){
		var elem;
		var name = deep + '_' + index;
		//Если в редакторе указан тип для текущего элемента
		if (obj['type']){
			//выбираем компонент из словаря компонентов
			var comp = this.questComponents[obj['type']];
			var obj_conf = Ext.apply({},obj);
			obj_conf['name'] = name;
			//Заполняем items для checkboxgroup или radiogroup
			if (obj_conf['data']){
				obj_conf['items'] = [];
				Ext.each(obj_conf['data'],function(item){
					obj_conf['items'].push({
						name:name+'el',
						boxLabel:item,
						inputValue:item
					});
				});
			};
			if (comp['constructor']){
				//объединяем пользовательскую и преднастроенную конфигурацию. 
				var comp_config = comp['config'] || {};
				Ext.applyIf(obj_conf,comp_config);
				elem = new comp['constructor'](obj_conf);
			}	
		};
		if (!elem) return new Ext.form.FieldLabel();
		return elem;
	},
	
	getCmpValue: function(field) {
		var value = field.getValue();
            if ( value.getGroupValue ) {
                value = value.getGroupValue();
            } else if ( field.eachItem ) {
                value = [];
                field.eachItem(function(item){
                	if (item.getValue()) value.push(item.getRawValue());
                });
            }
		return value
    },
	
	collectData: function(){
		var f = this.getForm();
		data = {
		    title: f.title || 'УЗИ',
		    rows:[]
		};
		
//		Ext.apply(data, form.meta);
		f.items.each(function(field,i){
//		    label = field.fieldLabel || '';
		    values = this.getCmpValue(field);
		    data.rows.push({
				values: values,
				name:field.name
	    	});
		}, this);
		console.log(data)
		return data;
	}
});

