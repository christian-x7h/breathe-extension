// TODO
// add icons, debug css font priority in certain pages (reddit, instagram), add Alarm with Alarm API for break reminders

const getAttemptsCount = async (domain) => {
    const data = await chrome.storage.sync.get('domainAttempts');
    return data.domainAttempts[domain].count;
}

chrome.runtime.onMessage.addListener((request, sender) => {
    const type = request.type;
    const domain = request.tabUrlDomain;
    
    if (type === 'triggerOverlay') {
        new Promise((resolve, reject) => $(document).ready(() => resolve()))
            .then(() => new Promise((resolve, reject) => {
                $.get(chrome.runtime.getURL('views/main.html'), (data) => {
                    $('body').prepend(data);
                    resolve();
                });
            }))
            .then(() => {

                // Toggle animation on tab visibility change, does not seem to work reliably
                $(document).on('visibilitychange', () => {
                    const overlays = $('.eBreathOverlay');
                    const toggle = overlays.css('animation-play-state') === 'running' ? 'paused' : 'running';
                    overlays.css('animation-play-state', toggle);
                });

                // Setup UI behavior
                $('#eBreathOverlay_slideIn').on('animationend', () => {
                    $('#eBreathOverlay_slideIn').css('display', 'none');
                    $('#eBody').addClass('eBody_postBreath');
                    $('#decisionNav').css('display', 'block');
                    $('#breathMessage').css('display', 'none');
                    
                    getAttemptsCount(domain).then((attemptsCount) => {
                        $('#attemptsCount').text(attemptsCount);
                        const prefix = attemptsCount === 1 ? 'time' : 'times';
                        $('#attemptsText').text(prefix + ' you have opened ' + domain + ' today');
                    });

                    $('#abortButton').on('click', () => {
                        chrome.runtime.sendMessage({ closeTab: true });
                    });

                    $('#continueButton').on('click', () => {
                        $('#eBody').remove();
                    });
                });
            })
            .catch(e => console.log(`Promise exception caught: ${e}`));
    }
});
