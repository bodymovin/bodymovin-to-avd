function createPathData(data) {
	var i, len = data.v.length;
	var pathValue = '';
	for( i = 0; i < len - 1; i += 1) {
		if(i === 0) {
			pathValue += 'M' + data.v[0][0] + ' ' + data.v[0][1];
		}
		pathValue += ' C' + (data.o[i][0] + data.v[i][0]) + ',' + (data.o[i][1] + data.v[i][1]);
		pathValue += ' ' + (data.i[i + 1][0] + data.v[i + 1][0]) + ',' + (data.i[i + 1][1] + data.v[i + 1][1]);
		pathValue += ' ' + data.v[i + 1][0] + ',' + data.v[i + 1][1];
	}
	if(data.c) {
		pathValue += ' C' + (data.o[i][0] + data.v[i][0]) + ',' + (data.o[i][1] + data.v[i][1]);
		pathValue += ' ' + (data.i[0][0] + data.v[0][0]) + ',' + (data.i[0][1] + data.v[0][1]);
		pathValue += ' ' + data.v[0][0] + ',' + data.v[0][1];
	}
	return pathValue;
}

module.exports = createPathData;