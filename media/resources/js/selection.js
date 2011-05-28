var activeChoicer;

function selectionCallback(id, title) {
	$.fancybox.close();
	if (activeChoicer) { 
		onSelection(activeChoicer, id, title); 
	}
}

function onSelection(choicer, id, title) {
	var choicer = $(choicer); 
	dv = choicer.prev();
	dv.text(title);
	field = $("#id_hidden_"+choicer[0].id.replace('_handler',''));
	field.val(id);
	choicer.text('Изменить');
	if (!choicer.hasClass('required')) {
		rm = choicer.next();
		rm.removeClass('hid');
		rm.unbind('click');
		rm.bind('click', function(){
			dv.text('');
			$(this).addClass('hid');
			$(choicer).text('Выбрать');
		});
	}
}

jQuery(function($){
    //$("#id_0-birth_day").mask("99.99.9999");
    //$("#id_0-contact_phone").mask("(999) 999-9999");
    //$("#id_0-sample_dt").mask("99.99.9999 99:99");
	
	$(".choicer").click(function(){
		activeChoicer = this;
		//onSelection(this);
	});
	$(".choicer").fancybox({
		width:600,
		height:550,
		speedIn:100,
		speedOut:100,
		transitionIn:'none'
	});
});