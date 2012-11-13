Ext.ns('App.sampling');

App.sampling.Editor = Ext.extend(Ext.Panel, {

	initComponent : function() {

		this.tubeTree = new App.sampling.TubeTree({
			region:'west',
			width:350,
			visitId:this.visitId
		});

		this.serviceGrid = new App.sampling.ServiceGrid({
			region:'center'
		});

		this.freeGrid = new App.sampling.FreeGrid({
			title:'Нераспределенные исследования',
			region:'south',
			height:300,
			visitId:this.visitId
		});

		this.tubeTree.on('tubedelete', function(){
			this.freeGrid.getStore().reload();
			this.serviceGrid.getStore().reload();
		}, this);

		this.tubeTree.on('tubeselect', function(attrs){
			var s = this.serviceGrid.getStore();
			s.setBaseParam('sampling',attrs.id);
			s.reload();
		},this);

		this.tubeTree.on('beforenodedrop', function(e){
    		if(e.target.leaf){
    			var n = e.target;
    			var uri = App.utils.getApiUrl('lab','sampling', n.id);
    			var records = e.data.selections;
    			var changed = false;
    			Ext.each(records, function(rec,i,all){
    				if(rec.data.sampling!=uri) {
    					changed = true;
						rec.beginEdit();
						rec.set('sampling',uri);
						rec.endEdit();
    				}
    			},this);
    			if(changed) {
    				e.data.grid.getStore().save();
    				//n.select();
					//var s = this.serviceGrid.getStore();
					//s.setBaseParam('sampling',n.id);
					//s.reload();
				}
    		}
		}, this);

		this.serviceGrid.on('freerecord', function(){
			console.log('need to reload freeGrid');
			this.freeGrid.getStore().reload();
		}, this);

		this.freeGrid.on('nodemoved', function(id){
			var n = this.tubeTree.getNodeById(id);
			n.select();
		},this);

		var config = {
			border:false,
			layout:'border',
			items:[this.tubeTree, {
				region:'center',
				layout:'border',
				items:[this.serviceGrid, this.freeGrid]
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.sampling.Editor.superclass.initComponent.apply(this, arguments);

	}

});

Ext.reg('samplingeditor', App.sampling.Editor);
