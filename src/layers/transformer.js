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

	return {
		transform: transform
	}
}

module.exports = transformer;