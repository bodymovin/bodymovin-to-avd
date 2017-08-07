var node = require('./node');
var createPathData = require('./pathData');
var rgbHex = require('./helpers/rgbToHex');
var Matrix = require('transformatrix');

var _matrix = new Matrix();
var frameRate = 0;
var timeCap = Number.MAX_SAFE_INTEGER;

function createAnimatedProperty(targetName, propertyType, keyframes, timeOffset) {
	var target = createTargetNode(targetName);
	var aapt = createAAPTAnimation();
	node.nestChild(target, aapt);
	var set = createSetNode();
	node.nestChild(aapt, set);
	if(keyframes[0].t > 0) {
		var extraKeyframe = JSON.parse(JSON.stringify(keyframes[0]));
		extraKeyframe.e = extraKeyframe.s;
		extraKeyframe.t = 0;
		keyframes.splice(0,0,extraKeyframe);
	}
	var i, len = keyframes.length;
	var objectAnimator, multiplier;
	var index;
	for( i = 1; i < len; i += 1) {
		if(propertyType === 'position') {
			if (keyframes[i - 1].to) {
				objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateXY', {type:'combined', interpolationType:'unidimensional', timeOffset: timeOffset});
				node.nestChild(set, objectAnimator);
			} else {
				objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', timeOffset: timeOffset});
				node.nestChild(set, objectAnimator);
				objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset});
				node.nestChild(set, objectAnimator);
			}
			
		} else if(propertyType === 'positionX' || propertyType === 'positionY') {
			var propertyName = propertyType === 'positionX' ? 'translateX' : 'translateY';
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyName, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
			
		} else if(propertyType === 'anchor') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', multiplier:-1, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', multiplier:-1, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'scale') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleX', {type:'multidimensional', index:0, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleY', {type:'multidimensional', index:1, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'scaleX' || propertyType === 'scaleY') {
			index = propertyType === 'scaleX' ? 0 : 1;
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'multidimensional', index:index, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'rotation' || propertyType === 'strokeWidth') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'unidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'pathData') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'fillColor' || propertyType === 'strokeColor') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'color', interpolationType:'unidimensional', timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'strokeAlpha' || propertyType === 'fillAlpha' || propertyType === 'trimPathEnd' || propertyType === 'trimPathStart' || propertyType === 'trimPathOffset') {
			multiplier = propertyType === 'trimPathOffset' ? 1/360 : 0.01;
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'unidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset});
			node.nestChild(set, objectAnimator);
		}
	}
	return target;
}

function createAnimatedPathData(targetName, keyframes, matrix, staticPath, timeOffset) {
	var target = createTargetNode(targetName);
	var aapt = createAAPTAnimation();
	node.nestChild(target, aapt);
	var set = createSetNode();
	node.nestChild(aapt, set);
	if(keyframes[0].t > 0) {
		var extraKeyframe = JSON.parse(JSON.stringify(keyframes[0]));
		extraKeyframe.e = extraKeyframe.s;
		extraKeyframe.t = 0;
		keyframes.splice(0,0,extraKeyframe);
	}
	var i, len = keyframes.length;
	var objectAnimator, multiplier;
	for( i = 1; i < len; i += 1) {
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset, matrix: matrix, staticPath: staticPath});
		node.nestChild(set, objectAnimator);
	}
	return target;
}

function createSetNode() {
	var attributes = [{
		key: 'android:ordering',
		value: 'together'
	}];
	return node.createNodeWithAttributes('set', attributes, '');
}

function createAAPTAnimation() {
	var attributes = [{
		key: 'name',
		value: 'android:animation'
	}];
	return node.createNodeWithAttributes('aapt:attr', attributes, '');
}

