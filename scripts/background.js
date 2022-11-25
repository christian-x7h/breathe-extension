// Listen for tab close event from content script
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
chrome.tabs.onUpdated.addListener(function () {
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions).then((tabs) => {
        const tabId = tabs[0].id;
        const tabOpenerId = tabs[0].openerId;
        const msg = {
            tabId: tabId,
            tabOpenerId: tabOpenerId
        }
        chrome.tabs.sendMessage(tabId, msg, function (response) {
            console.log(response.farewell);
        });
    });
})
