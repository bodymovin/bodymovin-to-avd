var masker = require ('../masker');
var transformer = require ('../transformer');
var layer = require ('../layer');
var drawableFactory = require ('./drawable');
var node = require ('../../node');
var naming = require('../../naming');

function shape(layerData, _level) {

	var drawables = [];
	var transforms = [];
	var level = _level || 0;
	var trimPath;

	var state = {
		shapes: layerData.shapes || layerData.it,
		layerData: layerData
	}

	function createNodeInstance(grouper, groupName){
		var drawableNodes;
		var i, len = drawables.length;
		var j, jLen;
		for(i = 0; i < len; i += 1) {
			drawableNodes = drawables[i].exportDrawables(groupName, state.timeOffset);
			jLen = drawableNodes.length;
			for(j = 0; j < jLen; j += 1) {
				node.nestChild(grouper, drawableNodes[j]);
			}
		}
	}

	function exportNode(name) {
		var groupName = name + naming.DRAWABLE_NAME;
		var masksGroup = factoryInstance.getMasks(groupName);
		var gr;
		if(masksGroup) {
			gr = masksGroup;
			var leaves = node.getLastLeaves(masksGroup);
			var i, len = leaves.length;
			for(i = 0; i < len; i += 1) {
				createNodeInstance(leaves[i], groupName + naming.GROUP_NAME + '_' + i);
			}
		} else {
			gr = node.createNode('group', groupName);
			createNodeInstance(gr, groupName);
		}
		var parentNode = factoryInstance.buildParenting(state.layerData.parent, gr, groupName, true);
		return parentNode;
	}

	function addPathToDrawables(path) {
		var i, len = drawables.length;
		for(i = 0; i < len; i += 1) {
			drawables[i].addPath(path, transforms, level);
		}
	}

	function processData() {
		var i,  len = state.shapes.length;
		var shapeGroup, drawable;
		var localDrawables = [];
		for (i = len - 1; i >= 0; i -= 1) {
			if(state.shapes[i].ty === 'gr') {
				shapeGroup = shape(state.shapes[i], level + 1);
				shapeGroup.setTimeOffset(state.timeOffset);
				shapeGroup.setFrameRate(state.frameRate);
				shapeGroup.setDrawables(drawables)
				.setTransforms(transforms)
				.setTrimPath(trimPath)
				.processData();
			} else if(state.shapes[i].ty === 'fl' || state.shapes[i].ty === 'st') {
				drawable = drawableFactory(state.shapes[i], level, state.timeOffset, state.frameRate);
				drawables.push(drawable);
				localDrawables.push(drawable);
			} else if(state.shapes[i].ty === 'tr') {
				transforms.push(state.shapes[i]);
			} else if(state.shapes[i].ty === 'sh') {
				addPathToDrawables(state.shapes[i]);
			} else if(state.shapes[i].ty === 'tm') {
				trimPath = state.shapes[i];
			} else {
				console.log(state.shapes[i].ty)
			}
		}

		len = localDrawables.length;
		for(i = 0; i < len; i += 1) {
			drawable = localDrawables[i];
			drawable.close();
		}
		return factoryInstance;
	}

	function setTrimPath(_trimPath) {
		trimPath = _trimPath;
		return factoryInstance;
	}

	function setDrawables(_drawables) {
		drawables = _drawables;
		return factoryInstance;
	}

	function setTransforms(_transforms) {
		var i, len = _transforms.length;
		for(i = 0; i < len; i += 1) {
			transforms.push(_transforms[i]);
		}
		return factoryInstance;
	}

	var factoryInstance = {
		setDrawables: setDrawables,
		setTransforms: setTransforms,
		setTrimPath: setTrimPath,
		processData: processData,
		exportNode: exportNode
	};
	Object.assign(factoryInstance, layer(state), masker(state), transformer(state)); 
	
	return factoryInstance;
}

module.exports = shape;