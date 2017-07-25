var fs = require("fs");
var browserify = require("browserify");
browserify("./src/index.js")
  .transform("babelify", {presets: ["es2015"], global: true})
  .bundle()
  .pipe(fs.createWriteStream("lib/build.js"));