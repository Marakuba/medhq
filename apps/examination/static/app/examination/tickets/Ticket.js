Ext.ns('App.examination');

/*
 * data : {
 *     title : '',
 *     text : '',
 *     printable : true|false,
 *     private : true|false
 * }
 */


App.examination.Ticket = Ext.extend(Ext.Panel,{

    defaultText : 'Щелкните здесь чтобы ввести описание...',

    defaultTitle : 'Щелкните здесь чтобы установить заголовок...',

    editor : 'textticketeditor',

    baseCls:'x-plain',

    cls:'section',

    draggable : true,

    headerCfg:{
        tag:'div',
        cls:'title'
    },

    title : this.defaultTitle, //this.initialConfig.title ? this.initialConfig.title : this.defaultTitle,

    bodyCssClass:'content empty-body',

    initComponent: function(){

        this.type = 'textticket';

        this.curPos = 0;

        this.addEvents('beforeticketremove',
                       'ticketremove',
                       'ticketdataupdate',
                       'editorclose',
                       'ticketheadeeditstart',
                       'ticketbodyclick',
                       'ticketeditstart',
                       'editcomplete',
                       'ticketbeforeedit',
                       'ticketeditcomplete');
        this.enableBubble('beforeticketremove',
                          'ticketremove',
                          'ticketdataupdate',
                          'editorclose',
                          'ticketheadeeditstart',
                          'ticketbodyclick',
                          'ticketeditstart',
                          'editcomplete',
                          'ticketbeforeedit',
                          'ticketeditcomplete');

        this.editMenuItem = new Ext.menu.Item({
            text:'Редактировать',
            iconCls:'silk-pencil',
            handler:function(){
                this.onEdit(this);
            },
            scope:this
        });

        this.pntMenuItem = new Ext.menu.CheckItem({
            text:'Выводить на печать',
            checked:this.initialConfig.printable || true ,
            listeners:{
                checkchange:function(ci,checked){
                    this.setPrintable(checked);
                },
                scope:this
            }
        });

        this.prvtMenuItem = new Ext.menu.CheckItem({
            text: 'Приватный блок',
            checked: this.initialConfig.private,
            listeners: {
                checkchange: function(ci,checked){
                    this.setPrivate(checked);
                },
                scope:this
            }
        });

        this.delMenuItem = new Ext.menu.Item({
            text:'Удалить',
            iconCls:'silk-cancel',
            handler:function(){
                if( this.fireEvent('beforeticketremove',this)!==false ) {
                    this.fireEvent('ticketremove',this);
                    panel.destroy();
                }
            },
            scope:this
        });

        config = {
            layout:'anchor',
            html:this.defaultText,
//            tools:,
            listeners:{
                afterrender:function(panel){
                    panel.setData();
                    this.headerConfig(panel);
                    this.bodyConfig(panel);
                },
                beforedestroy : function(panel){
                }
            },
            scope : this
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.Ticket.superclass.initComponent.apply(this, arguments);

        this.setTools();

    },

    initMenu : function(e, t, o){
        var items = [this.editMenuItem];
        if(!this.data.required){
            items = items.concat(['-',
                   this.pntMenuItem,
                   this.prvtMenuItem, '-',
                   this.delMenuItem]);
        }
        this.menu = new Ext.menu.Menu({
            items:items
        });
    },

    setTools : function(){
        this.tools = [{
            id:'gear',
            handler:function(event, toolEl, panel){
                if (!this.menu) {
                    this.initMenu();
                }
                this.menu.show(toolEl);
            },
            scope:this
        }]
        this.doLayout();
    },

    headerConfig: function(panel){
        var cfg = {
            allowBlur:false,
            shadow: false,
            completeOnEnter: true,
            cancelOnEsc: true,
            updateEl: true,
            ignoreNoChange: true,
            style:{
                zIndex: 9000
            }
        };

        var headerEditor = new Ext.Editor(Ext.apply({
            alignment: 'tl-tl',
            emptyText:this.defaultTitle,
            listeners: {
                show:function(edt){
                    if(edt.field.getValue()==edt.emptyText){
                       edt.field.setValue('');
                   }
                    panel.fireEvent('ticketheadeeditstart',panel);
                },
                beforecomplete: function(ed, value){
                    panel.data.title = value;
                    panel.fireEvent('ticketdataupdate', panel, panel.data);
                    if(value === ''){
                        ed.setValue(ed.emptyText);
                        panel.header.addClass('empty-header');
                    } else {
                        panel.header.removeClass('empty-header');
                    }
                    return true;
                },
                complete: function(ed, value, oldValue){
                }
            },
            field: {
                allowBlank: true,
                xtype: 'textfield',
                width: 600,
                selectOnFocus: true,
                cls:'header-editor',
                style:{
                    height:'1.5em'
                },
                listeners:{
                    'render': function(c) {
                        var el = c.getEl();
                        el.on('blur', function(t,e) {
                            headerEditor.completeEdit();
                        }, this);

                    }
                },
                scope:this
            }
        }, cfg));
        panel.header.on('click', function(e, t){
            headerEditor.startEdit(t);
        }, null, { delegate:'span.x-plain-header-text'} );

        panel.header.on('contextmenu', function(e, t, o){
            e.stopEvent();
            this.onCtxMenu(e, t, o);
        }, this);
    },

    bodyConfig: function(panel){
        panel.body.on('click', function(e, t){
                panel.onEdit(panel, e, t);
                panel.fireEvent('ticketbodyclick',panel);
            }, null, {
        });
        panel.body.on('contextmenu', function(e, t, o){
            e.stopEvent();
            this.onCtxMenu(e, t, o);
        }, this);
    },

    onCtxMenu : function(e, t, o){
        if (!this.menu) {
            this.initMenu(e, t, o);
        }
        this.menu.showAt(e.xy);
    },

    setData : function(data) {
        Ext.apply(this.data,data);
        this.updateData();
    },

    getData : function() {
        return this.data;
    },

    updateTitleData : function(d){
        if (d.title) {
            this.setTitle(d.title);
        } else {
            this.setTitle(this.defaultTitle);
            this.header.addClass('empty-header');
            d['title'] = '';
        }
    },

    updateValueData : function(d) {
        if (d.value) {
            this.body.removeClass('empty-body');
            this.body.update(d.value);
        } else {
            d['value'] = '';
            this.body.addClass('empty-body');
            this.body.update(this.defaultText);
        }
    },

    updateOptData : function(d) {
        if(!d.printable) {
            this.addClass('not-printable');
        }
        if(d.private) {
            this.addClass('private');
            this.pntMenuItem.setDisabled(true);
        }
    },

    updateData : function() {
        var d = this.data || {'printable':true, 'private':false, 'required':false, 'fixed':false};
        this.updateTitleData(d);
        this.updateValueData(d);
        this.updateOptData(d);
        this.data = d;
        this.doLayout();
        this.afterLoad();
    },

    setPrintable : function(checked) {
        this.data.printable = checked;
        this.fireEvent('ticketdataupdate', this, this.data);
        this[!checked ? 'addClass' : 'removeClass']('not-printable');
    },

    setPrivate : function(checked) {
        this.data.private = checked;
        if(checked) {
            this.data.printable = false;
            this['addClass']('not-printable');
            this.pntMenuItem.setChecked(false);
        }
        this.pntMenuItem.setDisabled(checked);
        this.fireEvent('ticketdataupdate', this, this.data);
        this[checked ? 'addClass' : 'removeClass']('private');
    },

    getText: function(){
        return this.data.value;
    },

    setText: function(text){
        this.data.value = text;
        this.updateData();
    },

    //пользовательская функция
    afterLoad: function(){
    },

    onEdit: function(panel){
        var t = this.previousSibling();
        if(panel.fireEvent('ticketbeforeedit', panel)===true){
            var editorConfig = panel.getEditorConfig(panel);
            WebApp.fireEvent('launchapp',panel.editor,editorConfig);
        }

    },

    getEditorConfig : function(panel){
        var editorConfig = {
            prevTicket: this.previousSibling(),
            nextTicket: this.nextSibling(),
            sourceType: this.sourceType,
            title: panel.data.title || this.section_name,
            data: panel.data,
            fn: panel.editComplete,
            panel: panel
        };
        return editorConfig;
    },

    editComplete: function(data, panel, nextTicket){
        //panel - текущий тикет
        // nextTicket - тикет, выбранный для последующего редактирования.
        // выбирается из bbar редактора

        //посылается событие для того, чтобы все компоненты вверху знали, что редактирование закончено
        panel.fireEvent('ticketeditcomplete', nextTicket);
        //Выполняется пользовательская функция обработки отредактированных данных
        panel.afterEdit(data,panel);
    },

    //пользовательская функция, выполняется после завершения редактирования тикета
    afterEdit:function(data,panel){
        //panel - редактируемый тикет
    }


});

Ext.reg('ticket', App.examination.Ticket);
