$(function($){
	var p = $("#analysis_set-group td.original p");
	p.each(function(i,el){
		var text = $(el).text().trim();
		var id = $(el).next().val();
		$(el).html('<a href="/admin/lab/analysis/'+id+'/" target="_blank" title="Открыть для редактирования">'+text+'</a>')
	});
});