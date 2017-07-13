function createPathData(data) {
	var i, len = data.v.length;
	var pathValue = '';
	for( i = 0; i < len - 1; i += 1) {
		if(i === 0) {
			pathValue += 'M' + roundValue(data.v[0][0]) + ' ' + roundValue(data.v[0][1]);
		}
		pathValue += ' C' + roundValue(data.o[i][0] + data.v[i][0]) + ',' + roundValue(data.o[i][1] + data.v[i][1]);
		pathValue += ' ' + roundValue(data.i[i + 1][0] + data.v[i + 1][0]) + ',' + roundValue(data.i[i + 1][1] + data.v[i + 1][1]);
		pathValue += ' ' + roundValue(data.v[i + 1][0]) + ',' + roundValue(data.v[i + 1][1]);
	}
	if(data.c) {
		pathValue += ' C' + roundValue(data.o[i][0] + data.v[i][0]) + ',' + roundValue(data.o[i][1] + data.v[i][1]);
		pathValue += ' ' + roundValue(data.i[0][0] + data.v[0][0]) + ',' + roundValue(data.i[0][1] + data.v[0][1]);
		pathValue += ' ' + roundValue(data.v[0][0]) + ',' + roundValue(data.v[0][1]);
	}
	return pathValue;
}

function roundValue(val) {
	return Math.round(val*100)/100;
}

module.exports = createPathData;