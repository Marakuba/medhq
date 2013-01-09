Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.TextTicketEditor = Ext.extend(Ext.Panel, {
    initComponent: function(){
        this.sourceText = this.sourceType == 'tpl' ? 'шаблону' : 'карте';

        this.clearFilterList = [Ext.EventObject.ESC, Ext.EventObject.RIGHT, Ext.EventObject.LEFT,
                                Ext.EventObject.TAB,
                                Ext.EventObject.DELETE, 44, 59, 63];

        this.glossStore = new Ext.data.Store({
            restful: true,
            autoLoad: true,
            autoDestroy:true,
            baseParams:{
                format:'json',
                staff:WebApp.active_staff
            },
            paramNames: {
                start : 'offset',
                limit : 'limit',
                sort : 'sort',
                dir : 'dir'
            },
            proxy: new Ext.data.HttpProxy({
                url: App.utils.getApiUrl('examination','glossary')
            }),
            reader: new Ext.data.JsonReader({
                totalProperty: 'meta.total_count',
                successProperty: 'success',
                idProperty: 'id',
                root: 'objects',
                messageProperty: 'message'
            }, [
                {name: 'id'},
                {name: 'text'},
                {name: 'staff'},
                {name: 'section'}
            ])
        });

        this.glossDropDown = new Ext.ux.DropDownList({
            tpl: '<tpl for="."><div class="x-combo-list-item">{text}</div></tpl>',
            store: this.glossStore,
            valueField: 'text',
            bubbleEvents:['itemselected', 'processquery', 'listclosed', 'listuserclosed'],
            width:200,
            clearFilterList: this.clearFilterList,
            listeners: {
                processquery: function(list, options, e) {

                    /*var txt = Ext.getCmp(list.currentEl.id);
                    var parsedAddresses = this.parseMailAddressesOnCurrentPosition(txt);

                    options.query = parsedAddresses.currentAddress.trim();*/
                },

                itemselected: this.glossDDItemSelected,

                scope:this
            }
        });

        this.glossPanel = new App.dict.XGlossaryTree({
            section:this.section,
            base_service:this.base_service,
            staff:this.staff,
            collapsible:true,
            animate: false,
            collapsed:false,
            region:'east',
            floating:false,
            listeners:{
                scope:this,
                'nodeclick': this.onGlossNodeClick
            }
        });


        this.glossPanel.on('afterrender',function(){
            if (this.ctxEditor){
                var textarea = this.ctxEditor.field.getEl().dom;
                var pos = this.ctxEditor.field.getValue().length;
                this.ticket.setCaretTo(textarea,pos);
            }
        });

        this.glossPanel.on('beforeclose',function(){
            if (this.ctxEditor){
                this.ctxEditor.field.focus('',10);
            }
        });

        this.glossPanel.on('beforeexpand',function(panel){
        });

        this.headerField = new Ext.form.TextField({
            layout:'fit',
            region:'north',
            border:false
        });

        this.bodyField = new Ext.ux.TinyMCE({
            layout:'fit',
            region:'center',
            enableKeyEvents:true,
            tinymceSettings: {
                theme: "advanced",
                skin : "o2k7",
                language : "ru",
                browser_spellcheck : true,
                plugins: "pagebreak,style,layer,table,advhr,advimage,advlink,emotions,iespell,insertdatetime,preview,media,searchreplace,print,paste,directionality,noneditable,visualchars,nonbreaking,xhtmlxtras,template",
                theme_advanced_buttons1: "bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect,|,forecolor,backcolor",
                theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,insertdate,inserttime,|,visualchars,nonbreaking,pagebreak",
                theme_advanced_buttons3: "tablecontrols,|,hr,removeformat,|,sub,sup",
                theme_advanced_toolbar_location: "top",
                theme_advanced_toolbar_align: "left",
                theme_advanced_statusbar_location: "bottom",
                theme_advanced_resizing: false,
                extended_valid_elements: "a[name|href|target|title|onclick],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],hr[class|width|size|noshade],font[face|size|color|style],span[class|align|style]",
                // template_external_list_url: "example_template_list.js"
            },
            listeners:{
                'render': function(c) {
                    var el = c.getEl();
                    this.glossDropDown.bindElement(el, this.glossDropDown);
                    el.on('keypress', function(e,t) {
                        var pos = this.getCaretPos(el.dom);
                        this.fireEvent('search',e,t.value);
                    }, this);
                    el.on('click',function(e,t,o){
                        var pos = this.getCaretPos(el.dom);
                        this.fireEvent('editorclick',e,t,o);
                    }, this);
                    el.on('blur', function(t,e) {
                        this.getCaretPos(el.dom);
                    }, this);
                    el.on('focus', function(t,e) {
//                      var pos = this.getPos();
//                      el.dom.setSelectionRange(pos, pos);
                    }, this);

                    c.ed.onKeyPress.add(function(ed, e) {
                        if(e.charCode==10 && e.ctrlKey){
                            this.editComplete();
                        }
                    } .createDelegate(this));
                },
                scope: this
            }
        });

        this.ticketPanel = new Ext.Panel({
            layout: 'border',
            border: false,
            items: [
                this.headerField,
                this.bodyField
            ],
            region: 'center'
        });

        this.okBtn = new Ext.Button({
            iconCls: 'silk-resultset-previous',
            text: 'Вернуться к ' + this.sourceText,
            handler: this.editComplete.createDelegate(this, []),
            scope: this
        });

        this.ttb = new Ext.Toolbar({
            items:[this.okBtn]
        });

        config = {
            layout: 'border',
            type: 'ticket-edit-panel',
            items: [
                this.ticketPanel,
                this.glossPanel
            ],
            tbar: this.ttb
        };

        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.TextTicketEditor.superclass.initComponent.apply(this, arguments);
        this.on('afterrender',function(){
            if (this.data){
                this.loadTicket(this.data);
                this.bodyField.focus(false, 350);
            }
            this.ttb.add('->');
            if (this.prevTicket && this.prevTicket.section != 'name'){
                var prevText = this.prevTicket.title != this.prevTicket.defaultTitle &&
                               this.prevTicket.title ||
                               Ext.util.Format.ellipsis(this.prevTicket.data.value, 40);
                this.prevBtn = new Ext.Button({
                    text: prevText,
                    iconCls: 'silk-resultset-previous',
                    handler: this.editComplete.createDelegate(this, [this.prevTicket])
                });
                this.ttb.add(this.prevBtn);
            }
            if (this.nextTicket && this.nextTicket.section != 'name'){
                var nextText = this.nextTicket.title != this.nextTicket.defaultTitle &&
                               this.nextTicket.title ||
                               Ext.util.Format.ellipsis(this.nextTicket.data.value, 40);
                this.nextBtn = new Ext.Button({
                    text: nextText,
                    iconCls: 'silk-resultset-next',
                    handler: this.editComplete.createDelegate(this, [this.nextTicket])
                });
                this.ttb.add('-');
                this.ttb.add(this.nextBtn);
            }
            this.doLayout();

//          console.log(this.bodyField.getEl())
//          this.glossDropDown.bindElement(this.bodyField.getEl(), this.glossDropDown);
        });

        this.on('search',function(e,text){
            this.glossDropDown.currentElKeyUp(e,text);
        },this);

        this.on('editorclick', function(){
            this.glossDropDown.clearBuffer();
        },this);

    },

    loadTicket: function(ticket){
        var title = ticket.title || '';
        this.headerField.setValue(title);
        var text = ticket.value || '';
        this.bodyField.setValue(text);
        this.setPos(text.length);
        var rootNode = this.glossPanel.getRootNode();
        this.glossStore.setBaseParam('section',ticket.section);
        this.glossStore.load();
        this.glossPanel.loader.baseParams['section'] = ticket.section;
        this.glossPanel.loader.baseParams['staff'] = WebApp.active_staff;
//      this.glossPanel.loader.load(rootNode);
    },

    onGlossNodeClick: function(attrs){
        var pos = this.getPos() || 0;
        var oldText = this.bodyField.getValue();
        var pastedText = attrs.text;
        if(this.bodyField.ed){
            var ed = this.bodyField.ed;
            ed.execCommand('mceInsertContent', false, attrs.text);
            this.bodyField.focus(false, 100);
            return;
        }
        if (oldText[pos] && oldText[pos] != ' '){
            pastedText += ' ';
        }
        var beforePasted = oldText.substring(0,pos);
        var afterPasted = oldText.substr(pos);

        if (pos>0 && oldText[pos-1] && oldText[pos-1] != ' '){
            pastedText = ' ' + pastedText;
        }
        var newText = beforePasted + pastedText + afterPasted;
        this.bodyField.setValue(newText);
        pos = pos + pastedText.length;
        var textarea = this.bodyField.getEl().dom;
        textarea.setSelectionRange(pos, pos);
        this.setCaretTo.defer(300,this,[textarea,pos]);
        this.fireEvent('ticketdataupdate');
    },

    glossDDItemSelected:function(list, record, index) {
        var val = this.bodyField.getValue();
        var curPos = this.getPos();
//                  console.log('buffer',this.glossDropDown.getBuffer());
        var beforePasted = val.substring(0,curPos-this.glossDropDown.getBuffer().length);
        var afterPasted = val.substr(curPos);
        var pastedText = record.data.text;
        var newPos = curPos - this.glossDropDown.buffer.length + pastedText.length;

        if (!Ext.isEmpty(beforePasted) && (beforePasted[beforePasted.length-1]!=' ')) {
            beforePasted += ' ';
            newPos += 1;
        }
        if (!Ext.isEmpty(afterPasted)){
            if (afterPasted[0] != ' ') pastedText += ' ';
            newPos += 1;
        }
        var newText = beforePasted + pastedText + afterPasted;
        this.bodyField.setValue(newText);
        var textarea = this.bodyField.getEl().dom;
        this.setCaretTo.defer(200,this,[textarea,newPos]);
        this.glossDropDown.clearBuffer();
    },

    doGetCaretPosition: function (ctrl) {
        var CaretPos = 0;   // IE Support
        if (document.selection) {
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0')
            CaretPos = ctrl.selectionStart;
        return (CaretPos);
    },

    setCaretTo: function(obj, pos) {
        this.setPos(pos);
//      pos = pos - 1;
        if(obj.createTextRange) {
            var range = obj.createTextRange();
            range.move("character", pos);
            range.select();
        } else if(obj.selectionStart) {
            obj.focus(false,300);
            obj.setSelectionRange(pos, pos);
        }
    },

    getCaretPos: function(el) {
        var rng, ii=0;
        if(typeof el.selectionStart=="number") {
            ii=el.selectionStart;
        } else if (document.selection && el.createTextRange){
            rng=document.selection.createRange();
            rng.collapse(true);
            rng.moveStart("character", -el.value.length);
            ii=rng.text.length;
        }
        this.setPos(ii);
        return ii;
    },

    setPos: function(pos){
        this.curPos = pos;
    },

    getPos: function(){
        return this.curPos;
    },

    getText: function(){
        return this.data.text;
    },

    setText: function(text){
        this.data.text = text;
        this.updateData();
    },

    editComplete: function(ticket){
        var data = {};
        data['title'] = this.headerField.getValue();
        data['value'] = this.bodyField.getValue();
        this.fireEvent('editcomplete',data);
        if (this.fn){
            this.fn(data,this.panel, ticket);
        }
        this.destroy();
    }
});

Ext.reg('textticketeditor', App.examination.TextTicketEditor);
