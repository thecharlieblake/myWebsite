var power;

var baseURL = "https://api.lifx.com/v1/lights/id:d073d501fe7d/";
var toggleButton = document.getElementById("toggle");
var statusMsg = document.getElementById("status_msg");
var optional = document.getElementById("optional");

function setup() {
	// First checks to see if the light is on.
	// Sets button text accordingly
	checkPower();
}

function checkPower() {
	var xhr = new XMLHttpRequest();
	xhr.open("get", baseURL, true);

	setStandardHeaders(xhr);

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var rsp = JSON.parse(xhr.responseText)[0];
			if (rsp.power === "on") {
				powerUp();
				setBackgroundColorHSV(rsp.color.hue, rsp.color.saturation, rsp.brightness);
			} else
				powerDown();
		}
	}

	xhr.send();
}

function powerUp() {
	power = true;
	statusMsg.innerHTML = "Charlie's bulb is on. This means he's probably in his room.";
	toggleButton.innerHTML = "Turn Off";
	optional.style.display = "block";
}

function powerDown() {
	power = false;
	statusMsg.innerHTML = "Charlie's bulb is off. He's probably not in his room.";
	toggleButton.innerHTML = "Turn On";
	optional.style.display = "none";
}

function toggle() {
	// disable the button for 3 seconds
	toggleButton.disabled = true;
	setTimeout(function() {toggleButton.disabled = false}, 3000)

	var xhr = new XMLHttpRequest();
	xhr.open("post", baseURL + "toggle", true);

	setStandardHeaders(xhr);
	xhr.setRequestHeader("content-type", "application");

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 207) {
			if (power) {
				powerDown();
			} else {
				powerUp();
				setTimeout(checkPower(), 3000);
			}
		}
	}

	xhr.send();
}

function setColor() {
	var color = "#" + document.getElementById("color_picker").jscolor.toString();
	setBackgroundColor(color);
	var xhr = new XMLHttpRequest();
	xhr.open("put", baseURL + "state", true);

	setStandardHeaders(xhr);
	xhr.setRequestHeader("content-type", "application");
	
	var requestObj = {"power":"on", "color":color};
	xhr.send(JSON.stringify(requestObj));
}

function setStandardHeaders(xhr) {
	xhr.setRequestHeader("Accept", "*/*");
	xhr.setRequestHeader("Authorization", "Bearer c13761c0d9db6d527cb54207a4e6e384791d7f6698e93ecb6c473a4cc2a950f6");
}

function setBackgroundColor(color) {
	var bodyStyle = document.getElementsByTagName('body')[0].style;
	bodyStyle.backgroundColor = color;
	
	console.log(color);
	// if the background is dark, make the text light, and vice versa
	bodyStyle.color = invertColor(color);
}

function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}

function setBackgroundColorHSV(h,s,v) {
	setBackgroundColor(new HSVColour(parseInt(h), parseInt(s * 100), parseInt(v * 100)).getCSSHexadecimalRGB());
}
