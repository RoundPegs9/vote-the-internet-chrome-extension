$("ul").on("click", "li", function(){
	$(this).toggleClass("selected");
	copyToClipboard($(this));
	$(this).attr('title', 'Copied to clipboard!');
});

$("ul").on("click", "span", function(event){
	$(this).parent().fadeOut(500,function(){
		$(this).remove();
	});
	event.stopPropagation();
});

$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		var $newItem = $(this).val();
		if ($newItem.length > 3) {
			$(this).val("");
			$("ul").append("<li><span><i class='fa fa-trash'></i></span>" + $newItem + "</li>")
		} else {
			$(this).val("");
			$(this).attr("placeholder", "Need at least 4 characters!");			
		}
	}
});

$(".fa-plus").click(function(){
	$("input[type='text']").slideToggle();
});

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
	document.execCommand("copy");
	$(element).attr('title', 'Copied to clipboard!');
    $temp.remove();
}