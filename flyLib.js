"use strict";

function FlightArea(xValues,yValues) {
		this.xValues = xValues;
		this.yValues = yValues;
		this.maxLength = function () {
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
										xValues = this.xValues;
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
		this.minLength = function () {
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
									return Math.min(...storage);
								};
	this.LowerLeft = function () {		
						var lowerLeft = [Math.min(...this.xValues),Math.min(...this.yValues)];
						return lowerLeft;
	};
	this.UpperRight = function ()	{
						var upperRight = [Math.max(...this.xValues),Math.max(...this.yValues)];
						return upperRight;
					};
	this.SmallestSide = function () {
		return this.minLength();
	}
	this.LongestSide = function () {
		return this.maxLenght();
					};
};	

function Camera(focal, pNumberX, pNumberY, sensorX, sensorY, recRate) {
		this.focal = focal;
		this.pNumberX = pNumberX;
		this.pNumberY = pNumberY;
		this.sensorX = sensorX;
		this.sensorY = sensorY;
		this.recordingRate = recRate;
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
function calcSmallerSide(longestSideOfImage, pixelnumber_x, pixelnumber_y) {
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
	var checkValVertical = ShortDistanceAOI - maxHeightOfImage*0.5
	var counterVertical = 1
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
function calcVelocity(recRate,overlap,side) {
	var length = (side*(1-overlap))/2;
	var speed = Math.round((length/recRate)*10)/10;
	return speed;
}

function calcGSDFromHeight(camera,height) {
	console.log("Height: "+height);
	console.log("Focal: "+camera.focal);
	console.log("SensorX	: "+camera.sensorX);
	var gsdY = (height*camera.sensorY)/(camera.focal*camera.pNumberY);
	var gsdX = (height*camera.sensorX)/(camera.focal*camera.pNumberX);
	console.log(gsdY+" cm "+gsdX+" cm");
	var maxVal = Math.max(gsdY,gsdX);
	return maxVal;
}

function calcHeightFromGSD(camera,gsd) {
	var heightFromX = (gsd*camera.focal*camera.pNumberX)/camera.sensorX;
	var heightFromY = (gsd*camera.focal*camera.pNumberY)/camera.sensorY;
	return Math.min(heightFromX,heightFromY);
}

//some drones
var TrimbleUX5 = {
		"focalMax" : 55,
		"focalMin" : 18, //if min & max take min?max?avg?users choice?
		"pNumberX" : 4912,
		"pNumberY" : 3264,
		"sensorX" : 23.5,
		"sensorY" : 15.6
}