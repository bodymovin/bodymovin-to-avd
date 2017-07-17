var node = require('./node');
var createPathData = require('./pathData');
var rgbHex = require('rgb-hex');
var Matrix = require('transformatrix');

var _matrix = new Matrix();

function createAnimatedProperty(targetName, propertyType, keyframes, timeOffset, frameRate) {
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
		if(propertyType === 'position') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'anchor') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', multiplier:-1, timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', multiplier:-1, timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'scale') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleX', {type:'multidimensional', index:0, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleY', {type:'multidimensional', index:1, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'rotation' || propertyType === 'strokeWidth') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'unidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'pathData') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'fillColor' || propertyType === 'strokeColor') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'color', interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'strokeAlpha' || propertyType === 'fillAlpha' || propertyType === 'trimPathEnd' || propertyType === 'trimPathStart' || propertyType === 'trimPathOffset') {
			multiplier = propertyType === 'trimPathOffset' ? 1/360 : 0.01;
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'unidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset, frameRate: frameRate});
			node.nestChild(set, objectAnimator);
		}
	}
	return target;
}

function createAnimatedPathData(targetName, keyframes, matrix, staticPath, timeOffset, frameRate) {
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
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset, frameRate: frameRate, matrix: matrix, staticPath: staticPath});
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
 	options.frameRate = options.frameRate || 1;
 	options.matrix = options.matrix || _matrix.reset();
 	options.staticPath = options.staticPath || '';
 	var attributes = [{
 		key: 'android:propertyName',
 		value: propertyName
 	},
 	{
 		key: 'android:duration',
 		value: Math.round((finalValue.t - initialValue.t)/options.frameRate*1000)
 	},
 	{
 		key: 'android:startOffset',
 		value: Math.round((initialValue.t + options.timeOffset)/options.frameRate*1000)
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
 	}
 	if (options.type === 'unidimensional') {
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
 			value: '#' + rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: '#' + rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: '#' + rgbHex(initialValue.e[0]*255, initialValue.e[1]*255, initialValue.e[2]*255)
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'colorType'
 		})
 	}
 	var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
 	if(initialValue.h !== 1) {
	 	var interpolator = buildInterpolator(initialValue, finalValue, options);
	 	node.nestChild(objectAnimator, interpolator);
 	}
 	return objectAnimator;
 }

function buildInterpolator(initialValue, finalValue, options) {
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

 module.exports = {
 	createAnimatedProperty: createAnimatedProperty,
 	createAnimatedPathData: createAnimatedPathData,
 	createAnimatorObject: createAnimatorObject,
 	createAAPTAnimation: createAAPTAnimation,
 	createTargetNode: createTargetNode,
 	createSetNode: createSetNode
 }