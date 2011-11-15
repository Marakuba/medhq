Ext.ns('App.examination');


App.examination.TemplateBody = Ext.extend(Ext.TabPanel, {
	
	initComponent: function(){
		
		this.ttb = [{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить раздел',
				handler:this.onAddSection.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить подраздел',
				handler:this.onAddSubsection.createDelegate(this, [])
			}]
			
		
		this.newTab = Ext.extend(Ext.Panel,{
			title:'Новый раздел',
			autoScroll:true,
			cls: 'placeholder',
//			layout:{
//		        type:'fit',
//		        align:'stretch'
//			},
			closable: true
		});
			
		this.anamnesisBody = new Ext.Panel({
			closable:true,
			autoScroll:true,
			cls: 'placeholder',
			title:'Анамнез'
		});
		config = {
			region:'center',
			margins:'5 0 5 5',
			items:[this.anamnesisBody],
			tbar:this.ttb
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplateBody.superclass.initComponent.apply(this, arguments);
	},
	
	onAddSection: function(){
		var new_tab = this.add(new this.newTab);
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