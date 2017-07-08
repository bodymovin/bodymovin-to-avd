'use strict';

var xml = require('xml');
var fs = require('fs');
var node = require('./node');
var layer = require('./layer');

function addTargetsToAVD(targets, avd) {
	var target;
	var i, len = targets.length;
	for(i = 0; i < len; i += 1) {
		target = targets[i];
		node.nestChild(avd, target);
	} 
}

function createAnimatedVectorObject() {
	var attributes = [{
		key: 'xmlns:android',
		value: 'http://schemas.android.com/apk/res/android'
	},{
		key: 'xmlns:aapt',
		value: 'http://schemas.android.com/aapt'
	}]
	var nodeElem = node.createNodeWithAttributes('animated-vector', attributes);
	return nodeElem;
}

function createAAPTVectorDrawable(animation, targets) {
	var aapt = node.createNodeWithAttributes('aapt:attr',[{key:'name', value:'android:drawable'}]);
	var vectorDrawable = createVectorDrawable(animation.w, animation.h);
	layer.addLayers(vectorDrawable, animation.layers, animation, targets, 'root_', 0);
	node.nestChild(aapt, vectorDrawable);
	return aapt;
}

function correctTargetsTimes(targets, framerate) {
	var i, len = targets.length;
	var j, jLen;
	var target, set, animator;
	for(i = 0; i < len; i += 1) {
		target = targets[i];
		set = target.target[1]["aapt:attr"][1]["set"];
		jLen = set.length;
		for(j = 1; j < jLen; j += 1) {
			animator = set[j]['objectAnimator'];
			if(animator[0]._attr['android:duration']) {
				animator[0]._attr['android:duration'] = Math.round(animator[0]._attr['android:duration']/framerate*1000);
			}
			if(animator[0]._attr['android:startOffset']) {
				animator[0]._attr['android:startOffset'] = Math.round(animator[0]._attr['android:startOffset']/framerate*1000);
			}
		}
	} 
}

function createVectorDrawable(width, height) {
	var attributes = [{
		key: 'android:height',
		value: '240dp'
	},{
		key: 'android:width',
		value: '240dp'
	},{
		key: 'android:viewportHeight',
		value: height
	},{
		key: 'android:viewportWidth',
		value: width
	}];
	var nodeElement = node.createNodeWithAttributes('vector', attributes, '');
	return nodeElement;
}

/**
 * Adds commas to a number
 * @param {object} animation
 * @return {string}
 */
 module.exports = function(animation) {
 	var targets = [];
 	var avd = createAnimatedVectorObject();
 	var vectorDrawable = createAAPTVectorDrawable(animation, targets);
 	node.nestChild(avd, vectorDrawable);
 	correctTargetsTimes(targets, animation.fr);
 	addTargetsToAVD(targets, avd);
 	var xmlString = xml(avd);
 	return xmlString;
 };