function createTargetNode(nodeName) {
 	//android:name="plus_group"
 	var attributes = [{
 		key: 'android:name',
 		value: nodeName
 	}];
 	return node.createNodeWithAttributes('target', attributes, '');
 }

 function createAnimatorObject(initialValue, finalValue, propertyName, options) {
 	options.multiplier = options.multiplier || 1;
 	options.timeOffset = options.timeOffset || 0;
 	options.matrix = options.matrix || _matrix.reset();
 	options.staticPath = options.staticPath || '';
 	var duration = finalValue.t - initialValue.t;
 	var startOffset = initialValue.t + options.timeOffset;
 	if (options.timeOffset + finalValue.t > timeCap || startOffset < 0) {
 		return null;
 	}
 	var attributes = [{
 		key: 'android:propertyName',
 		value: propertyName
 	},
 	{
 		key: 'android:duration',
 		value: Math.round(duration / frameRate * 1000)
 	},
 	{
 		key: 'android:startOffset',
 		value: Math.round(startOffset / frameRate * 1000)
 	}];
 	if (options.type === 'multidimensional') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: initialValue.s[options.index] * options.multiplier
 		})

 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: initialValue.s[options.index] * options.multiplier
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: initialValue.e[options.index] * options.multiplier
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'floatType'
 		})
 	} else if (options.type === 'unidimensional') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: initialValue.s * options.multiplier
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: initialValue.s * options.multiplier
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: initialValue.e * options.multiplier
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'floatType'
 		})
 	} else if (options.type === 'path') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: options.staticPath + createPathData(initialValue.s[0], options.matrix)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: options.staticPath + createPathData(initialValue.s[0], options.matrix)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: options.staticPath + createPathData(initialValue.e[0], options.matrix)
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'pathType'
 		})
 	} else if (options.type === 'color') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: rgbHex(initialValue.e[0]*255, initialValue.e[1]*255, initialValue.e[2]*255)
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'colorType'
 		})
 	} else if (options.type === 'combined') {
 		attributes.push({
 			key: 'android:propertyXName',
 			value: 'translateX'
 		})
 		attributes.push({
 			key: 'android:propertyYName',
 			value: 'translateY'
 		})
 		var pathValue = 'M ' + initialValue.s[0] + ',' + initialValue.s[1];
 		pathValue += 'C ' + (initialValue.s[0] + initialValue.to[0]) + ',' + (initialValue.s[1]  + initialValue.to[1]);
 		pathValue += ' ' + (initialValue.e[0] + initialValue.ti[0]) + ',' + (initialValue.e[1]  + initialValue.ti[1]);
 		pathValue += ' ' + (initialValue.e[0]) + ',' + (initialValue.e[1]);
 		attributes.push({
 			key: 'android:pathData',
 			value: pathValue
 		})
 		//android:pathData="M -8.0,0.0 c 1.33333,0.0 6.66667,0.0 8.0,0.0"
 	}
 	var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
 	if(initialValue.h !== 1) {
	 	var interpolator = buildInterpolator(initialValue, finalValue, options);
	 	node.nestChild(objectAnimator, interpolator);
 	}
 	return objectAnimator;
 }

function buildInterpolator(initialValue, finalValue, options) {
	if(!initialValue.o){
		return null;
	}
	var attributes = [{
		key: 'name',
		value: 'android:interpolator'
	}];
	var aaptInterpolator =  node.createNodeWithAttributes('aapt:attr', attributes, '');
	var interpolationValue = 'M 0.0,0.0';
	var ox,oy,ix,iy;
	if(options.interpolationType === 'unidimensional') {
		ox = initialValue.o.x;
		oy = initialValue.o.y;
		ix = initialValue.i.x;
		iy = initialValue.i.y;
	} else if(options.interpolationType === 'multidimensional') {
		ox = initialValue.o.x[options.index];
		oy = initialValue.o.y[options.index];
		ix = initialValue.i.x[options.index];
		iy = initialValue.i.y[options.index];

	}
	interpolationValue += ' c' + ox + ',' + oy;
	interpolationValue += ' ' + ix + ',' + iy;
	interpolationValue += ' 1.0,1.0';
	var pathAttributes = [{
		key: 'android:pathData',
		value: interpolationValue
	}]
	var pathInterpolator = node.createNodeWithAttributes('pathInterpolator', pathAttributes, '');
	node.nestChild(aaptInterpolator, pathInterpolator);
	return aaptInterpolator;
}

function setFrameRate(_frameRate) {
	frameRate = _frameRate;
}

function setTimeCap(_timeCap) {
	timeCap = _timeCap;
}

function getTimeCap() {
	return timeCap;
}

 module.exports = {
 	createAnimatedProperty: createAnimatedProperty,
 	createAnimatedPathData: createAnimatedPathData,
 	createAnimatorObject: createAnimatorObject,
 	createAAPTAnimation: createAAPTAnimation,
 	createTargetNode: createTargetNode,
 	createSetNode: createSetNode,
 	setFrameRate: setFrameRate,
 	setTimeCap: setTimeCap,
 	getTimeCap: getTimeCap
 }