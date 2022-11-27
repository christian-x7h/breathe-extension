import { parse } from '../lib/tldts.esm.min.js';

const domainTabIds = {};

const lessThan24HoursAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    return diff < 86400000;
}

const getActiveDomains = async () => {
    const data = await chrome.storage.sync.get('options');
    const activeDomains = data.options.activeDomains;
    if (activeDomains && activeDomains.length > 0) {
        return activeDomains;
    } else {
        return [];
    }
};

const storeAttempt = async (domain) => {

    const data = await chrome.storage.sync.get('domainAttempts');

    const domainAttempts = data.domainAttempts;

    let attempt = {};
    if (domainAttempts && domainAttempts[domain] && lessThan24HoursAgo(domainAttempts[domain].timestamp)) {
        attempt = { count: parseInt(domainAttempts[domain].count) + 1, timestamp: Date.now() }
    } else {
        attempt = { count: 1, timestamp: Date.now() }
    }

    let updatedData = { domainAttempts: {} };
    updatedData.domainAttempts[domain] = attempt;
    return chrome.storage.sync.set(updatedData);
}

const handleTabEvent = async (tabId, tabOpenerId, tabUrl) => {

    const activeDomains = await getActiveDomains();
    const domain = parse(tabUrl).domain;

    // If domain is not in active domains, exit
    if (!activeDomains.includes(domain)) {
        return;
    }

    if (domainTabIds[domain] && domainTabIds[domain].includes(tabId)) {
        return;
    } else if (domainTabIds[domain] && !domainTabIds[domain].includes(tabId)) {
        domainTabIds[domain].push(tabId);
    } else {
        domainTabIds[domain] = [tabId];
    }

    await storeAttempt(domain);

    const msg = {
        type: 'triggerOverlay',
        tabId: tabId,
        tabOpenerId: tabOpenerId,
        tabUrl: tabUrl,
        tabUrlDomain: domain,
    }

    chrome.tabs.sendMessage(tabId, msg);
}

// Listen for tab close message from content script
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.closeTab === true) {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.remove(tabs[0].id);
            });
        }
    }
);

// Listen for tab open events
chrome.tabs.onActivated.addListener(function () {
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions).then((tabs) => {
        if(!tabs || tabs.length === 0) {
            return;
        }
        const tabId = tabs[0].id;
        const tabOpenerId = tabs[0].openerId;
        const tabUrl = tabs[0].url;
        handleTabEvent(tabId, tabOpenerId, tabUrl)
            .catch(e => console.log(`Promise exception caught: ${e}`));
    });
})

// Listen for tab update events
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') {
        return;
    }
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions).then((tabs) => {
        if(!tabs || tabs.length === 0) {
            return;
        }
        const tabId = tabs[0].id;
        const tabOpenerId = tabs[0].openerId;
        const tabUrl = tabs[0].url;
        handleTabEvent(tabId, tabOpenerId, tabUrl)
            .catch(e => console.log(`Promise exception caught: ${e}`));
    });
});