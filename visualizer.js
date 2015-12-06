var AUDIO = AUDIO || {};

AUDIO.VISUALIZER = (function () {
    'use strict';

    var PROCESSOR;

    /**
     * @description
     * Visualizer constructor.
     *
     * @param {Object} cfg
     */
    function Visualizer (cfg) {
        this.audio = document.getElementById(cfg.audio) || {};
        this.canvas = document.getElementById(cfg.canvas).getContext('2d') || {};
        this.gradient = null;
        this.ctx = null;
        this.analyser = null;
        this.sourceNode = null;
        this.frequencyData = 0;
        this.audioSrc = null;
    }

    /**
     * @description
     * Set current audio context.
     *
     * @return {Object}
     */
    Visualizer.prototype.setContext = function () {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new window.AudioContext();
            return this;
        } catch (e) {
            console.info('Web Audio API is not supported.', e);
        }
    };

    /**
     * @description
     * Set JS node processor for audio file.
     *
     * @return {Object}
     */
    Visualizer.prototype.setProcessor = function () {
        PROCESSOR = this.ctx.createScriptProcessor(1024, 1, 1);
        PROCESSOR.connect(this.ctx.destination);

        PROCESSOR.onaudioprocess = function () {
            this.analyser.getByteFrequencyData(this.frequencyData);
            this.canvas.clearRect(0, 0, 1000, 325);
            this.canvas.fillStyle = this.gradient;
            this.renderFrame();
        }.bind(this);
        return this;
    };

    /**
     * @description
     * Set buffer analyser.
     *
     * @return {Object}
     */
    Visualizer.prototype.setAnalyser = function () {
        this.analyser = this.ctx.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.3;
        this.analyser.fftSize = 512;
        return this;
    };

    /**
     * @description
     * Set frequency data.
     *
     * @return {Object}
     */
    Visualizer.prototype.setFrequencyData = function () {
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        return this;
    };

    /**
     * @description
     * Set source buffer and connect processor and analyser.
     *
     * @return {Object}
     */
    Visualizer.prototype.setBufferSourceNode = function () {
        this.sourceNode = this.ctx.createBufferSource();
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(PROCESSOR);
        this.sourceNode.connect(this.ctx.destination);
        return this;
    };

    /**
     * @description
     * Set current media source url.
     *
     * @return {Object}
     */
    Visualizer.prototype.setMediaSource = function () {
        this.audioSrc = this.audio.getAttribute('src');
        return this;
    };

    /**
     * @description
     * Set canvas gradient color.
     *
     * @return {Object}
     */
    Visualizer.prototype.setGradient = function () {
        this.gradient = this.canvas.createLinearGradient(0, 0, 0, 300);
        this.gradient.addColorStop(1, '#000000');
        // this.gradient.addColorStop(0.75, '#ff0000');
        // this.gradient.addColorStop(0.25, '#ffff00');
        // this.gradient.addColorStop(0, '#ffffff');
        return this;
    };

    /**
     * @description
     * Load sound file.
     */
    Visualizer.prototype.loadSound = function () {
        var req = new XMLHttpRequest();
        req.open('GET', this.audioSrc, true);
        req.responseType = 'arraybuffer';

        req.onload = function () {
            this.ctx.decodeAudioData(req.response, this.playSound.bind(this), this.onError.bind(this));
        }.bind(this);

        req.send();
    };

    /**
     * @description
     * Play sound from the given buffer.
     *
     * @param  {Object} buffer
     */
    Visualizer.prototype.playSound = function (buffer) {
        this.sourceNode.buffer = buffer;
        this.sourceNode.start(0);
    };

    /**
     * @description
     * On audio data stream error fn.
     *
     * @param  {Object} e
     */
    Visualizer.prototype.onError = function (e) {
        console.info('Error. -- ', e);
    };

    /**
     * @description
     * Render frame on canvas.
     */
    Visualizer.prototype.renderFrame = function () {
        var width = 1000;
        var height = 325;
        var cx = width / 2;
        var cy = height / 2;
        var radius = 70;
        var initBarHeight = 2;
        var barWidth = 2;
        var barSpacing = 5;
        var maxBarNum = Math.floor((radius * 2 * Math.PI) / (barWidth + barSpacing));
        var slicedPercent = Math.floor((maxBarNum * 25) / 100);
        var barNum = maxBarNum - slicedPercent;
        var jump = Math.floor(this.frequencyData.length / barNum);

        for (var i = 0; i < barNum; i++) {
            var freqValue = this.frequencyData[i * jump];

            this.canvas.save();
            this.canvas.translate(cx + barSpacing, cy + barSpacing);
            this.canvas.rotate(((i * 2 * Math.PI ) / maxBarNum) - ((3 * 45 - barWidth) * Math.PI / 180));
            this.canvas.fillRect(0, radius / 2, barWidth, freqValue / 2 + initBarHeight);
            this.canvas.restore();
        }
    };

    /**
     * @description
     * Create visualizer object.
     *
     * @param  {Object} cfg {audio: <audio_elem>, canvas: <canvas_elem>}
     * @return {Function}
     * @private
     */
    function _createVisualizer (cfg) {
        var visualizer = new Visualizer(cfg);

        return function () {
            visualizer
                .setContext()
                .setProcessor()
                .setAnalyser()
                .setFrequencyData()
                .setBufferSourceNode()
                .setMediaSource()
                .setGradient();

            return visualizer;
        };
    }

    /**
     * @description
     * Initialize visualizer.
     *
     * @param  {Object} cfg
     * @return {Object}
     * @public
     */
    function init (cfg) {
        return _createVisualizer(cfg)();
    }

    /**
     * @description
     * Visualizer module API.
     *
     * @public
     */
    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    AUDIO.VISUALIZER.init({
        audio: 'myAudio',
        canvas: 'myCanvas'
    }).loadSound();
}, false);
