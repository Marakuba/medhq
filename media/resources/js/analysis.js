$(function($){
	var tab = $("#analysis_set-group");
	var cmb = $("#id_analysis_set-__prefix__-profile");
	var p = $("<select id='prf'></select>");
	p.append(cmb.html());
	tab.prepend(p);
	$("#prf").live('change', function(e){
		var v = $(e.target).val();
		var inputs = $('select[id*="profile"]')
					  .not("select[id*='__prefix__']");
		inputs.each(function(i,input){
			var $input = $(input);
			var $p = $input.parent().parent(); 
			if(!v || $input.val()==v) {
				$p.show();
			} else {
				$p.hide();
			}
		});
	});
	tab.prepend("<label for='prf'>Профиль: </label>");
});