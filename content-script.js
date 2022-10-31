// TODO
// shrink continue tap target, clean up repo of unrelated assets, add config of domains to block
// https://stackoverflow.com/a/53021335/1044565

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
        $.get(chrome.runtime.getURL('views/main.html'), (data) => {
            $('body').prepend(data);
            d.resolve();
        });
        return d;
    })
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

            getAttemptsCount().then((attemptsCount) => {
                $('#attemptsCount').text(attemptsCount);
                const domain = getDomain();
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
    });
