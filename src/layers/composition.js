var grouper = require ('./grouper')
var masker = require ('./masker')
var transformer = require ('./transformer')
var layer = require ('./layer')
var node = require ('../node')
var shapeFactory = require ('../layers/shape/shape')

function composition(compositionData, assets) {

	var state = {
		inPoint: compositionData.ip || 0,
		outPoint: compositionData.op || 0,
		startPoint: compositionData.st || 0,
		layersData: compositionData.layers ||  getCompositionLayers(compositionData.refId, assets),
		layers: []
	}

	function getCompositionLayers(compId, assets) {
		var i = 0, len = assets.length;
		while (i < len) {
			if(assets[i].id === compId) {
				return assets[i].layers;
			}
			i += 1;
		}
		return [];
	}

	function exportNode(name) {
		var gr = node.createNode('group', name);
		var layers = state.layers;
		var len = layers.length;
		for (i = 0; i < len; i += 1) {
			node.nestChild(gr, layers[i].exportNode(name + '_layer_' + i));
		}
		return gr;
	}

	function traverseLayers() {
		var i, len = state.layersData.length;
		var layer;
		for(i = 0; i < len; i += 1) {
			if(state.layersData[i].ty === 4) {
				layer = shapeFactory(state.layersData[i]);
				layer.setTimeOffset(state.timeOffset + state.startPoint);
				layer.setFrameRate(state.frameRate);
				layer.traverseShapes();
			} else if(state.layersData[i].ty === 0) {
				layer = composition(state.layersData[i], assets);
				layer.setTimeOffset(state.timeOffset + state.startPoint);
				layer.setFrameRate(state.frameRate);
				layer.traverseLayers();
			}
			state.layers.push(layer);
		}
	}

	var factoryInstance = {
		exportNode: exportNode,
		traverseLayers: traverseLayers
	};
	Object.assign(factoryInstance, layer(state), masker(state), transformer(state)); 

	return factoryInstance;
}

module.exports = composition;