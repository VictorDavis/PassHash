
chrome.browserAction.onClicked.addListener(
	function() {
		// trigger content script to sweep for password inputs
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			var obj = {action: "sweep"};
			chrome.tabs.sendMessage(tabs[0].id, obj, function(response) {});
		});
	}
);

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		var word = request.pass;
		sendResponse({confirmation: word});
		
		// relay message on to content script
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			var obj = {action: "insert_text", pass: word};
			chrome.tabs.sendMessage(tabs[0].id, obj, function(response) {});
		});
	}
);