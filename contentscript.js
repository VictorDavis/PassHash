
activePass = null;

function sweep() {
	
	var inputs = document.getElementsByTagName("input");

	var i, passlist = [];
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].type == "password") {
			passlist.push(inputs[i]);
		}
	}
	node = passlist[0];

	for (i = 0; i < passlist.length; i++) {
		
		// if this field has not *already* been passhashed
		var zero = passlist[i].parentElement.getElementsByClassName("passhash").length;
		
		// paypal loads password fields in the background, then displays them.
		// passhash should not mess with them unless they are visible
		var paypal = (passlist[i].offsetHeight > 0);
		
		if ((zero == 0) & paypal) {
		
			reladiv = document.createElement("div");
			reladiv.className = "reladiv";
			reladiv.style.position = "relative";
			reladiv.style.height = passlist[i].offsetHeight;
			reladiv.style.margin = '0px';
			reladiv.style.padding = '0px';
			
			img = document.createElement("img");
			img.src = chrome.extension.getURL("icon.png");
			img.height = passlist[i].offsetHeight;
			img.className = "passhash";
			img.style.position = "absolute";
			img.style.top = "0px";
			img.style.zIndex = 3;
			
			// appendChild will reorder your node to the end of its list of sisters, must use replaceChild
			myparent = passlist[i].parentElement;
			myparent.replaceChild(reladiv, passlist[i]);
			
			reladiv.appendChild(passlist[i]);
			reladiv.appendChild(img);
			img.style.left = (passlist[i].offsetWidth + passlist[i].offsetLeft - passlist[i].offsetHeight)+"px";
			
			img.onclick = function() {
				activePass = this.parentElement.getElementsByTagName("input")[0];
				console.log(activePass);
				
				// extracts simple domain name, ignoring .com, .net, and subdomains www. etc
				// ex facebook google homedepot
				var site = document.domain.toLowerCase().match("([a-z]*)\.[a-z]*$");
				console.log('sending domain "'+site[0]+'" to background...');
				chrome.storage.sync.set({'site': site[1], 'domain':site[0]}, function() {
					// Notify that we saved.
					console.log('Settings saved: '+site[0]);
				});
			}
			
			iframe = document.createElement("iframe");
			iframe.src = chrome.extension.getURL("popup.html");
			iframe.height = "42px";
			iframe.width = "100%";
			iframe.style.borderWidth = "0";
			$('.passhash').qtip( 
			{
				content: $(iframe),
				position: {
					at: "bottom right",
					my: "top right"
				},
				show: {
					event: 'click'
				},
				hide: {
					event: 'nonexisting'
				},
				style: {
					width: "400px",
					"max-width": "400px",
					"min-width": "400px",
				}
			});
		}
	}
}
		
document.body.onclick = function(e) {
	$('.passhash').qtip("hide");
}

$(document).ready(function() { sweep(); });

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'insert_text') {
		activePass.value = msg.pass;
		
		// disappear qtip after insert
		$('.passhash').qtip("hide");
  } else if (msg.action == 'sweep') {
		sweep();
	}
});