$("ul").on("click", "li", function(){
    let $text =  $(this).find('.clip');
    $($text).toggleClass("selected");
	copyToClipboard($text);
	$($text).attr('title', 'Copied to clipboard!');
});

$("ul").on("click", "span", function(event){
    if($(this).attr('class') == 'delete')
    {
        $(this).parent().fadeOut(450,function(){
            chrome.storage.local.get('vti_clipboard', data=>{
                data = data.vti_clipboard;
                let text =  $(this).find('.clip').text();
                if(data != undefined && data[text] != undefined) //should never exist, but better be safe than sorry!
                {
                    delete data[text];
                    chrome.storage.local.set({'vti_clipboard':data}, ()=>{
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
            chrome.storage.local.get('vti_clipboard', data=>{
                data = data.vti_clipboard;
                let date = new Date().toDateString();
                if(data != undefined && Object.keys(data).length > 0) //records exist
                {
                    data[$newItem] = date;
                }
                else
                {   
                    data = {};
                    data[$newItem] = date;
                }
                chrome.storage.local.set({'vti_clipboard': data}, ()=>{
                    let current_length = $(".delete").length;
                    $("ul").append(`<li><span class='delete'><i class='fa fa-trash'></i></span><span class='clip' id= ${current_length}>`+ $newItem + "</span><p>" + date + "</p>" + "</li>")            
                    document.getElementById(current_length).innerText = $newItem;
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
chrome.storage.local.get('vti_clipboard', data=>{
    data = data.vti_clipboard;
    if(data != undefined && Object.keys(data).length > 0)
    {
        let current_length = 0
        for (var key in data){
            $("ul").append(`<li><span class='delete'><i class='fa fa-trash'></i></span><span class='clip' id=${current_length}>`+ key + "</span><p>" + data[key] + "</p>" + "</li>")            
            document.getElementById(current_length).innerText = key;
            current_length++;
            }
    }
});
