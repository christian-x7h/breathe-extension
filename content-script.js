const getDomain = () => {
    return psl.parse(window.location.hostname);
}

const getKey = (domain) => {
    return domain + '_attempts';
}

const lessThan24HoursAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    return diff < 86400000;
}

const storeAttempt = () => {
    const domain = getDomain();
    const storageKey = getKey(domain)
    // Model: { domain: { count: 0, timestamp: 0 } }
    const domainAttempts = chrome.storage.sync.get(storageKey);

    if (domainAttempts && lessThan24HoursAgo(domainAttempts.timestamp)) {
        const newDomainAttempts = parseInt(domainAttempts.count) + 1;
        let storageObj = {};
        storageObj[storageKey] = { count: newDomainAttempts, timestamp: Date.now() }
        chrome.storage.sync.set(storageObj);
    } else {
        let storageObj = {};
        storageObj[storageKey] = { count: 1, timestamp: Date.now() }
        chrome.storage.sync.set(storageObj);
    }
}

const getDomainAttempts = () => {
    const domain = getDomain();
    const domainAttempts = chrome.storage.sync.get(getKey(domain));
    return domainAttempts.count;
}

const onViewLoad = () => {
    $('#eBreathOverlay_slideIn').on('animationend', function(){
        $('#eBreathOverlay_slideIn').css('display', 'none');
        $('#eBody').addClass('eBody_postBreath');
        $('#decisionNav').css('display', 'block');
        $('#breathMessage').css('display', 'none');
        const attempts = getDomainAttempts()
        const domain = getDomain();
        $('#attemptsCount').text(attempts);
        const prefix = attempts === 1 ? 'time' : 'times';
        $('#attemptsText').text(prefix + ' you have opened ' + domain + ' today');
    });
}

storeAttempt();

$(document).ready(function() {
    // Append main extension div to body
    var extensionOverlay = $('body').load(chrome.runtime.getURL('views/main.html'), onViewLoad);
});
