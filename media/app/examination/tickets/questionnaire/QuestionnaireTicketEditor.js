Ext.ns('App.examination');

App.examination.QuestionnaireTicketEditor = Ext.extend(Ext.form.FormPanel, {
	
    initComponent: function() {
    	
    	/*Пример кода анкеты
 * 		{layout:'tab',
    items:[
    {
        title:'Анамнез жизни',
        section:'anamnesis',
        layout:'tab',
        items:[
        {   
            items:[{type:'text',
                value:'555'},{type:'text',
                value:'555'}],
            title:'1',
            
        }, {
            title:'2',
            type:'text',
            value:'666'
        }]
    },{
        title:'Дополнительно',
        section:'other',
        items:[
        {
             type:'checkbox',
             data:['uuu','iii']
         },{
             type:'text',
             value:'453'
         }]
    }]
}*/
    	
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
			},
			'combobox':{
				'constructor':Ext.form.ComboBox,
				'config':{
					typeAhead: true,
				    triggerAction: 'all',
				    lazyRender:true,
				    mode: 'local',
				    valueField: 'item',
				    displayField: 'item',
					type:'combobox'
					
				}
			}
		};
			
		this.okBtn = new Ext.Button({
			text:'Ok',
			handler:this.onSave.createDelegate(this),
			scope:this
		});
		
    	this.ttb = new Ext.Toolbar({
			items: ['-',this.okBtn]
		});
		
    	var config = {
    		autoScroll:true,
			layout: 'auto',
			padding:3,
			labelWidth:10,
			items:[this.buildPanel(this.code)],
			tbar:this.ttb
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.QuestionnaireTicketEditor.superclass.initComponent.call(this);
        
        this.on('afterrender',function(){
//        	this.makeTickets();
        	if (this.data){
    			this.loadData(this.data)
    		}
        	
        },this)
    },
    
    clear: function(){
    	this.items.clear();
    	this.update();
    },
    
    //Для каждого массива создает отдельную панель и заполняет её объектами
	//Если массив содержит список массивов, то у текущей панели будет layout vbox. иначе auto.
	//поэтому массив должен содержать элементы одного типа: либо массивы, либо словари.
	buildPanel: function(obj,deep,index,section){
		if (!deep) deep = 0;
		if (!index) {
			index = 0
		} else {
			index += 1;
		};
		var sec = obj['section'] || section;
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
			var tabPanel
			//Если это Таб панель, то оборачиваем ее в FormPanel, чтобы потом можно было взять getForm()
			if (obj['layout'] && obj['layout']!=='tab') {
				panel_conf['layout'] = obj['layout'] || 'auto';
			};
			var elem = new Ext.Panel(panel_conf);
			if (obj['layout'] && obj['layout']=='tab') {
				tabPanel = new Ext.TabPanel({
					items:[],
					type:'tabpanel',
					section:obj['section'],
					activeTab:0,
					border:false
				});
				
				var parent = tabPanel;
				
			} else {
				var parent = elem 
			}
			var i = 0;
			Ext.each(obj.items,function(item){
				parent.add(this.buildPanel(item,deep+1,i,sec));
				i += 1;
			},this)
		} else {
			//Если у объекта нет поля items, то это не панель
			var elem = this.buildObject(obj,deep,index,sec)
		};
		
		if (tabPanel){
			elem.add(parent)
		};
		
		return elem
	},
    
	//Создает объект согласно словаря компонентов
	buildObject: function(obj,deep,index,section){
		var elem;
		var name = section + '_' + deep + '_' + index;
		//Если в редакторе указан тип для текущего элемента
		if (obj['type']){
			//выбираем компонент из словаря компонентов
			var comp = this.questComponents[obj['type']];
			var obj_conf = Ext.apply({},obj);
			obj_conf['name'] = name;
			//Заполняем items для checkboxgroup или radiogroup
			if (obj_conf['data']){
				if (obj['type'] == 'combobox'){
					obj_conf['store'] = new Ext.data.ArrayStore({
				        fields: [
				            'item'
				        ],
				        data: obj_conf['data']
				    });
				} else {
					obj_conf['items'] = [];
					var id = 0;
					Ext.each(obj_conf['data'],function(item){
						obj_conf['items'].push({
							name:name+'_'+ obj_conf['type']=='checkbox' ? id : 'el',
							boxLabel:item,
							inputValue:item
						});
						id++;
					});
				}
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
		if (!value) return '';
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
	
	collectData: function(panel){
		var f = (panel) || this;
		var data = {
		    title: f.title || '',
		    section:panel.section,
		    rows:this.getPanelData(panel)
		};
		
		return data;
	},
	
	getPanelData: function(panel){
		var rows = []
		panel.items.each(function(f){
			if (f.type == 'panel' || f.type == 'tabpanel'){
				rows = rows.concat(this.getPanelData(f));
			} else {
				rows.push({values:this.getCmpValue(f),
						name:f.name})
			}
		},this);
		return rows;
	},
	
	makeTickets:function(){
		//Выбираем начальную форму секций, в зависимости от того, какого она типа: обычная панель или TabPanel
		var form = this.get(0).get(0);
		if (form && form.type=='tabpanel'){
			var inceptionForm = form;
		} else {
			var inceptionForm = this.get(0);
		};
		//Собираем тикеты
		var tickets = [];
		var allData = [];
		inceptionForm.items.each(function(panel){
			var rows = this.collectData(panel)
			var ticketData = this.convertToTicketData(rows);
			allData = allData.concat(rows['rows']);
			tickets.push(ticketData)
		},this);
		
		return [tickets,allData,this.questName]
	},
	
	/* Получает данные в виде
	 * {
	 * 		title:'...',
	 * 		section:'...',
	 * 		data:[{name:'...',(values:'...'|['...','...',...])},{...}]
	 * 
	 * } 
	 * Преобразует их в вид
	 * {title:'...',
	 * section:'...',
	 * value:'...',
	 * questName:'...',
	 * type:'questionnaire'
	 * }
	 */
	convertToTicketData:function(dataObj){
		var data = '';
		Ext.each(dataObj.rows,function(item){
			if (!Ext.isArray(item.values)){
				data += item.values + ' '
			} else { 
				Ext.each(item.values,function(value){
					data += ' ' + value + ','
				});
				data[data.length-1] = ';'
			}
		},this);
		cObj = {title:dataObj.title,
				section:dataObj.section,
				value:data,
				questName:this.questName,
		    	xtype:'questionnaire'};
		return cObj
	},
	
	loadData: function(dataArr){
		var form = this.getForm();
		Ext.each(dataArr,function(elem){
			var field = form.findField(elem['name']);
			if (Ext.isArray(elem['values'])){
				var name_list = {};
				Ext.each(field.items,function(item){
					name_list[item.name] = elem['values'].indexOf(item.inputValue) > -1 
				},this);
				field.setValue(name_list);
			} else {
				field.setValue(elem['values']);
			}
		},this);
	},
	
	onSave: function(){
		if (this.fn){
			this.fn(this.makeTickets(),this.panel)
		};
		this.destroy();
	}
});

Ext.reg('questionnaireticketeditor', App.examination.QuestionnaireTicketEditor);

