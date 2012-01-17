Ext.ns('App.remoting');

App.remoting.RemoteOrderGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('laborderedservice'),
			model: [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'created'},
			    {name: 'barcode'},
			    {name: 'laboratory'},
			    {name: 'patient_name'},
			    {name: 'service_name'},
			    {name: 'status'},
			    {name: 'message'},
			    {name: 'sampling'},
			    {name: 'operator_name'},
			    {name: 'in_progress', type:'bool'}
			]
		});
		
		this.store.setBaseParam('execution_place__remotestate__isnull',false);
		this.store.load();
		
		this.sm = new Ext.grid.CheckboxSelectionModel({
			singleSelect : false,
			listeners:{
				rowselect:function(sm,i,rec) {
				},
				rowdeselect:function(sm,i,rec) {
				},
				scope:this
			}
		});
		
		this.columns =  [this.sm, {
	    	header: "Дата",
	    	width:12,
	    	sortable: true, 
	    	dataIndex: 'created',
	    	renderer: Ext.util.Format.dateRenderer('d.m.Y / H:i')
	    },{
	    	header: "Заказ",
	    	width:10,
	    	sortable: true, 
	    	dataIndex: 'barcode'
	    },{
	    	header: "Лаборатория", 
	    	width: 15, 
	    	sortable: true, 
	    	dataIndex: 'laboratory'
	    },{
	    	header: "Пациент", 
	    	width: 20, 
	    	sortable: true, 
	    	dataIndex: 'patient_name'
	    },{
	    	header: "Исследование", 
	    	width: 35, 
	    	sortable: true, 
	    	dataIndex: 'service_name'
	    },{
	    	header: "Тара", 
	    	width: 25, 
	    	sortable: true, 
	    	dataIndex: 'sampling'
	    },/*{
	    	header: "Проведен", 
	    	width: 7, 
	    	sortable: true, 
	    	dataIndex: 'status', 
	    	renderer: function(val) {
	    		flag = val!='т' ? 'yes' : 'no';
	    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
	    	}
	    },*/{
	    	header: "Статус", 
	    	width: 10, 
	    	sortable: true, 
	    	dataIndex: 'status',
	    	renderer: function(val,opts,rec) {
	    		var s = rec.data.status;
	    		switch(s) {
	    			case 'т' : 
	    				return '<div class="x-grid-row-error">Не проведен!</div>';
	    				break;
	    			case 'л' : 
	    				return 'К отправке';
	    				break;
	    			case '!' : 
	    				return String.format('{0}', rec.data.message) ;
	    				break;
	    		}
	    	}
	    },{
	    	header: "Оператор", 
	    	width: 10, 
	    	sortable: true, 
	    	dataIndex: 'operator_name'
	    }];		
		
		this.modeBtn = new Ext.CycleButton({
            showText: true,
            prependText: 'Показывать: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'не проведенные',
                filterValue:'т'
            },{
                text:'ожидающие отправку',
                filterValue:'л'
            },{
                text:'с ошибками',
                filterValue:'!'
            },{
                text:'ожидание результата',
                filterValue:'>'
            }],
            changeHandler:function(btn, item){
            	this.storeFilter('status',item.filterValue);
            	this.manageBtn(item.filterValue);
            },
            scope:this
        });
		
		this.toLabBtn = new Ext.Button({
			text:'Провести',
			hidden:true,
			handler:this.onToLab.createDelegate(this),
			scope:this
		})
		
		this.sendBtn = new Ext.Button({
			text:'Отправить',
			hidden:true,
			handler:this.onSend.createDelegate(this),
			scope:this
		})
		
		var config = {
			closable:true,
			title:'Лабораторные заказы',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
//			sm : ,
			tbar: [this.modeBtn,this.toLabBtn, this.sendBtn],
			bbar: new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			listeners: {
//				rowdblclick:this.onChange.createDelegate(this),
	        	scope:this
			},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей',
	            getRowClass : function(record, rowIndex, p, store){
	            	var s = record.data.status, cls;
		    		switch(s) {
		    			case 'т' : 
		    				cls = 'x-grid-row-warning';
		    				break;
		    			case '>' : 
		    				cls = 'x-grid-row-info';
		    				break;
		    			case '!' : 
		    				cls = 'x-grid-row-error';
		    				break;
		    		}
		    		return cls
	            }
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.remoting.RemoteOrderGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
	},
	
	manageBtn : function(s) {
		this.toLabBtn.hide();
		this.sendBtn.hide();
		switch(s) {
			case 'т' :
				this.toLabBtn.show();
				this.getTopToolbar().doLayout();
				break;
			case 'л' :
				this.sendBtn.show();
				this.getTopToolbar().doLayout();
				break;
			case '>' : 
				break;
			case '!' : 
				this.sendBtn.show();
				this.getTopToolbar().doLayout();
				break;
		}
	},
	
	onGlobalSearch : function(v) {
		this.storeFilter('search', v);
	},
	
	storeFilter : function(field, value){
		if(value===undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected : function() {
		return this.getSelectionModel().getSelected()
	},
	
	
	getSelectedId : function(){
		var records = this.getSelectionModel().getSelections(), 
			ids = [];
		Ext.each(records, function(rec) {
			ids.push(rec.id);
		});
		return ids
	},
	
	onSend : function() {
		var ids = this.getSelectedId();
		App.direct.remoting.postOrders(ids,function(result,e){
			this.storeFilter('status',undefined);
        	this.manageBtn();
		},this);
	},
	
	onToLab : function() {
		var ids = this.getSelectedId();
		console.info(ids);
		App.direct.visit.toLab(ids,function(result,e){
			this.storeFilter('status',undefined);
        	this.manageBtn();
		});
	}
	
});



Ext.reg('remoteordergrid', App.remoting.RemoteOrderGrid);