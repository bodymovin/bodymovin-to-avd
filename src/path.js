var rgbHex = require('rgb-hex');
var node = require('./node');
var array = require('./array');
var property = require('./property');
var createPathData = require('./pathData');
var applyTransformToContainer = require('./transform');

function addPathToDrawables(shape, drawables, transforms, targets) {
	var i, len = drawables.length;
	var color, hexColor;
	for(i = 0; i < len; i += 1) {
		color = drawables[i].drawable.c;
		hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255);
		var attributes = [];
		var keyName = '';
		if(drawables[i].drawable.ty === 'st') {
			attributes.push({
				key: 'android:strokeColor',
				value: '#' + hexColor
			})
			attributes.push({
				key: 'android:strokeWidth',
				value: drawables[i].drawable.w.k
			})
		} else if(drawables[i].drawable.ty === 'fl') {
			attributes.push({
				key: 'android:fillColor',
				value: '#' + hexColor
			})
		}
		var pathName = drawables[i].name + 'path_';
		var path = node.createNodeWithAttributes('path', attributes, pathName);
		if (shape.ks.a === 0) {
			node.addAttribute(path,'android:pathData', createPathData(shape.ks.k));
		} else {
			node.addAttribute(path,'android:pathData', createPathData(shape.ks.k[0].s[0]));
			var animatedPath = property.createAnimatedProperty(pathName, 'pathData', shape.ks.k);
			targets.push(animatedPath);
		}
		node.nestChild(drawables[i].group, path);
	}
}

function createShapeLayer(layerData, layers, targets, name) {
	var group = node.createNode('group', name);
	var containerGroup = applyTransformToContainer(group, layerData.ks, targets, name);
	addShapesToGroup(group, layerData.shapes, [], [], 0, targets, name);
	return containerGroup;
}

function addShapesToGroup(container, shapes, drawables, transforms, level, targets, name) {
	var i, len = shapes.length;
	for (i = len - 1; i >= 0; i -= 1) {
		if(shapes[i].ty === 'gr') {
			var groupName = name + 'group_' + i + '_';
			var group = node.createNode('group', groupName);
			group = addShapesToGroup(group, shapes[i].it, array.cloneArray(drawables), array.cloneArray(transforms), level + 1, targets, groupName);
			node.nestChild(container, group);
		} else if(shapes[i].ty === 'tr') {
			container = applyTransformToContainer(container, shapes[i], targets, name);
			transforms.push({transform:shapes[i], level: level});
		} else if(shapes[i].ty === 'fl' || shapes[i].ty === 'st') {
			var drawableName = name + 'drawable_' + i + '_';
			var group = node.createNode('group', drawableName);
			node.nestChild(container, group);
			drawables.push({drawable:shapes[i], level: level, group: group, name: drawableName});
		} else if(shapes[i].ty === 'sh') {
			addPathToDrawables(shapes[i], drawables, transforms, targets);
		}
	}
	return container;
}

module.exports = {
	addPathToDrawables: addPathToDrawables,
	createShapeLayer: createShapeLayer
}