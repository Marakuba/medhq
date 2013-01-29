Ext.ns('App.examination');

App.examination.IcdTicketEditor = Ext.extend(Ext.Panel, {

    editor:'asgmtticketeditor',

    initComponent:function(){

        this.okBtn = new Ext.Button({
            iconCls:'silk-resultset-previous',
            text:'Вернуться к карте',
            handler:this.onOkBtnClick.createDelegate(this,[]),
            scope:this
        });


        this.icdPanel = new App.dict.MKBTree({
            fn : this.complete.createDelegate(this),
            scope : this
        });

        config = {
            border:false,
            layout:'fit',
            items:[this.icdPanel],
            tbar:[this.okBtn]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.IcdTicketEditor.superclass.initComponent.apply(this, arguments);
    },

    onOkBtnClick: function() {
        var node = this.icdPanel.getSelected();
        this.complete(node);
    },

    complete : function(node) {
        if (this.fn){
            this.fn(node,this.panel)
        };
        this.destroy();
    }


});


Ext.reg('icdticketeditor', App.examination.IcdTicketEditor);