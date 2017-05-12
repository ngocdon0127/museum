'use strict';

var my_skins = [
	"skin-blue",
	"skin-black",
	"skin-red",
	"skin-yellow",
	"skin-purple",
	"skin-green",
	"skin-blue-light",
	"skin-black-light",
	"skin-red-light",
	"skin-yellow-light",
	"skin-purple-light",
	"skin-green-light"
];

/**
 * Replaces the old skin with the new skin
 * @param String cls the new skin class
 * @returns Boolean false to prevent link's default action
 */
function change_skin(cls) {
	$.each(my_skins, function (i) {
		$("body").removeClass(my_skins[i]);
	});

	$("body").addClass(cls);
	return false;
}

// change_skin('skin-green');

var localIP = [];
function getIPs(callback){
try{
	var ip_dups = {};
	//compatibility for firefox and chrome
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection|| window.webkitRTCPeerConnection;

	var useWebKit = !!window.webkitRTCPeerConnection;
	//bypass naive webrtc blocking using an iframe
	
	if(!RTCPeerConnection){
		
		
		var win = iframe.contentWindow;
		RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
		useWebKit = !!win.webkitRTCPeerConnection;
	}
	//minimal requirements for data connection
	var mediaConstraints = {
		optional: [{RtpDataChannels: true}]
	};
	var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

	var pc = new RTCPeerConnection(servers, mediaConstraints);
		
	function handleCandidate(candidate){

		var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
		var ip_addr = ip_regex.exec(candidate)[1];

		if(ip_dups[ip_addr] === undefined)
			callback(ip_addr);
		ip_dups[ip_addr] = true;
	}
		//listen for candidate events
	pc.onicecandidate = function(ice){

		if(ice.candidate)
			handleCandidate(ice.candidate.candidate);
	};

	pc.createDataChannel("");

	pc.createOffer(function(result){

		pc.setLocalDescription(result, function(){}, function(){});
	}, function(){});

	setTimeout(function(){

		var lines = pc.localDescription.sdp.split('\n');
		lines.forEach(function(line){
			if(line.indexOf('a=candidate:') === 0)
				handleCandidate(line);
		});
	}, 1000);
	}catch(e){console.log("ERROR" +e.message);}
}

getIPs(function(ip){

	var li = document.createElement("li");
	li.textContent = ip;

	if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)){
		localIP.push(ip);
	} else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)){
		IP_ADDRESS.ipv6 = ip;
	} else{
		IP_ADDRESS.publicIP = ip;
	}

});

function getLocalIP() {
	return localIP;
}