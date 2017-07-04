var node = require('./node');
var path = require('./path');
var applyTransformToContainer = require('./transform');

function addLayers(container, layers, assets, targets, name) {
	var i, len = layers.length, layer, containerGroup, layerName;
	for(i = len - 1; i >= 0; i -= 1) {
		if(layers[i].ty === 4) {
			layerName = name + 'layer_' + i + '_';
			layer = path.createShapeLayer(layers[i], layers, targets, layerName);
			containerGroup = addGroupToParent(layer, layers[i].parent, layers, targets, layerName);
			node.nestChild(container, containerGroup);
		}
	}
}

function getLayerDataByIndex(index, layers) {
	var i = 0, len = layers.length;
	while( i < len) {
		if(layers[i].ind === index) {
			return layers[i];
		}
		i += 1;
	}
}

function addGroupToParent(group, parent, layers, targets, name) {
	if(parent !== undefined) {
		name = name + 'parent_' + parent + '_';
		var parentGroup = node.createNode('group', name);
		var parentData = getLayerDataByIndex(parent, layers);
		var containerParentGroup = applyTransformToContainer(parentGroup, parentData.ks, targets, name);
		node.nestChild(parentGroup, group);
		containerParentGroup = addGroupToParent(containerParentGroup, parentData.parent, layers, targets, name);
		return containerParentGroup;
	}
	return group;
}

module.exports = {
	addLayers: addLayers
}