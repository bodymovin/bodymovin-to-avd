
function transformer(state) {
	var transforms = [];

	function transform(transformData) {
		transforms.push(transformData);
	}

	function transformNode(node) {
		var i, len = transforms.length;
		for(i = 0; i < len; i += 1) {
			
		}
	}

	function setSiblings(_siblings) {
		state.siblings = _siblings;
	}

	function getLayerDataByIndex() {
		var siblings = state.siblings;
		var i = 0, len = siblings.length;
		while( i < len) {
			if(siblings[i].ind === index) {
				return siblings[i];
			}
			i += 1;
		}
	}

	function buildParenting(group, parent, layers) {
		var name = node.getAttribute(group, 'android:name');
		if(parent !== undefined) {
			name = name + 'parent_' + parent + '_';
			var parentGroup = node.createNode('group', name);
			var parentData = getLayerDataByIndex(parent, layers);
			var containerParentGroup = applyTransformToContainer(parentGroup, parentData.ks, targets, state.timeOffset);
			node.nestChild(parentGroup, group);
			containerParentGroup = buildParenting(containerParentGroup, parentData.parent, layers, targets, state.timeOffset);
			return containerParentGroup;
		}
		return group;
	}

	return {
		transform: transform,
		buildParenting: buildParenting,
		setSiblings: setSiblings
	}
}

module.exports = transformer;