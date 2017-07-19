var node = require ('../../node');
var property = require ('../../property');
var targets = require ('../../targets/targets');
var createTransformGroup = require ('../../helpers/transform/createTransformGroup');
var rgbHex = require('rgb-hex');
var Matrix = require('transformatrix');
var createPathData = require('../../pathData');
var naming = require('../../naming');

var matrix = new Matrix();
var degToRads = Math.PI/180;

function drawable(_drawableData, _level, _timeOffset, _frameRate) {
	var paths = [];
	var level = _level;
	var drawableData = _drawableData;
	var closed = false;
	var timeOffset = _timeOffset;
	var frameRate = _frameRate;

	function getDrawingAttributes() {
		var attributes = [];
		var hexColor;
		var color = drawableData.c;
		var animatedProp;
		if(drawableData.ty === 'st') {
			if (color.a === 0) {
				hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255);
				attributes.push({
					key: 'android:strokeColor',
					value: '#' + hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'android:strokeColor',
					value: '#' + hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeColor', color.k, timeOffset, frameRate);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'android:strokeLineCap',
				value: 'round'
			})
			attributes.push({
				key: 'android:strokeLineJoin',
				value: 'round'
			})
			
			if(drawableData.w.a === 0) {
				attributes.push({
					key: 'android:strokeWidth',
					value: drawableData.w.k
				})
			} else {
				attributes.push({
					key: 'android:strokeWidth',
					value: drawableData.w.k[0].s
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeWidth', drawableData.w.k, timeOffset, frameRate);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeAlpha', drawableData.o.k, timeOffset, frameRate);
				targets.addTarget(animatedProp);
			}
			
		} else if(drawableData.ty === 'fl') {
			if (color.a === 0) {
				hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255)
				attributes.push({
					key: 'android:fillColor',
					value: '#' + hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'android:fillColor',
					value: '#' + hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillColor', color.k, timeOffset, frameRate);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillAlpha', drawableData.o.k, timeOffset, frameRate);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'android:fillType',
				value: drawableData.r === 1 ? 'nonZero' : 'evenOdd'
			})
		}
		return attributes;
	}

	function isTransformAnimated(transform) {
		if(transform.p && transform.p.a === 1) {
			return true;
		}
		if(transform.a && transform.a.a === 1) {
			return true;
		}
		if(transform.s && transform.s.a === 1) {
			return true;
		}
		if(transform.r && transform.r.a === 1) {
			return true;
		}
		return false;
	}
	
	function addPath(path, transforms, level) {
		if (closed) {
			return;
		}
		paths.push({path: path, transforms: transforms, level: level});
	}

	function canFlattenPath(transforms, level) {
		var i = 0;
		while (i < level) {
			if(isTransformAnimated(transforms[i])){
				return false;
			}
			i += 1;
		}
		return true;
	}

	function buildNewPath(pathList, pathName) {
		var pathAttributes = [].concat(getDrawingAttributes());
		var pathNode = node.createNodeWithAttributes('path', pathAttributes, pathName);
		var finalNode = pathNode;
		var groupNode, nestedGroupNode, nestedArray;
		var i, len = pathList.length;
		var j, jLen;
		matrix.reset();
		var transforms;
		var finalPathData = '';
		var animatedProp;
		var currentPath;
		for(i = 0; i < len; i += 1){
			transforms = pathList[i].transforms;
			jLen = pathList[i].level;
			matrix.reset();

			if(!canFlattenPath(transforms, jLen)){
				for(j = jLen - 1; j >= 0; j -= 1) {
					nestedArray = [finalNode].concat(createTransformGroup(pathName + naming.GROUP_NAME +'_' + j, transforms[j], timeOffset, frameRate));
					finalNode = node.nestArray(nestedArray);
					var name = node.getAttribute(finalNode, 'android:name');

					//parentGroupNode = node.createNode('group', pathName + '_gr_' + j);
					//groupNode = createTransformGroup(parentGroupNode, transforms[j], timeOffset, frameRate);
					//node.nestChild(parentGroupNode, finalNode);
					//finalNode = groupNode;
				}
			} else {
				for(j = 0; j < jLen; j += 1) {
					matrix.translate(transforms[j].p.k[0], transforms[j].p.k[1]);
					matrix.scale(transforms[j].s.k[0]/100, transforms[j].s.k[1]/100);
					matrix.rotate(transforms[j].r.k*degToRads);
					matrix.translate(-transforms[j].a.k[0], -transforms[j].a.k[1]);
				}
			}

			if(pathList[i].path.ks.a === 0) {
				currentPath = ' ' + createPathData(pathList[i].path.ks.k, matrix);
				finalPathData += currentPath;
				if(animatedProp) {
					var aaptAttr = node.getChild(animatedProp,'aapt:attr');
					var setProp = node.getChild(aaptAttr,'set');
					var setChildren = node.getChildren(setProp);
					jLen = setChildren.length;
					var objectAnimator, value;
					for(j = 0; j < jLen; j += 1) {
						value = node.getAttribute(setChildren[j],'android:valueFrom');
						if(value) { 
							node.addAttribute(setChildren[j],'android:valueFrom', value + currentPath);
							value = node.getAttribute(setChildren[j],'android:valueTo');
							node.addAttribute(setChildren[j],'android:valueTo', value + currentPath);
						}
					}
				}
			} else {
				animatedProp = property.createAnimatedPathData(pathName, pathList[i].path.ks.k, matrix, finalPathData, timeOffset, frameRate);
				currentPath = ' ' + createPathData(pathList[i].path.ks.k[0].s[0], matrix);
				finalPathData += currentPath;
				targets.addTarget(animatedProp);
			}
		}
		node.addAttribute(pathNode,'android:pathData', finalPathData);
		return finalNode;
	}

	function exportDrawables(name, _timeOffset) {
		timeOffset = _timeOffset;
		var drawableNodes = [];
		var i, len = paths.length, nodeElem;
		var pathName, pathOpen = false, pathCount = 0, pathAttributes;
		var currentPathList = [];
		var pathData, hasAnimatedPath = false;
		for(i = 0; i < len; i += 1) {
			pathData = paths[i];
			if(!currentPathList.length 
				|| (((!hasAnimatedPath && pathData.path.ks.a === 1) || pathData.path.ks.a === 0) && canFlattenPath(pathData.transforms, pathData.level))) {
				if(pathData.path.ks.a === 1) {
					hasAnimatedPath = true;
				}
			} else {
				pathName = name + naming.PATH_NAME + '_' + pathCount;
				nodeElem = buildNewPath(currentPathList, pathName);
				drawableNodes.push(nodeElem);
				currentPathList.length = 0;
				hasAnimatedPath = false;
				pathCount += 1;
			}
			currentPathList.push(pathData);
		}
		if (currentPathList.length) {
			pathName = name + naming.PATH_NAME + '_' + pathCount;
			nodeElem = buildNewPath(currentPathList, pathName);
			drawableNodes.push(nodeElem);
		}
		return drawableNodes;
	}

	function close() {
		closed = true;
	}

	var factoryInstance = {
		addPath: addPath,
		exportDrawables: exportDrawables,
		close: close
	}

	return factoryInstance;
}

module.exports = drawable;