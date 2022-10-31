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
