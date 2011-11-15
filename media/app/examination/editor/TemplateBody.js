Ext.ns('App.examination');


App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.anamBtn = {
			text:'Анамнез',
			id:'anamBtn',
			sequence:0,
			handler:this.onAddSection.createDelegate(this,['anamnesis','Анамнез','anamBtn',0]),
			scope:this
		}; 
		this.diagBtn = {
			text:'Диагноз',
			sequence:1,
			handler:this.onAddSection.createDelegate(this,['diagnosis','Диагноз','diagBtn',1]),
			id:'diagBtn',
			scope:this
		};
		this.conclBtn = {
			text:'Заключение',
			sequence:2,
			handler:this.onAddSection.createDelegate(this,['conclusion','Заключение','conclBtn',2]),
			id:'conclBtn',
			scope:this
		};
		
		this.menu = new Ext.menu.Menu({
			items:[this.anamBtn,this.diagBtn,this.conclBtn]
		});
		
		this.addSecBtn = new Ext.SplitButton({
			text:'Добавить раздел',
			menu:this.menu,
			scope:this
		});
		
		this.ttb = [this.addSecBtn,{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить подраздел',
				handler:this.onAddSubsection.createDelegate(this, [])
			}]
			
		
		this.newTab = Ext.extend(Ext.Panel,{
			title:'Новый раздел',
			autoScroll:true,
			cls: 'placeholder',
			closable: true
		});
			
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[],
			tbar:this.ttb
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
	},
	
	onAddSection: function(name,title,btn,seq){
		var new_tab = this.insert(seq,new this.newTab({
			title:title,
			btn:btn,
			seq:seq,
			name:name,
			listeners:{
				'beforeclose': function(p){
					this.menu.insert(p.seq,this[p.btn]);
					this.addSecBtn.enable();
				},
				scope:this
			}
		}));
		this.menu.remove(btn);
		if (this.menu.items.length == 0) {
			this.addSecBtn.disable();
		}
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