var node = require('./node');
var createPathData = require('./pathData');

function createAnimatedProperty(targetName, propertyType, keyframes) {
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
	var objectAnimator;
	for( i = 1; i < len; i += 1) {
		if(propertyType === 'position') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional'});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional'});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'anchor') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', multiplier:-1});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', multiplier:-1});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'scale') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleX', {type:'multidimensional', index:0, interpolationType:'multidimensional', multiplier:0.01});
			node.nestChild(set, objectAnimator);
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'scaleY', {type:'multidimensional', index:1, interpolationType:'multidimensional', multiplier:0.01});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'rotation') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'rotation', {type:'unidimensional', index:1, interpolationType:'unidimensional'});
			node.nestChild(set, objectAnimator);
		} else if(propertyType === 'pathData') {
			objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional'});
			node.nestChild(set, objectAnimator);
		}
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
 	var attributes = [{
 		key: 'android:propertyName',
 		value: propertyName
 	},
 	{
 		key: 'android:duration',
 		value: finalValue.t - initialValue.t
 	},
 	{
 		key: 'android:startOffset',
 		value: initialValue.t
 	}];
 	if (options.type === 'multidimensional') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: initialValue.s[options.index] * options.multiplier
 		})
 		attributes.push({
 			key: 'android:valueTo',
 			value: initialValue.e[options.index] * options.multiplier
 		})
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
 		attributes.push({
 			key: 'android:valueTo',
 			value: initialValue.e * options.multiplier
 		})
 		attributes.push({
 			key: 'android:valueType',
 			value: 'floatType'
 		})
 	} else if (options.type === 'path') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: createPathData(initialValue.s[0])
 		})
 		attributes.push({
 			key: 'android:valueTo',
 			value: createPathData(initialValue.e[0])
 		})
 		attributes.push({
 			key: 'android:valueType',
 			value: 'pathType'
 		})
 	}
 	var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
 	var interpolator = buildInterpolator(initialValue, finalValue, options);
 	node.nestChild(objectAnimator, interpolator);
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
		oy = initialValue.i.y;
	} else if(options.interpolationType === 'multidimensional') {
		ox = initialValue.o.x[options.index];
		oy = initialValue.o.y[options.index];
		ix = initialValue.i.x[options.index];
		oy = initialValue.i.y[options.index];

	}
	interpolationValue += ' c' + ox + ',' + oy;
	interpolationValue += ' ' + ix + ',' + oy;
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
 	createAnimatedProperty: createAnimatedProperty
 }