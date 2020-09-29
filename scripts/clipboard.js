$("ul").on("click", "li", function(){
	$(this).toggleClass("selected");
	copyToClipboard($(this));
	$(this).attr('title', 'Copied to clipboard!');
});

$("ul").on("click", "span", function(event){
	$(this).parent().fadeOut(500,function(){
        chrome.storage.sync.get('vti_clipboard', data=>{
            data = data.vti_clipboard;
            if(data != undefined) //should never exist, but better be safe than sorry!
            {
                let index = data.indexOf($(this).text());
                data.splice(index, 1);
                chrome.storage.sync.set({'vti_clipboard':data}, ()=>{
                    $(this).remove();
                });
            }
        });
	});
	event.stopPropagation();
});

$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		var $newItem = $(this).val();
		if ($newItem.length > 3) {
            $(this).val("");
            chrome.storage.sync.get('vti_clipboard', data=>{
                data = data.vti_clipboard;
                console.log("load init", data);
                if(data != undefined) //records exist
                {
                    data.push($newItem);
                }
                else
                {
                    data = [$newItem];
                }
                chrome.storage.sync.set({'vti_clipboard': data}, ()=>{
                    $("ul").append("<li><span class='delete'><i class='fa fa-trash'></i></span>" + $newItem + "</li>")            
                });
            });
			
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

// Load initial results with queries
chrome.storage.sync.get('vti_clipboard', data=>{
    data = data.vti_clipboard;
    if(data != undefined)
    {
        data.forEach(item => {
            
            $("ul").append("<li><span class='delete'><i class='fa fa-trash'></i></span>" + item + "</li>")            
        });
    }
});