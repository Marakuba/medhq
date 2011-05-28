var patient_id;
var patient_label;
var patient_desc;

function jquery_autocomplete(name, ac_url, force_selection) {
    $(function () {
        var input = $('#id_' + name);
        var hidden_input = $('#id_hidden_' + name);
        ac_info = $("p.ac_help");
        clear_button = $("#ac_clear")
        				.click(function(){
        					input.val("");
        					hidden_input.val("");
        					ac_info.text("");
        					return false;
        				});
        				
        function ac_update(opts) {
			input.val( opts.label );
			hidden_input.val( opts.id );
			html = "<a href=\"/patient/patient/"+opts.id+"\" target=\"_blank\">"+opts.desc+"</a>";
			if (opts.warnings) {
				html += "<span class=\"warnings\">"+opts.warnings+"</span>"; 
			}
			ac_info.html( html );        	
        }
        
        $("#ac_add").fancybox({
			'transitionIn'	:	'none',
			'transitionOut'	:	'elastic',
			'speedIn'		:	100, 
			'speedOut'		:	100,
			'width':860,
			'height':500,
			'hideOnOverlayClick':false, 
			'hideOnContentClick':false,
			'onClosed': function() {
				if (patient_id && patient_label) {
					ac_update({
						id: patient_id,
						label: patient_label,
						desc: patient_desc || ""
					})
				}
			}
        });
        input.autocomplete({
        	source: ac_url,
        	minLength: 3,
			select: function( event, ui ) {
				ac_update(ui.item);
				return false;
			}

        })
        .data( "autocomplete" )._renderItem = function( ul, item ) {
			return $( "<li></li>" )
				.data( "item.autocomplete", item )
				.append( "<a>" + item.label + "<br>" + item.desc + "</a>" )
				.appendTo( ul );
        }
    });
}

autocomplete = jquery_autocomplete;
