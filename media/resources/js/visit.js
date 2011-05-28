$(function() {
	
	
	var DataFlat = {};
	
	$.each(Data, function(i, item){
		$.each(item, function(j,rec){
			DataFlat[rec.id] = rec;
		});
	});
	
	var tab = $(".x-container");
	tab.empty();
	var tpl = $('#TabTpl');
	if (!price) {
		$('.amount').addClass('hid');
	} 
	tab.html(tpl.html());
	tpl.remove();
	
	var elements = $('.x-elements');
	
	var groups = {};
	
	xmenu = new XMenu(MainMenu, {
		dataFlat: DataFlat,
		//selected: selected,
		initial: initial,
		staff: staff,
		auto_populate: true,
		price: price,
		can_change:can_change,
		select: function(id) {
			$('.cbx').die('change');
			elements.empty();
			html = "<table width='100%'>";
			price_cell = this.price ? "<td width='5%' align='right'>{item.price}</td>" : "";
			item_tpl =  "<tr class='{cls}'>"+
						"<td width='1%'>{cb}</td>"+
						"<td><label for='cbx_{item.id}'>{item.text}</label></td>"+
						price_cell +
						"</tr>";
			self = this;
			$.each(Data[id], function(i, item){
				item_id = item.id+'';
				checked = self.selected.indexOf(item_id)!=-1;
				
				cbTpl = checked ? !self.original[item_id] ? 
				"<input type='checkbox' id='cbx_{item.id}' class='cbx' value='{item.id}' checked>" :
				"<img src='{static_url}resources/images/silk/accept.png' width='16' height='16'>" :
				"<input type='checkbox' id='cbx_{item.id}' class='cbx' value='{item.id}'>";
				html+=$.nano(item_tpl, {
								item:item,
								checked: self.selected.indexOf(item_id)!=-1 ? " checked" : "",
								cls: self.selected.indexOf(item_id)!=-1 ? "selected" : "",
								cb: $.nano(cbTpl, {
									item:item, 
									static_url:static_url
								})
							});
			});
			html+="</table>";
			elements.html(html);
			$('.cbx').live('change', function(){
				checked = $(this).attr('checked');
				val = $(this).val();
				var tr = $(this).parent().parent();
				if (checked) {
					tr.addClass('selected');

					self.selected.push(val);
					self.itemCount.push(1);
					self.updateCount(self.dataFlat[val].parent,1);
					//self.addToServiceList(val);
					self.updateServiceList();
					//self.updateHiddenValue();
				} else {
					tr.removeClass('selected');

					idx = self.selected.indexOf(val);
					self.selected.splice(idx,1);
					self.itemCount.splice(idx,1);
					self.updateCount(self.dataFlat[val].parent,-1);
					self.updateServiceList();
					//self.removeFromServiceList(val);
					//self.updateHiddenValue();
				}
			});
		}
	});
	
	
});