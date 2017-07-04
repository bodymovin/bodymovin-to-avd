function cloneArray(original) {
	var clone = Array.apply(null, {length:original.length});
	var i, len = original.length;
	for(i = 0; i < len; i += 1) {
		clone[i] = original[i];
	}
	return clone;
}

module.exports = {
	cloneArray: cloneArray
}