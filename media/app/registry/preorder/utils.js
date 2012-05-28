Ext.ns('App.preorder');

App.preorder.getRowClass = function(record, index, p, store) {
	var service = record.get('service');
	var visit = record.get('visit');
	var today = new Date();
	if (record.data.start){
		var start_date = record.data.start.clone(); 
		var actual = start_date.clearTime() >= today.clearTime();
	} else {
		var actual = true;
	}
	if (record.data.comment){
		p.body = '<p class="helpdesk-row-body"> Комментарий: '+record.data.comment+'</p>';
	};
	if (visit) {
		return 'preorder-visited-row-body';
	};
	if (!actual) {
		return 'preorder-deactive-row-body';
	};
	if (record.data.service){
		in_array = false;
		var branches = Ext.decode(record.data.branches);
		Ext.each(branches,function(br){
			if (state == br) in_array = true;
		});
		if (!in_array) {
			return 'preorder-other-place-row-body';
		};
	};
	if (actual) {
		return 'preorder-actual-row-body';
	};
	return 'preorder-deactive-row-body';
};

App.preorder.ErrorWindow = Ext.extend(Ext.Window, {
	initComponent : function() {
		
		this.tpl = new Ext.Template([
			'<div name="error">',
		        '<br><span class=error">{0} {1}</span></br>',
		    '</div>'
		]);
		this.captionTpl = new Ext.Template([
			'<div name="caption">',
		        '<br><span class=error">{0}</span></br>',
		    '</div>'
		]);
		this.accessedTpl = new Ext.Template([
			'<div name="accessed">',
		        '<br><span class=accessed">{0}</span></br>',
		    '</div>'
		]);
		this.form = new Ext.Panel({
			layout:'fit',
			border:false,
			autoScroll:true,
			items:[]
		});
		config = {
			title:'Ошибки',
			width:650,
			height:480,
			autoScroll:true,
			layout:'fit',
			items:this.form,
			modal:true,
			border:false,
			buttons:[{
				text:'Ок',
				handler:this.onOk.createDelegate(this),
				scope:this
			},{
				text:'Отмена',
				handler:this.onCancel.createDelegate(this,[false]),
				hidden:this.errorType == 'alert',
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.preorder.ErrorWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.setTitle(String.format('Ошибки: {0}',this.errorCaption));
			Ext.each(this.errors,function(error){
				this.tpl.append(this.form.body,error);
			},this);
			this.captionTpl.append(this.form.body,[this.errorCaption]);
			if(this.recs && this.recs.length){
				Ext.each(this.recs,function(record){
					this.accessedTpl.append(this.form.body,[record.data.service_name || record.data.staff_name + ' - без услуги']);
				},this);
			}
			
		})
		
	},
	onOk:function(){
		if (this.fn){
			Ext.callback(this.fn, this.scope || window, []);
		}
	},
	
	onCancel: function(){
		this.close()
	}
	
});

App.preorder.accessCheck = function(records,fn,scope){
	/*
	 * Функция проверки записей предзаказов на возможность оформления по ним визита
	 * Предполагается, что records - массив моделей App.models.preorderModel,
	 * в которой имеются поля service_name либо staff_name(если предзаказ без услуги)
	 * Функция возвращает либо массив записей, прошедших отбор, либо пустой список
	 * */
	var makeErrorText = function(text,type,title){
		var error = ['']
			switch(type){
				case 'staff':
					error[0] = String.format('Врач {0}: ', title || 'Не указан');
					break;
				case 'service':
					error[0] = String.format('Услуга {0}: ', title || 'Не указана');
					break;
				case 'general':
					error[0] = 'Ошибка!';
					break;
				default: 
					error['0'] = title || ''
					break;
			};
		error['1'] = text || '';
		return error
	};
	
	
	var only_one_patient = true;
	var only_one_ptype = true;
	var errors = [];
	var patient = records[0].data.patient;
	var ptype = records[0].data.payment_type;
	Ext.each(records,function(rec){
    	if (rec.data.patient != patient){
    		only_one_patient = false
    		return
    	}
    	if (rec.data.payment_type != ptype){
    		only_one_ptype = false
    		return
    	}
    });
	
	if (!only_one_patient){
		errors.push(makeErrorText('Выбрано несколько пациентов!','general'));
	};
	if(!only_one_ptype){
		errors.push(makeErrorText('Выбрано несколько видов оплаты!','general'));
	};
	
    var errorType = 'alert';
    var errorCaption = '';
    if (!errors.length){
    	var recs = new Array();
		Ext.each(records, function(record){
			var today = new Date();
			if (record.data.start) {
				var start_date = record.data.start.clone(); 
				var actual = start_date.clearTime() >= today.clearTime();
			} else {
				var actual = true
			};
			
	    	if (!record.data.patient){
	    		//В некоторых предзаказах может не быть услуги, но врач наверняка есть.
	    		if (record.data.service){
	    			var error = makeErrorText('Не указан пациент!','service',record.data.service_name);
	    		} else {
	    			var error = makeErrorText('Не указан пациент!','staff', record.data.staff_name);
	    		};
	    		errors.push(error);
	    		errorType = 'confirm';
	    		return
	    	};
	    	if (record.data.service){
				var in_array = false;
				var branches = Ext.decode(record.data.branches);
	    		Ext.each(branches,function(br){
					if (state == br) in_array = true;
				});
	    		if (!in_array) {
	    			var error = makeErrorText(String.format('Вы не можете работать с этой организацией: {0}!', record.data.execution_place_name),'service',record.data.service_name);
	    			errors.push(error);
	    			errorType = 'confirm';
	    			return
	    		};
	    	};
	    	if (record.data.visit){
	    		if (record.data.service){
	    			var error = makeErrorText('По этой услуге уже оформлен визит!','service',record.data.service_name);
	    		} else {
	    			var error = makeErrorText('По этой услуге уже оформлен визит!','staff', record.data.staff_name);
	    		};
	    		errors.push(error)
	    		errorType = 'confirm';
	    		return
	    	}
	    	
	    	if (!actual){
	    		if (record.data.service){
	    			var error = makeErrorText('Данный предзаказ просрочен!','service',record.data.service_name);
	    		} else {
	    			var error = makeErrorText('Данный предзаказ просрочен!','staff', record.data.staff_name);
	    		};
	    		errors.push(error);
	    		errorType = 'confirm';
	    		return
	    	}
	    	
	    	recs.push(record);
		});
		//Сформирован массив ошибок и массив допустимых строк
	    if (!recs.length){
	    	errorType = 'alert';
	    	errorCaption = 'Нет ни одного предзаказа, удовлетворяющего условиям';
	    } else {
	    	errorCaption = 'Продолжить оформление оставшихся записей?'
	    };
    };
    
    if (errors.length){
    	var errorWin = new App.preorder.ErrorWindow({
    		errorCaption:errorCaption,
    		errorType:errorType,
    		errors:errors,
    		recs:recs,
    		fn:function(){
    			errorWin.close();
    			//издержки параллелизации
    			if (recs && recs.length){
    				if (fn){
						Ext.callback(fn, scope || window, [recs]);
					} else {
						return recs
					}
    			}
    		}
    	});
    	errorWin.show();
    } else {
    	if (recs){
    		if (fn){
				Ext.callback(fn, scope || window, [recs]);
			} else {
				return recs
			}
    	}
    }
}