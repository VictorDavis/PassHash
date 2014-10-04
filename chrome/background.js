
/**
 * PassHash > background.js
 * Written by Victor Davis Sep 2014
 * Contact VictorAlynDavis@gmail.com
 * 
 * This file is necessary to relay messages from content script to popup and vice versa,
 * it is always running in the background as long as the extension is enabled
 */

/**
 * Occurs when the user clicks the icon in the upper right.
 * Send message to content script to sweep the page for un-mutated password fields
 * Certain websites like facebook, homedepot, put a sign-in in a popup screen,
 * so the sweep() function did not catch them on DOM load.
 */
chrome.browserAction.onClicked.addListener(
	function() {
		// trigger content script to sweep for password inputs
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			var obj = {action: "sweep"};
			chrome.tabs.sendMessage(tabs[0].id, obj, function(response) {});
		});
	}
);

/**
 * Popup cannot access DOM or talk to content script directly, so this
 * listener runs in the background to relay ANY (1.2) command from popup.js
 * to contentscript.js
 */
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		// relay message on to content script
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
				//sendResponse({'request': request, 'response': response});
			});
		});
	}
);