const getDomain = () => {
    return psl.get(window.location.hostname);
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
    // DomainAttempts Model: { domain: { count: 0, timestamp: 0 } }
    return chrome.storage.sync.get(storageKey)
        .then((result) => {
            const domainAttempt = result[storageKey];
            let data = {};
            if (domainAttempt && lessThan24HoursAgo(domainAttempt.timestamp)) {
                data = { count: parseInt(domainAttempt.count) + 1, timestamp: Date.now() }
            } else {
                data = { count: 1, timestamp: Date.now() }
            }
            let updatedData = {};
            updatedData[storageKey] = data;
            return chrome.storage.sync.set(updatedData);
        });
}

const getAttemptsCount = () => {
    const domain = getDomain();
    const storageKey = getKey(domain);
    return chrome.storage.sync.get(storageKey).then((result) => {
        return result[storageKey].count;
    });
}

storeAttempt()
    .then(() => {
        const d = $.Deferred();
        $(document).ready(() => d.resolve());
        return d;
    })
    .then(() => {
        const d = $.Deferred();
        $('body').load(chrome.runtime.getURL('views/main.html'), () => d.resolve());
        return d;
    })
    .then(() => {

        $('#eBreathOverlay_slideIn').on('animationend', () => {
            $('#eBreathOverlay_slideIn').css('display', 'none');
            $('#eBody').addClass('eBody_postBreath');
            $('#decisionNav').css('display', 'block');
            $('#breathMessage').css('display', 'none');

            getAttemptsCount().then((attemptsCount) => {
                $('#attemptsCount').text(attemptsCount);
                const domain = getDomain();
                const prefix = attemptsCount === 1 ? 'time' : 'times';
                $('#attemptsText').text(prefix + ' you have opened ' + domain + ' today');
            });
        });
    });
