function drawable() {
	var paths = [];

	function addPath(path) {
		paths.push(path);
	}

	return {
		addPath: addPath
	}
}

module.exports = drawable;