chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { urlMatches: '.+'},
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
    
    chrome.storage.sync.set({ 'startDisabled': false });
    chrome.storage.sync.set({ 'stopDisabled': true });
});

const createRefreshAlarm = () => {
    chrome.storage.sync.get(['refreshInterval'], (result) => {
        chrome.alarms.create('refreshAlarm', {
            when: Date.now() + result.refreshInterval * 1000,
        });
    });
};

let intervalPointer = null;
let countdown = 0;

const stopInterval = () => {
    if(intervalPointer) clearInterval(intervalPointer);
};

const updateCountdown = () => {
    if(countdown !== 0) {
        countdown--;
        chrome.browserAction.setBadgeText({text: `${countdown}`});
    }
}

const refreshListener = (alarm) => {
    if (alarm.name === 'refreshAlarm') {
        chrome.storage.sync.get(['refreshTab', 'refreshInterval'], (result) => {
            chrome.tabs.reload(result.refreshTab);
            countdown = result.refreshInterval;
            chrome.browserAction.setBadgeText({ text: `${result.refreshInterval}`});
            createRefreshAlarm();
        });
    }
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.data === 'createRefreshAlarm') {
        chrome.alarms.onAlarm.addListener(refreshListener);
        createRefreshAlarm();
        chrome.storage.sync.get(['refreshInterval'], (result) => {
            countdown = result.refreshInterval;
            stopInterval();
            intervalPointer = setInterval(updateCountdown, 1000);
        });
    }
    if (message.data === 'stopRefresh') {
        stopInterval();
        chrome.browserAction.setBadgeText({ text: '' });
        chrome.alarms.clearAll();
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.sync.get(['refreshTab'], (result) => {
        if (result.refreshTab === tabId) {
            chrome.browserAction.setBadgeText({text: ''});
            chrome.alarms.onAlarm.removeListener(refreshListener);
            chrome.storage.sync.set({ 'startDisabled': false });
            chrome.storage.sync.set({ 'stopDisabled': true });
            stopInterval();
        }
    });
});