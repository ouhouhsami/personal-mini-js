// This example shows four different engines running synchronized in a `Transport`.

var wavesAudio = waves.audio;
var wavesLoaders = waves.loaders;


(function() {
  var audioContext = wavesAudio.audioContext;
  var loader = new wavesLoaders.SuperLoader();
  var containerId = '#transport-container';
  // load audio and marker files
  loader.load(["./media/js/drums.json", "./media/audio/bass.wav", "./media/audio/guitar.wav", "./media/audio/drums.wav", "./media/audio/bd.wav", "./media/audio/synths.wav", "./media/audio/guitar-stereo.wav"])
    .then(function(loaded) {
      var markerBuffer = loaded[0];

      var bass = loaded[1];
      var guitar = loaded[2];
      var drums = loaded[3];
      var bd = loaded[4];
      var synth = loaded[5];
      var guitarStereo = loaded[6];

      var beatDuration = bass.duration / 16;

      // create and connect metronome engine
      /*
      var metronome = new wavesAudio.Metronome();
      metronome.period = beatDuration;
      metronome.connect(audioContext.destination);
      */

      var playerEngine = new wavesAudio.PlayerEngine({
        buffer: guitarStereo,
        cyclic: true
      });
      playerEngine.connect(audioContext.destination);

      // create and connect granular engine
      var granularEngine = new wavesAudio.GranularEngine({
        buffer: guitar,
        centered: false, // to be synchronous with other engines
        cyclic: true
      });

      var gain = audioContext.createGain();
      gain.gain.value = 1;
      var filter = audioContext.createBiquadFilter();
      filter.frequency.value = 250;
      filter.type = 'highpass';
      granularEngine.connect(gain);
      gain.connect(filter);
      filter.connect(audioContext.destination);

      // create and connect segment engine
      var segmentEngine = new wavesAudio.SegmentEngine({
        buffer: bd,
        cyclic: true,
        positionArray: markerBuffer.time,
        durationArray: markerBuffer.duration
      });
      segmentEngine.connect(audioContext.destination);

      var playerEngine2 = new wavesAudio.PlayerEngine({
        buffer: drums,
        cyclic: true
      });
      playerEngine2.connect(audioContext.destination);

      var playerEngine3 = new wavesAudio.PlayerEngine({
        buffer: synth,
        cyclic: true
      });
      playerEngine3.connect(audioContext.destination);

      var playerEngine4 = new wavesAudio.PlayerEngine({
        buffer: bass,
        cyclic: true
      });
      playerEngine4.connect(audioContext.destination);

      // create position display (as transported TimeEngine)
      var positionDisplay = new wavesAudio.TimeEngine();
      positionDisplay.period = 0.01 * beatDuration;

      positionDisplay.syncPosition = function(time, position, speed) {
        var nextPosition = Math.floor(position / this.period) * this.period;

        if (speed > 0 && nextPosition < position)
          nextPosition += this.period;
        else if (speed < 0 && nextPosition > position)
          nextPosition -= this.period;

        return nextPosition;
      };

      positionDisplay.advancePosition = function(time, position, speed) {
        seekSlider.value = (playControl.currentPosition / beatDuration).toFixed();

        if (speed < 0)
          return position - this.period;

        return position + this.period;
      };


      // create transport and add engines
      var transport = new wavesAudio.Transport();
      //transport.add(metronome);
      transport.add(playerEngine);
      //transport.add(granularEngine);
      //transport.add(segmentEngine);
      //transport.add(playerEngine2);
      //transport.add(playerEngine3);
      //transport.add(positionDisplay);

      // create play control
      var playControl = new wavesAudio.PlayControl(transport);
      playControl.setLoopBoundaries(0, bass.duration);
      playControl.loop = true;

      // create GUI elements
      new wavesBasicControllers.Title("Transport Play Control", containerId);

      new wavesBasicControllers.Toggle("Play", false, containerId, function(value) {
        if (value)
          playControl.start();
        else
          playControl.stop();
      });

      var speedSlider = new wavesBasicControllers.Slider("Speed", -2, 2, 0.01, 1, "", '', containerId, function(value) {
        playControl.speed = value;
        speedSlider.value = playControl.speed;
      });

      var seekSlider = new wavesBasicControllers.Slider("Seek", 0, 16, 1, 0, "beats", 'large', containerId, function(value) {
        playControl.seek(value * beatDuration);
      });
      /*
      new wavesBasicControllers.Slider("Loop Start", 0, 16, 1, 0, "beats", 'large', containerId, function(value) {
        playControl.loopStart = value * beatDuration;
      });

      new wavesBasicControllers.Slider("Loop End", 0, 16, 1, 16, "beats", 'large', containerId, function(value) {
        playControl.loopEnd = value * beatDuration;
      });
      */

      new wavesBasicControllers.Title("Enable Engines", containerId);
      /*
      new wavesBasicControllers.Toggle("Metronome", true, containerId, function(value) {
        if (value)
          transport.add(metronome);
        else
          transport.remove(metronome);
      });
      */

      new wavesBasicControllers.Toggle("Guitar - Player Engine", true, containerId, function(value) {
        if (value)
          transport.add(playerEngine);
        else
          transport.remove(playerEngine);
      });

      new wavesBasicControllers.Toggle("Guitar - Granular Engine", false, containerId, function(value) {
        if (value)
          transport.add(granularEngine);
        else
          transport.remove(granularEngine);
      });

      new wavesBasicControllers.Toggle("Kick - Segment Engine", false, containerId, function(value) {
        if (value)
          transport.add(segmentEngine);
        else
          transport.remove(segmentEngine);
      });

      new wavesBasicControllers.Toggle("Drums - Player Engine", false, containerId, function(value) {
        if (value)
          transport.add(playerEngine2);
        else
          transport.remove(playerEngine2);
      });

      new wavesBasicControllers.Toggle("Synth - Player Engine", false, containerId, function(value) {
        if (value)
          transport.add(playerEngine3);
        else
          transport.remove(playerEngine3);
      });

      new wavesBasicControllers.Toggle("Bass - Player Engine", false, containerId, function(value) {
        if (value)
          transport.add(playerEngine4);
        else
          transport.remove(playerEngine4);
      });


    });
})();
