const timerLength = 1000; // 3 seconds
setTimeout(() => {
    $('#myH1').text('Woah I have changed!');
}, timerLength);

var prefix = "extension://ihgeokjjnbmhbjojfgpigdflcjklplim/";

$(document).ready(function() {
    // Append main extension div to body
    var extensionOverlay = $('body').append('<div id="eBody"></div>');

    $('#eBody').load(chrome.runtime.getURL('views/main.html'));

    $('preloader').on("animationend", function(){
        $(this).css('display', 'none');
    });
});


