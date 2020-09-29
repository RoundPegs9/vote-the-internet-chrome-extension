$("ul").on("click", "li", function(){
    let $text =  $(this).find('.clip');
    $($text).toggleClass("selected");
	copyToClipboard($text);
	$($text).attr('title', 'Copied to clipboard!');
});

$("ul").on("click", "span", function(event){
    if($(this).attr('class') == 'delete')
    {
        $(this).parent().fadeOut(500,function(){
            chrome.storage.sync.get('vti_clipboard', data=>{
                data = data.vti_clipboard;
                let text =  $(this).find('.clip').text();
                if(data != undefined && data[text] != undefined) //should never exist, but better be safe than sorry!
                {
                    delete data[text];
                    chrome.storage.sync.set({'vti_clipboard':data}, ()=>{
                        $(this).remove();
                    });
                }
            });
        });
        event.stopPropagation();
    }
});

$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		var $newItem = $(this).val();
		if ($newItem.length > 3) {
            $(this).val("");
            chrome.storage.sync.get('vti_clipboard', data=>{
                data = data.vti_clipboard;
                let date = new Date().toDateString();
                if(Object.keys(data).length > 0) //records exist
                {
                    data[$newItem] = date;
                }
                else
                {
                    data = {$newItem : date};
                }
                chrome.storage.sync.set({'vti_clipboard': data}, ()=>{
                    $("ul").append("<li><span class='delete'><i class='fa fa-trash'></i></span><span class='clip'>"+ $newItem + "</span><p>" + date + "</p>" + "</li>")            
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
        for (var key in data){
            $("ul").append("<li><span class='delete'><i class='fa fa-trash'></i></span><span class='clip'>"+ key + "</span><p>" + data[key] + "</p>" + "</li>")            
          }
    }
});
