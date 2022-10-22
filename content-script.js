const timerLength = 1000; // 3 seconds
setTimeout(() => {
    $('#myH1').text('Woah I have changed!');
}, timerLength);

const onViewLoad = () => {
    $('#eBreathOverlay_slideIn').on('animationend', function(){
        $('#eBreathOverlay_slideIn').css('display', 'none');
        $('#eBody').addClass('eBody_postBreath');
        $('#decisionNav').css('display', 'block');
    });
}

$(document).ready(function() {
    // Append main extension div to body
    var extensionOverlay = $('body').load(chrome.runtime.getURL('views/main.html'), onViewLoad);
});
