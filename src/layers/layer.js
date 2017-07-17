function layer(state) {

	state.timeOffset = 0;
	state.frameRate = 0;

	function setTimeOffset(_timeOffset) {
		state.timeOffset = _timeOffset;
	}

	function setFrameRate(_frameRate) {
		state.frameRate = _frameRate;
	}

	return {
		setTimeOffset: setTimeOffset,
		setFrameRate: setFrameRate
	}
}

module.exports = layer;