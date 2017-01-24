var AudioContext = require('web-audio-api').AudioContext;
var fs = require('fs');
var Canvas = require('canvas')

Array.prototype.max = function () {
  return Math.max.apply(null, this);
};

var defaultSetting = {
  width: 600,
  height: 80,
  barWidth: 3,
  barGap: 0.2,
  waveColor: "blue",
  waveAlpha: 1,
  backgroundColor: '#fff',
  baseline: 60,
}

function bufferMeasure(position, length, data) {
  var sum = 0.0
  for (var i = position; i <= (position + length) - 1; i++) {
    sum += Math.pow(data[i], 2)
  }
  return Math.sqrt(sum / data.length)
}

module.exports = function render(url, options, cb) {
  var audioContext = new AudioContext
  if (typeof options === "function") {
    cb = options
    options = {}
  }

  options = Object.assign({}, defaultSetting, options)
  if (options.baseline < 0 && options.height < 0 && options.width < 0) {
    return cb( new Error('Size must be greater than 0'))
  }

  if (options.baseline > options.height) {
    return cb( new Error('Baseline must be smaller than waveform height'))
  }

  var canvas = new Canvas(options.width, options.height)
  var canvasContext = canvas.getContext('2d')

  fs.readFile("Canon.mp3", function (err, buffer) {

    if (err) {
      return cb(err)
    }

    audioContext.decodeAudioData(buffer, function (result) {
      var data = result.getChannelData(0)
      var step = Math.floor(result.length / options.width)
      var ratio = options.baseline / options.height
      var vals = []

      canvasContext.fillStyle = options.backgroundColor
      canvasContext.fillRect(0, 0, options.width, options.height)

      canvasContext.fillStyle = options.waveColor

      for (var i = 0; i < options.width; i += options.barWidth) {
        vals.push(bufferMeasure(i * step, step, data) * 10000);
      }

      for (var j = 0; j < options.width; j += options.barWidth) {
        var scale = options.height / vals.max();
        var val = bufferMeasure(j * step, step, data) * 10000;
        val *= scale;
        val += 1;
        var w = options.barWidth;
        if (options.barGap !== 0) {
          w *= Math.abs(1 - options.barGap);
        }
        var x = j + (w / 2);

        var lowerHeight = val * ratio;
        var upperHeight = val * (1 - ratio);

        if(options.waveAlpha < 1) {
          canvasContext.clearRect(x, options.baseline, w, upperHeight);
          canvasContext.clearRect(x, options.baseline, w, -lowerHeight);
        }
        canvasContext.fillRect(x, options.baseline, w, upperHeight);
        canvasContext.fillRect(x, options.baseline, w, -lowerHeight);
      }
      cb(null, canvas.toBuffer())
    })
  });
}
