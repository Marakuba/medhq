$(function($){
	var p = $("#analysis_set-group td.original p");
	p.each(function(i,el){
		var text = $(el).text().trim();
		var id = $(el).next().val();
		$(el).html('<a href="/admin/lab/analysis/'+id+'/" target="_blank" title="Открыть для редактирования">'+text+'</a>')
	});

	var span = $("#extendedservice_set-group div:not(.empty-form) h3 span.inline_label");
	span.each(function(i,el){
		var id = $($(el).parent()).next().next().val();
		var text = $(el).text().trim();
		$(el).html('<a href="/admin/service/extendedservice/'+id+'/" target="_blank" title="Открыть для редактирования">'+text+'</a>')
	});
	

});