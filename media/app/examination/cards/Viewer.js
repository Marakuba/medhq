Ext.ns('App.examination');

App.examination.Viewer = Ext.extend(Ext.Window, {
	
	initComponent: function() {
		
		this.img = new Ext.BoxComponent({
			xtype:'box',
			width:600,
			height:550,
			autoEl:{
				width:512,
				height:512,
				tag:'img'
			}
		});
		
		config = {
            layout:{
            	type:'hbox',
            	align:'stretch'
            },
            title: 'Выберите поля для переноса',
            width:650,
            height:560,
            closeAction:'hide',
            modal:true,
            items: [this.img,{
            	flex:1,
            	border:false,
            	items:[new Ext.Slider({
				    height: 500,
				    vertical: true,
				    minValue: 0,
				    maxValue: this.store.getCount()-1,
				    value:this.index || 0,
				    listeners:{
				    	changecomplete:function(slider,index,thumb){
//				    		this.setImage(index);
				    	},
				    	beforechange:function(slider,index,old){
				    		this.setImage(index);
				    		return true
				    	},
				    	scope:this
				    }
				})]
            }],
            listeners:{
            }
        }

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.Viewer.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			if(this.store && this.store.getCount()) {
				this.setImage(this.index);
			}
		},this);

	},
	
	setImage: function(index) {
		var rec = this.store.getAt(index || 0);
		this.img.getEl().dom.src = rec.data.photo;
	}

});