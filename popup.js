let startButton = document.getElementById('startRefresh');
let stopButton = document.getElementById('stopRefresh');
let intervalInput = document.getElementById('intervalInput');
let error = document.getElementById('error');

chrome.storage.sync.get(['startDisabled', 'stopDisabled', 'refreshInterval'], (results) => {
    const { startDisabled, stopDisabled, refreshInterval } = results;

    if (startDisabled) startButton.setAttribute('disabled', true);
    if (stopDisabled) stopButton.setAttribute('disabled', true);
    if (refreshInterval) intervalInput.value = refreshInterval;
});

const startRefresh = () => {
    const interval = +intervalInput.value;
    if(isNaN(interval)) {
        error.innerHTML = `${intervalInput.value} is not a number!`;
        return;
    }
    error.innerHTML = '';

    startButton.setAttribute('disabled', true);
    stopButton.removeAttribute('disabled');
    chrome.storage.sync.set({ 'startDisabled': true });
    chrome.storage.sync.set({ 'stopDisabled': false });
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.storage.sync.set({ 'refreshTab': tabs[0].id });
        chrome.storage.sync.set({ 'refreshInterval': interval });
        chrome.runtime.sendMessage({ data: 'createRefreshAlarm' });
        chrome.browserAction.setBadgeText({text: `${interval}`});
    });
};

const stopRefresh = () => {
    startButton.removeAttribute('disabled');
    stopButton.setAttribute('disabled', true);
    chrome.storage.sync.set({ 'startDisabled': false });
    chrome.storage.sync.set({ 'stopDisabled': true });

    chrome.runtime.sendMessage({ data: 'stopRefresh' });
};

startButton.onclick = startRefresh;
stopButton.onclick = stopRefresh;