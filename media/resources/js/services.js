function isArray(obj) {
    return obj.constructor == Array;
}

XMenu = function(menu, options) {
	this.storage = {};
	
	this.iterMenu = function(menu, parent) {
		self = this;
		$.each(menu, function(i, item) {
					item.count=0;
					if (parent) {
						item.parent = parent;
					} else {
						item.isRoot = true;
					}
					if (!item.children) {
						item.isLeaf = true;
					}
					self.storage[item.id] = item;
					if (item.children) {
						self.iterMenu(item.children, item);
					}
				});
	};
	this.menu_tpl = "<ul id='{id}' class='{classes}'>{list}</ul>";
	this.item_tpl = "<li class='x-list-item{extra_class}'><a id='x_menu_{item.id}' href='#{item.id}'>{item.text}</a></li>";
	this.classes = {
		topLevel : "x-menu x-list",
		secondLevel : "x-menu-second x-list hid"
	};
	this.updateCount = function(id,count) {
		this.storage[id].count += count;
		cnt = this.storage[id].count;
		title = $("#x_menu_"+id).text().split(' (')[0];
		new_title = cnt ? title+" ("+cnt+")" : title;
		$("#x_menu_"+id).text( new_title ); 
	};
	this.renderMenu = function(menu, id, cls) {
		list = "";
		self = this;
		$.each(menu, function(i, item) {
					list = list + $.nano(self.item_tpl, {
								item : item
							});
					if (item.children) {
						list = list
								+ "<li>"
								+ self.renderMenu(item.children, item.id + "Menu",
										self.classes.secondLevel) + "</li>";
					}
				});
		return $.nano(self.menu_tpl, {
					id : id,
					classes : cls,
					list : list
				})

	};
	this.serviceList = $(".x-service-list");
	this.priceTpl = "{item.price}.00 руб.";
	this.staffTpl = "<div><select name='orderedservice_set-{i}-staff'>{options}</select><div>";
	this.optionTpl = "<option value='{value}'{selected}>{text}</option>";
	this.setFieldTpl = "orderedservice_set-{id}-{field}";
	this.serviceListTpl = 	
			"<li id='service_{item.id}'>"+
			"<input type='hidden' id='id_orderedservice_set-{i}-id' name='orderedservice_set-{i}-id' value='{order}'>"+
			"<input type='hidden' id='id_orderedservice_set-{i}-service' name='orderedservice_set-{i}-service' value='{item.id}'>"+
			"<input type='hidden' id='id_orderedservice_set-{i}-execution_place' name='orderedservice_set-{i}-execution_place' value='{item.place}'>"+
			"<span class='place-icon'><img src='/media/resources/images/state_{item.place}.png'></span>"+
			"{item.text}"+
			"{staff}<div class='x-amount'>{price}"+
			"<input type='text' class='item-count' id='id_orderedservice_set-{i}-count'  name='orderedservice_set-{i}-count' value='{count}' size='1'></div>"+
			"{del}</li>";

	this.renderStaff = function(count, service) {
		staff = service.staff;
		if (staff && staff.length) { 
			self=this;
			var options;
			$.each(staff, function(i,item){
				options += $.nano(self.optionTpl,{
					value: item[0],
					text: item[1],
					selected: self.original[service.id] && self.original[service.id].staff==item[0] ? ' selected' : ''
				})
			});
			return $.nano(self.staffTpl, {
						options:options,
						i:count
					});
		}
		return ''
	};
	this.deleteTpl = "<input type='checkbox' name='orderedservice_set-{i}-DELETE'>";
	this.addToServiceList = function(id){
		item = this.dataFlat[id];
		if (item) {
			this.serviceList.append($.nano(this.serviceListTpl, {
				i:i,
				item:item,
				price: this.price ? $.nano(this.priceTpl, {item:item}) : "",
				staff: item.staff ? item.staff.length ? this.renderStaff(item.staff, item.id) : '' : '',
				del: this.original[item.id+''] ? $.nano(this.deleteTpl,{i:i}) : ''
			}));
		}
	};
	
	this.removeFromServiceList = function(id){
		item = this.dataFlat[id];
		if (item) {
			$("#service_"+id).remove();
			$("#id_service_"+id).remove();
			//this.serviceList.append($.nano(this.serviceListTpl, {item:item}));
		}
	};
	
	this.updateHiddenFields = function() {
		
	};
	
	this.updateHiddenValue = function(){
		//v = "["+options.selected.join(",")+"]";
		//$("#IdServices").val(v);		
		if (l=this.selected.length) {
			title = "Выбрано услуг: "+l;
		} else {
			title = "Услуги не выбраны";
		}
		$(".x-summary .title").text(title);
		self = this;
		amount = 0;
		$.each(this.selected, function(i,item){
			amount+=(self.dataFlat[item].price*self.itemCount[i]);
		});
		$(".x-summary .amount").text(amount+".00 руб.");
		$("#id_total_paid").val(amount);
		
	};
	
	this.updateServiceList = function() {
		this.serviceList.empty();
		self = this;
		$.each(self.selected, function(i,item){
			item = self.dataFlat[item];
			if (item) {
				self.serviceList.append($.nano(self.serviceListTpl, {
					i:i,
					order:self.original[item.id] ? self.original[item.id].id : '',
					item:item,
					price: self.price ? $.nano(self.priceTpl, {item:item}) : "",
					staff: self.renderStaff(i, item),
					count: self.itemCount[i],
					del: self.original[item.id+''] ? $.nano(self.deleteTpl,{i:i}) : ''
				}));
			}
			
		});
		$('.item-count').live('change', function(){
			id = parseInt($(this).attr('id').split('-')[1]);
			self.itemCount[id]=$(this).val();
			self.updateHiddenValue();
		});
		$('#idTotalForms').val(this.selected.length);
		this.updateHiddenValue();
	};
	
	this.init = function(menu, options) {
		this.onSelect = options.select || function(){ };
		this.dataFlat = options.dataFlat || {};
		this.selected = [];
		this.itemCount = [];
		this.original = {};
		this.initial = options.initial || [];
		this.staff = options.staff || {};
		this.price = options.price || false;
		this.can_change = options.can_change;
		self = this;
		$.each(this.initial, function(i,item){
			self.selected.push(item.service);
			self.itemCount.push(item.count);
			self.original[item.service]=item;
		});
		$('#idInitialForms').val(this.selected.length);
		this.iterMenu(menu);
		var container = $(options.el || ".x-menu-container");
		container.empty();
		list = this.renderMenu(menu, "topMenu", this.classes.topLevel);
		container.append(list);
		if (options.auto_populate) {
			$.each(this.selected, function(i,item){
				//self.addToServiceList(item);
				
				self.updateCount(self.dataFlat[item].parent, 1);
			});
			self.updateHiddenValue();
			self.updateServiceList();
		}
		$('.x-list-item a').live('click', function(e) {
					targId = e.currentTarget.id;
					hash = $(this)[0].hash.substr(1);
					item = self.storage[hash];
					if (item) {
						if (item.isLeaf) {
							$('.x-list-item').removeClass('selected');
							$(this).parent().addClass('selected');
							self.onSelect(hash);
						} else {
							// $(".x-menu-second").addClass("hid");
							$("#" + hash + "Menu").slideToggle(150);
						}
					}
					$(this).blur();
					return false;
				});		
	}
	
	options = options || {};
	this.init(menu, options);
	
	
}