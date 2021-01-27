let startButton = document.getElementById('startRefresh');
let intervalInput = document.getElementById('intervalInput');
let error = document.getElementById('error');

const refresh = () => {
    const interval = +intervalInput.value;
    if(isNaN(interval)) {
        error.innerHTML = `${intervalInput.value} is not a number!`;
        return;
    }
    error.innerHTML = '';

    startButton.textContent = `Refreshing every ${interval} sec...`;
    setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.reload(tabs[0].id, {}, refresh)
        });
    }, interval * 1000)
};

startButton.onclick = refresh;