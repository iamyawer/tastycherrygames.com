function runwith_delay()
{
	canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)';
}

// run this in 500ms (1 second)
setTimeout(runwith_delay, 100);
//document.body.style.background=//[data-pixel-art="true"];//#231F20//"#89D4CF";//"#74F2CE"//"pink";
var background_color_hexcode = "";

// Check if the value is null or empty
if (!background_color_hexcode) {
  // Set a default value
  background_color_hexcode = "#89D4CF";
}

// Use the value to set the background color of the body element
document.body.style.background = background_color_hexcode;
// Create a new style element and add your custom CSS rules
var style = document.createElement("style");
style.innerHTML = "body{margin:0px}";
document.head.appendChild(style);

// Create a new script element and add your custom JavaScript code
var script = document.createElement("script");
script.innerHTML = 'console.log("hello");';
document.body.appendChild(script);


var unity_build_width="1344";
var unity_build_height="756";
function resize_tasty_cherry(){
		     
			console.log("wtf");
			container.className = "unity-mobile";
			let scaleToFit=true;
			
			//var containerr = canvas.parentElement;
					var w;
					var h;

					if (scaleToFit) {
						w = window.innerWidth;
						h = window.innerHeight;

						var r =  unity_build_height / unity_build_width ;

						if (w * r > window.innerHeight) {
							w = Math.min(w, Math.ceil(h / r));
						}
						h = Math.floor(w * r);
					} else {
						w =  unity_build_width ;
						h =  unity_build_height ;
					}

				container.style.width = canvas.style.width = w + "px";
				container.style.height = canvas.style.height = h + "px";
				
				container.style.top="50%";
				container.style.left= "50%";
				container.style.transform="translate(-50%, -50%)";
				
				//container.style["-webkit-background-size"] = "100px"transform: translate(-50%, -50%);
}

/// send to gameobject name 'tcg' in function setMobileWebGL 1 or zero, depending upon its mobile device state 
function checkMobileWebGL(){
	if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Mobile device style: fill the whole browser client area with the game canvas:

     gameInstance.SendMessage('tcg', 'setMobileWebGL',1); 
    } else {
        // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:

      
    }
}	  
	  
