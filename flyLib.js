"use strict";

class FlightArea {
	constructor(xValues,yValues){
		this.xValues = xValues;
		this.yValues = yValues;
	};
	getLowerLeft() {		
						var lowerLeft = [Math.min(...this.xValues),Math.min(...this.yValues)];
						return lowerLeft;
	};
	getUpperRight()	{
						var upperRight = [Math.max(...this.xValues),Math.max(...this.yValues)];
						return upperRight;
					};
	getLongestSide(){
						var R = 6378.137; // Radius of earth in KM
						var storage = [];
						//handling of distance calculation between first and last element in array
						var dLat = this.yValues[3] * Math.PI / 180 - this.yValues[0] * Math.PI / 180;
						var dLon = this.xValues[3] * Math.PI / 180 - this.xValues[0] * Math.PI / 180;
						var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
								Math.cos(this.yValues[0] * Math.PI / 180) * Math.cos(this.yValues[3] * Math.PI / 180) *
								Math.sin(dLon/2) * Math.sin(dLon/2);
						var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
						var d = R * c * 1000; //from km to meters
						storage.push(d);
					for (var i = 1; i < xValues.length;i++) {
						dLat = this.yValues[i] * Math.PI / 180 - this.yValues[i-1] * Math.PI / 180;
						dLon = this.xValues[i] * Math.PI / 180 - this.xValues[i-1] * Math.PI / 180;
						a = Math.sin(dLat/2) * Math.sin(dLat/2) +
								Math.cos(this.yValues[i-1] * Math.PI / 180) * Math.cos(this.yValues[i] * Math.PI / 180) *
								Math.sin(dLon/2) * Math.sin(dLon/2);
						c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
						d = R * c * 1000; //from km to meters
						storage.push(d);
					}
						return Math.max(...storage);		
					};
};	

class Camera {
	constructor() {
		this.focal;
		this.pNumberX;
		this.pNumberY;
		this.sensorX;
		this.sensorY;
		this.recordingRate;
	}
}

/*
Funktion
arguments: sensor width, flight height, focal length
return: longest side of picture 
*/
function calcMaxDistFromFixedHeight(sensor_x,droneHeight,focalLength) {
		var maxDist = (sensor_x*droneHeight)/focalLength
	return maxDist
}
		
/*
Funktion um die verhältnismäßig kleinere Seitenlänge des Bildes zu berechnen;
Function to calculate respective smaller side of the image;
arguments: longest side of picture, pixelnumber vertical, pixelnumber horizontal;
return: smallest side of picture;
*/
function calcSmallerSide(longestSideOfImage, pixelnumber_y, pixelnumber_x) {
		if (pixelnumber_x > pixelnumber_y) {
			var bigSide = pixelnumber_x
			var smallSide = pixelnumber_y
		} else {
			var bigSide = pixelnumber_y
			var smallSide = pixelnumber_x
		}
	return (smallSide*longestSideOfImage)/bigSide
}

/*
Funktion um die Anzahl der benötigten Bilder in horizontaler Richtung zu berechnen
Function to calculate necessary number of horizontal pictures to cover area
arguments: longest side of flight area, maximum horizontal length of image, horizontal overlap
return: number of necessary horizontal pictures
*/
function calcNumberOfHorizontalImages(LongDistanceAOI, maxLengthOfImage, h_Overlap) {
		var checkValHorizontal = LongDistanceAOI - maxLengthOfImage*0.5
		var counterHorizontal = 1
		while (checkValHorizontal >= (maxLengthOfImage/2)) {
			checkValHorizontal -= maxLengthOfImage*(1-h_Overlap)
			counterHorizontal += 1
		}
	return counterHorizontal
}

/*
Funktion um die Anzahl der benötigten Bilder in vertikaler Richtung zu berechnen
Calculation of necessary pictures to cover the area vertically
arguments: shortest side of flight area, maximum vertical length of image, vertical overlap
return: number of necessary vertical pictures
*/
function calcNumberOfVerticalImages(ShortDistanceAOI, maxHeightOfImage, v_Overlap) {
	checkValVertical = ShortDistanceAOI - maxHeightOfImage*0.5
	counterVertical = 1
		while (checkValVertical >= (maxHeightOfImage/2)) {
			checkValVertical -= maxHeightOfImage*(1-v_Overlap)
			counterVertical += 1
		}
	return counterVertical
}

/*
Berechnung der Geschwindigkeit in m/s bei vorgegebener Aufnahmerate (Recording rate)
Calculation of drone velocity in m/s with a certain recording rate
arguments: recording rate, overlap horizontal, overlap vertical, vertical length of picture, horizontal length of picture
return: vertical speed, horizontal speed
*/
function calcVelocity(recRate,overlap_h,overlap_v,maxHeightOfImage, maxLengthOfImage) {
	console.log("MaxHeight: "+maxHeightOfImage);
	console.log("MaxLength: "+maxLengthOfImage);
	var vertical = (maxHeightOfImage*(1-overlap_v))/2;
	var horizontal = (maxLengthOfImage*(1-overlap_h))/2;
	document.getElementById("velo_h").value = "Horizontal speed: " + Math.round((horizontal/recRate)*10)/10;
	document.getElementById("velo_v").value = "Vertical speed: " + Math.round((vertical/recRate)*10)/10;
	return [vertical, horizontal]
}

function calcGSDFromHeight(camera,height) {
	var disX = (camera.sensorX*height)/camera.focal;
	var disY = (disX*camera.pNumberY)/camera.pNumberX;
	var gsdY = (height*camera.sensorY)/(camera.focal*disY);
	var gsdX = (height*camera.sensorX)/(camera.focal*disX);
	console.log(gsdY+" cm "+gsdX+" cm");
	return Math.max(gsdY,gsdX).toFixed(2);
}

function calcHeightFromGSD(camera,gsd) {
	var height = (gsd*camera.focal*pNumberX)/camera.sensorX;
	return height
}