Ext.ns('App.examination');


App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.menuBtns = {};
		
		this.sectionMenu = new Ext.menu.Menu({
			items:[]
		});
		
		
		this.newTab = Ext.extend(Ext.Panel,{
			title:'Новый раздел',
			autoScroll:true,
			cls: 'placeholder',
			closable: true
		});
		
		Ext.Ajax.request({
			url:App.getApiUrl('examfieldset'),
			success:function(response, opts){
				var obj = Ext.decode(response.responseText);
				Ext.each(obj.objects,function(rec){
					this.menuBtns[rec.name] = {
						text:rec.title,
						id:rec.name,
						order:rec.order,
						handler:this.onAddSection.createDelegate(this,[rec.name,rec.title,rec.order]),
						scope:this
					};
					this.sectionMenu.insert(rec.order,this.menuBtns[rec.name])
				},this);
			},
			failure:function(response, opts){
				this.addSecBtn.disable();
			},
			scope:this
		});
		
		this.addSecBtn = new Ext.SplitButton({
			text:'Добавить раздел',
			menu:this.sectionMenu,
			scope:this
		});
		
		this.addSubSecBtn = new Ext.Button({
			iconCls:'silk-add',
			text:'Добавить подраздел',
			disabled:true,
			handler:this.onAddSubsection.createDelegate(this, [])
		});
		
		this.ttb = [this.addSecBtn, this.addSubSecBtn]
			
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
	},
	
	onAddSection: function(btn,title,order){
		var new_tab = this.insert(order,new this.newTab({
			title:title,
			btn:btn,
			order:order,
			btn:btn,
			listeners:{
				'close': function(p){
					this.sectionMenu.insert(p.order,this.menuBtns[p.btn]);
					this.addSecBtn.enable();
					if (this.items.length == 1) {
						this.addSubSecBtn.disable();
					}
				},
				scope:this
			}
		}));
		this.sectionMenu.remove(btn);
		if (this.sectionMenu.items.length == 0) {
			this.addSecBtn.disable();
		};
		this.addSubSecBtn.enable();
		this.setActiveTab(new_tab);
		this.doLayout();
	},
	
	onAddSubsection: function(){
		var cur_tab = this.getActiveTab();
		var new_ticket = new Ext.ux.form.Ticket();
		cur_tab.add(new_ticket);
		this.doLayout();
	}

});

Ext.reg('templatebody',App.examination.TemplateBody);