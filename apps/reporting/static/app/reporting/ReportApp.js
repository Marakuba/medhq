Ext.ns('App.reporting');

App.reporting.ReportApp = Ext.extend(Ext.Panel, {
    initComponent : function() {
        
        this.printBtn = new Ext.Button({
            text:'Печать',
            iconCls:'silk-printer',
            handler:this.onPrint.createDelegate(this,[]),
            scope:this
        });
        
        this.filtersPanel = new App.reporting.FilterPanel({
            region:'east',
            border:true,
            width:550,
            margins:'5 5 5 0'
        });
        
        this.contentPanel = new Ext.Panel({
            region:'center',
            border:true,
            margins:'5 5 5 0',
            layout: 'fit',
//          title:'Предпросмотр',
            defaults:{
                border:false
            },
            items: [
            ],
            tbar:[this.printBtn]
        });
        
        this.tree = new App.reporting.ReportTree({
            collapsible:true,
            collapseMode:'mini',
            rootVisible:false,
            region:'center',
            margins:'0 5 0 0',
            border:false,
            fn:function(node){
                this.node = node;
                Ext.callback(this.fn, this.scope || window, [node]);
            },
            listeners:{
                scope:this,
                dblclick:this.onPreview,
                click:this.openReport
            },
            scope:this
        });
        
        this.refreshBtn = new Ext.Button({
            text:'Обновить',
            iconCls:'x-tbar-loading',
            handler:function(){
                var rootNode = this.tree.getRootNode();
                this.tree.loader.load(rootNode);
                rootNode.expand();
            },
            scope:this
        });
        
        this.printBtn = new Ext.Button({
            text:'Сформировать отчет',
            disabled:true,
            iconCls:'silk-printer',
            handler:this.onPreview.createDelegate(this,[]),
            scope:this
        });
        
        this.clearBtn = new Ext.Button({
            text:'Очистить форму',
            handler:this.onClearForm.createDelegate(this,[]),
            scope:this
        });
        
        this.treePanel = new Ext.Panel({
            region:'west',
            border:false,
            header:false,
            collapsible:true,
            collapseMode:'mini',
            width:550,
            margins:'0 5 0 0',
            layout: 'fit',
            defaults:{
                border:false
            },
            items: [
                this.tree
            ]
        });
        
        var config = {
            id:'reporting-app',
            closable:true,
            title: 'Отчеты',
            layout: 'border',
            items: [
                this.tree,
                this.filtersPanel
            ],
            tbar:[
                this.refreshBtn,'-',this.printBtn,'->',this.clearBtn
            ]
        };
        
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.ReportApp.superclass.initComponent.apply(this, arguments);
        
        this.on('afterrender',function(){
//          this.examGrid.store.load();
        },this);
    },
    
    onPreview: function(node){
        node = this.tree.getSelectionModel().getSelectedNode();
        if (!node || !node.attributes.leaf) return false;
        var slug = node.attributes.slug;
        
        var params = this.filtersPanel.makeParamStr(node.attributes.fields);
        if(params){
            var url = String.format('/widget/reporting/report/{0}/?{1}',slug,params);
//          var url = String.format('/old/reporting/{0}/test_print/?{1}',slug,params);
//          window.open(url);
            config = {
                autoScroll:true,
                url:url,
                title:node.attributes.text,
                closable:true,
                slug:slug,
                params:params
            };
            WebApp.fireEvent('launchapp','printspanel',config);
        }
        
        
        
    },
    
    onClearForm: function(){
        this.filtersPanel.onClearForm();
    },
    
    editCard: function(record){
        
        config = {
            closable:true,
            patient:record.data.patient_id,
            patient_name: record.data.patient_name,
            ordered_service:record.data.ordered_service,
            title: 'Пациент ' + record.data.patient_name,
            print_name:record.data.service_name,
            record:record,
            staff:this.staff
        };
        
        WebApp.fireEvent('launchapp', 'neocard',config);
        
    },
    
    openReport: function(node){
        this.printBtn.setDisabled(!node.attributes.leaf);
        if (node.attributes.leaf) {
            this.filtersPanel.showFields(node.attributes.fields);
        }
    },
    
    onPrint:function(){}
});

Ext.reg('reportapp', App.reporting.ReportApp);


App.webapp.actions.add('reportapp', new Ext.Action({
    text: 'Отчеты',
    scale: 'medium',
    handler: function(){
        WebApp.fireEvent('launchapp','reportapp');
    }
}));