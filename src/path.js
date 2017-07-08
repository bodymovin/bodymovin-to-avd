var rgbHex = require('rgb-hex');
var node = require('./node');
var array = require('./array');
var property = require('./property');
var createPathData = require('./pathData');
var applyTransformToContainer = require('./transform');

function addPathToDrawables(shape, shapeName, level, drawables, transforms, targets, timeOffset, trimPathData) {
	var i, len = drawables.length;
	var color, hexColor, animatedProp;
	for(i = 0; i < len; i += 1) {
		color = drawables[i].drawable.c;
		var attributes = [];
		var keyName = '';
		var pathName = drawables[i].name + shapeName;
		if(drawables[i].drawable.ty === 'st') {
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
				animatedProp = property.createAnimatedProperty(pathName, 'strokeColor', color.k, timeOffset);
				targets.push(animatedProp);
			}
			attributes.push({
				key: 'android:strokeLineCap',
				value: 'round'
			})
			attributes.push({
				key: 'android:strokeLineJoin',
				value: 'round'
			})
			
			if(drawables[i].drawable.w.a === 0) {
				attributes.push({
				key: 'android:strokeWidth',
				value: drawables[i].drawable.w.k
			})
			} else {
				attributes.push({
					key: 'android:strokeWidth',
					value: drawables[i].drawable.w.k[0].s
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeWidth', drawables[i].drawable.w.k, timeOffset);
				targets.push(animatedProp);
			}
			if(drawables[i].drawable.o.a === 0) {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawables[i].drawable.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawables[i].drawable.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeAlpha', drawables[i].drawable.o.k, timeOffset);
				targets.push(animatedProp);
			}
			
		} else if(drawables[i].drawable.ty === 'fl') {
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
				animatedProp = property.createAnimatedProperty(pathName, 'fillColor', color.k, timeOffset);
				targets.push(animatedProp);
			}
			if(drawables[i].drawable.o.a === 0) {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawables[i].drawable.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawables[i].drawable.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillAlpha', drawables[i].drawable.o.k, timeOffset);
				targets.push(animatedProp);
			}
		}
		if(trimPathData) {
			var startValue, endValue, offsetValue;
			if (trimPathData.s.a === 0) {
				startValue = trimPathData.s.k * 0.01;
			} else {
				startValue = trimPathData.s.k[0].s * 0.01;
				animatedProp = property.createAnimatedProperty(pathName, 'trimPathStart', trimPathData.s.k, timeOffset);
				targets.push(animatedProp);
			}
			if (trimPathData.e.a === 0) {
				endValue = trimPathData.e.k * 0.01;
			} else {
				endValue = trimPathData.e.k[0].s * 0.01;
				animatedProp = property.createAnimatedProperty(pathName, 'trimPathEnd', trimPathData.e.k, timeOffset);
				targets.push(animatedProp);
			}
			if (trimPathData.o.a === 0) {
				offsetValue = trimPathData.o.k * 1/360;
			} else {
				offsetValue = trimPathData.o.k[0].s * 1/360;
				animatedProp = property.createAnimatedProperty(pathName, 'trimPathOffset', trimPathData.o.k, timeOffset);
				targets.push(animatedProp);
			}
			attributes.push({
				key: 'android:trimPathStart',
				value: startValue
			})
			attributes.push({
				key: 'android:trimPathEnd',
				value: endValue
			})
			attributes.push({
				key: 'android:trimPathOffset',
				value: offsetValue
			})
		}
		var path = node.createNodeWithAttributes('path', attributes, pathName);
		if (shape.ks.a === 0) {
			node.addAttribute(path,'android:pathData', createPathData(shape.ks.k));
		} else {
			node.addAttribute(path,'android:pathData', createPathData(shape.ks.k[0].s[0]));
			var animatedPath = property.createAnimatedProperty(pathName, 'pathData', shape.ks.k, timeOffset);
			targets.push(animatedPath);
		}
		var drawableLevel = level;
		var groupName = pathName;
		var previousGroup = path;
		while(drawableLevel > drawables[i].level) {
			groupName += 'group_' + drawableLevel + '_';
			var group = node.createNode('group', groupName);
			var containerGroup = applyTransformToContainer(group, transforms[drawableLevel - 1].transform, targets, timeOffset);
			node.nestChild(group, previousGroup);
			previousGroup = containerGroup;
			drawableLevel -= 1;
		}
		node.nestChild(drawables[i].group, previousGroup);
	}
}

function createShapeLayer(layerData, layers, targets, name, timeOffset) {
	var group = node.createNode('group', name);
	group = addShapesToGroup(group, layerData.shapes, [], [], 0, targets, name, timeOffset, null);
	return group;
}

function createSolidLayer(layerData, name) {
	var group = node.createNode('group', name);
	var attributes = [];
	var hexColor = rgbHex(1*255,0*255,0*255);
	attributes.push({
		key: 'android:fillColor',
		value: layerData.sc
	})
	attributes.push({
		key: 'android:pathData',
		value: 'M0,0 C0,0 ' + layerData.sw + ',0  ' + layerData.sw + ',0 C ' + layerData.sw + ',0 C ' + layerData.sw + ', ' + layerData.sh + '  ' + layerData.sw + ', ' + layerData.sh + ' C ' + layerData.sw + ', ' + layerData.sh + ' 0, ' + layerData.sh + ' 0, ' + layerData.sh + 'z'
	})
	var path = node.createNodeWithAttributes('path', attributes, name);
	node.nestChild(group, path);
	return group;
}

function addShapesToGroup(parent, shapes, drawables, transforms, level, targets, name, timeOffset, trimPathData) {
	var i, len = shapes.length, parentContainer = parent;
	for (i = len - 1; i >= 0; i -= 1) {
		if(shapes[i].ty === 'gr') {
			var groupName = name + 'group_' + i + '_';
			var group = node.createNode('group', groupName);
			group = addShapesToGroup(group, shapes[i].it, array.cloneArray(drawables), array.cloneArray(transforms), level + 1, targets, groupName, timeOffset, trimPathData);
			node.nestChild(parent, group);
		} else if(shapes[i].ty === 'tr') {
			parentContainer = applyTransformToContainer(parent, shapes[i], targets, timeOffset);
			transforms.push({transform:shapes[i], level: level});
		} else if(shapes[i].ty === 'fl' || shapes[i].ty === 'st') {
			var drawableName = name + 'drawable_' + i + '_';
			var group = node.createNode('group', drawableName);
			node.nestChild(parent, group);
			drawables.push({drawable:shapes[i], level: level, group: group, name: drawableName});
		} else if(shapes[i].ty === 'sh') {
			var shapeName = 'shape_' + i + '_';
			addPathToDrawables(shapes[i], shapeName, level, drawables, transforms, targets, timeOffset, trimPathData);
		} else if(shapes[i].ty === 'tm') {
			trimPathData = shapes[i];
		}
	}
	return parentContainer;
}

module.exports = {
	createShapeLayer: createShapeLayer,
	createSolidLayer: createSolidLayer
}