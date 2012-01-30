//DropDownList
Ext.ns('Ext.ux');
Ext.ux.DropDownList = Ext.extend(Ext.Layer, {
    store: null,
    valueField: null,
    innerList: null,
    view: null,
    inKeyMode: false,
    selectedIndex: -1,
    currentEl: null,
    keyNav: null,

    constructor: function(config, existingEl) {
        var cls = 'x-combo-list';

        Ext.applyIf(config, {
            parentEl: Ext.getBody(),
            cls: cls,
            constrain: false,
            width: 200,
            height: 100,
            //Store options
            fields: ['text'],
            valueField: 'text',
            data: [],
            //DataView options
            selectedClass: 'x-combo-selected',
            singleSelect: true,
            tpl: '<tpl for="."><div class="' + cls + '-item">{text} </div></tpl>',
            listeners: {}
        });

        Ext.ux.DropDownList.superclass.constructor.call(this, config, existingEl);

        this.valueField = config.valueField;
        
        this.delay = config.delay || 3;
        
        this.clearFilterList = config.clearFilterList || [];
        this.ignoreFilterList = [Ext.EventObject.SHIFT, 
        						Ext.EventObject.HOME, 
        						Ext.EventObject.END, 
        						Ext.EventObject.UP, 
        						Ext.EventObject.DOWN, 
        						Ext.EventObject.INSERT,
        						Ext.EventObject.PAGE_DOWN,
        						Ext.EventObject.PAGE_UP,
        						Ext.EventObject.PAGEDOWN,
        						Ext.EventObject.PAGEUP,
        						Ext.EventObject.PAUSE,
        						Ext.EventObject.PRINT_SCREEN,
//        						Ext.EventObject.ENTER,
//        						Ext.EventObject.NUM_CENTER,
//        						Ext.EventObject.NUM_DIVISION,
//        						Ext.EventObject.NUM_MULTIPLY,
        						Ext.EventObject.PERIOD,
        						Ext.EventObject.CTRL,
        						Ext.EventObject.CONTROL,
        						Ext.EventObject.CAPS_LOCK,
        						Ext.EventObject.CONTEXT_MENU,
        						Ext.EventObject.ALT,
        						0
        						];
        
        this.buffer = '';
        this.pause = false;
        this.pauseBuffer = ''; //Содержимое буфера на момент паузы

        this.store = config.store ? config.store : new Ext.data.JsonStore({
            fields: config.fields,
            data: config.data
        });

        this.setSize(config.width, config.height);
        this.swallowEvent('mousewheel');

        this.innerList = this.createChild({ cls: cls + '-inner' });
        this.innerList.setSize(config.width - this.getFrameWidth('lr'), config.height - this.getFrameWidth('tb'));

        this.innerList.on('mouseover', this.onViewOver, this);
        this.innerList.on('mousemove', this.onViewMove, this);

        this.view = new Ext.DataView({
            applyTo: this.innerList,
            tpl: config.tpl,
            singleSelect: config.singleSelect,
            itemSelector: '.' + cls + '-item',
            selectedClass: config.selectedClass,
            //overClass: config.selectedClass,
            //emptyText: this.listEmptyText,
            //deferEmptyText: false,
            store: this.store,
            listeners: config.listeners
        });
        this.view.addEvents('itemselected', 'processquery', 'listclosed', 'listuserclosed');

        this.view.on({
            containerclick: this.onViewClick,
            click: this.onViewClick,
            scope: this
        });
    },

    clearFilter: function() {
        this.store.clearFilter();
    },

    bindElement: function(el) {
        this.unbindCurrentElement();

        this.currentEl = el;
//        el.on('keyup', this.currentElKeyUp, this);

        this.alignTo(this.currentEl);
        this.keyNav = new Ext.KeyNav(el, {
            "up": function(e) {
                if (!this.isVisible()) {
                    //this.alignTo(el);
                    //this.show();
                    return (true);
                } else {
                    this.inKeyMode = true;
                    this.selectPrev();
                }
            },

            "down": function(e) {
                if (!this.isVisible()) {
                    //this.alignTo(el);
                    //this.show();
                    return (true);
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            },

            "enter": function(e) {
            	if (this.itemInserted == true){
            		this.itemInserted = false
            		return false
            	} else {
            		return true
            	}
            },

            "esc": function(e) {
                if (this.isVisible()) {
                    this.collapse(true);
                }
            },

            "tab": function(e) {
                //if (this.forceSelection === true) {
                //    this.collapse();
                //} else {
//                this.onViewClick(false);
                //}
                return true;
            },

            scope: this
        });
    },

    unbindCurrentElement: function() {
        if (this.keyNav != null) {
            this.keyNav.destroy();
        }
//        if (this.currentEl != null) {
//            this.currentEl.un('keyup', this.currentElKeyUp);
//        }

        this.currentEl = null;
        if (this.isVisible()) {
            this.collapse(false);
        }
    },

    select: function(index, scrollIntoView) {
        this.selectedIndex = index;
        this.view.select(index);
        if (scrollIntoView !== false) {
            var el = this.view.getNode(index);
            if (el) {
                this.innerList.scrollChildIntoView(el, false);
            }
        }

    },

    selectNext: function() {
        var ct = this.store.getCount();
        if (ct > 0) {
            if (this.selectedIndex == -1) {
                this.select(0);
            } else if (this.selectedIndex < ct - 1) {
                this.select(this.selectedIndex + 1);
            }
        }
    },


    selectPrev: function() {
        var ct = this.store.getCount();
        if (ct > 0) {
            if (this.selectedIndex == -1) {
                this.select(0);
            } else if (this.selectedIndex !== 0) {
                this.select(this.selectedIndex - 1);
            }
        }
    },
    
    clearBuffer: function(){
    	this.buffer = '';
    	this.pause = false;
    	this.pauseBuffer = '';
    	if (this.isVisible()) {
            this.collapse(false);
        };
    },

    currentElKeyUp: function(e, t) {
//    	console.log(e.browserEvent);
    	var symbol = String.fromCharCode(e.getCharCode());
    	var ss = e.isSpecialKey();
		var key = e.getCharCode();
		//Если начали предложение с пробела 
		if (!this.buffer && symbol == ' ') {
			this.clearBuffer();
			return
		}
//		console.log(key);
    	if(this.ignoreFilterList.indexOf(key) > -1) {
			return;
		}
		
		if(this.clearFilterList.indexOf(key) > -1) {
			
			this.clearBuffer();
//			if (this.isVisible()) {
//                this.collapse(false);
//            };
            return
		};
		var f = e.browserEvent
		if (f.keyCode) {
			// if BACKSPACE
//			console.log(f.keyCode)
			if (f.keyCode == 13){
				if (this.isVisible()){
					this.onViewClick();
					this.itemInserted = true;
				} else {
					this.clearBuffer();
				};
				if (f.ctrlKey){
					this.currentEl.blur();
				}
			}
			if (f.keyCode == 8 && this.buffer){
				if (f.ctrlKey){
					this.clearBuffer();
					return
				} else {
					this.buffer = this.buffer.substr(0, this.buffer.length-1);
					if (this.pause){
						if (this.buffer === this.pauseBuffer){
							this.pause = false;
						}
					}
				}
			//Если это не backspace, то ничего не делаем, т.к. клавиши, обнуляющие буфер уже обработаны сверху
			} else {
				return
			}
		} else {
			if (f.charCode && !f.ctrlKey){
				this.buffer += symbol;
			} else {
				return
			}
		};
		
		//Если на середине слова нет совпадений в store, то приостанавливаем поиск до следующего слова
		//Если был нажат пробел, то восстанавливаем процесс поиска совпадений
		if (this.pause){
			if (symbol == ' '){
				this.clearBuffer();
			};
			return
		};
		
        console.log(this.buffer)
		if (this.buffer.length <= this.delay) {
			if (this.isVisible()) {
                this.collapse(false);
            };
			return;
		}
		
		this.store.setBaseParam('text__istartswith', this.buffer);
		this.store.load({callback:function(records){
			if (records.length){
				if (!this.isVisible()) {
	                this.alignTo(this.currentEl);
	                this.show();
	            };
	            this.select(0, true);
			} else {
				if (this.isVisible()) {
	                this.collapse(false);
	            };
	            //Если на середине слова нет совпадений в store, то приостанавливаем поиск до следующего слова
	            this.pause = true;
	            var buffer = this.getBuffer();
	            this.pauseBuffer = buffer.substring(0,buffer.length-1)
	            console.log('pauseBuffer', this.pauseBuffer);
			}
		}, scope:this})
    },

    onViewOver: function(e, t) {
        if (this.inKeyMode) { // prevent key nav and mouse over conflicts
            return;
        }
        var item = this.view.findItemFromChild(t);
        if (item) {
            var index = this.view.indexOf(item);
            this.select(index, false);
        }
    },

    onViewMove: function(e, t) {
        this.inKeyMode = false;
    },

    onViewClick: function(doFocus) {
        var index = this.view.getSelectedIndexes()[0],
            s = this.store,
            r = s.getAt(index);
        if (r) {
            this.view.fireEvent('itemselected', this, r, index);
            this.collapse(false);
        } else {
            this.collapse(false);
        }
        if (doFocus !== false) {
            this.currentEl.focus();
        };
        return false
    },

    collapse: function(userClose) {
        if (this.isVisible()) {
            this.hide();
            if (userClose) {
                this.view.fireEvent('listuserclosed');
            }
            this.view.fireEvent('listclosed');
        }
    },
    
    getBuffer: function(){
    	return this.buffer;
    }
});
