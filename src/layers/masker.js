function masker(state) {
	var masks = [];
	function mask(maskData) {
		transforms.push(maskData);
	}

	return {
		mask: mask
	}
}

module.exports = masker;