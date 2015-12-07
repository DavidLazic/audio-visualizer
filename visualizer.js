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
        this.canvas = document.getElementById(cfg.canvas) || {};
        this.canvasCtx = this.canvas.getContext('2d') || null;
        this.barWidth = cfg.barWidth || 2;
        this.barHeight = cfg.barHeight || 2;
        this.barSpacing = cfg.barSpacing || 5;
        this.barColor = cfg.barColor || '#ffffff';
        this.gradient = null;
        this.ctx = null;
        this.analyser = null;
        this.sourceNode = null;
        this.frequencyData = 0;
        this.audioSrc = null;
        this.counter = 0;
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
            this.canvasCtx.clearRect(0, 0, 1000, 325);
            this.canvasCtx.fillStyle = this.gradient;
            this.canvasCtx.shadowBlur = 10;
            this.canvasCtx.shadowColor = '#ffffff';
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
        this.analyser.smoothingTimeConstant = 0.6;
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

        this.sourceNode.onended = function () {
            console.log('End.');
        };

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
        this.gradient = this.canvasCtx.createLinearGradient(0, 0, 0, 300);
        this.gradient.addColorStop(1, this.barColor);
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
        var cx = this.canvas.width / 2;
        var cy = this.canvas.height / 2;
        var radius = Math.ceil(this.canvas.height / 3);
        var maxBarNum = Math.floor((radius * 2 * Math.PI) / (this.barWidth + this.barSpacing));
        var slicedPercent = Math.floor((maxBarNum * 25) / 100);
        var barNum = maxBarNum - slicedPercent;
        var freqJump = Math.floor(this.frequencyData.length / maxBarNum);

        for (var i = 0; i < barNum; i++) {
            var amplitude = this.frequencyData[i * freqJump];
            var alfa = (i * 2 * Math.PI ) / maxBarNum;
            var beta = (3 * 45 - this.barWidth) * Math.PI / 180;
            var x = 0;
            var y = radius - (amplitude / 24 - this.barHeight);
            var w = this.barWidth;
            var h = amplitude / 12 + this.barHeight;

            this.canvasCtx.save();
            this.canvasCtx.translate(cx + this.barSpacing, cy + this.barSpacing);
            this.canvasCtx.rotate(alfa - beta);
            this.canvasCtx.fillRect(x, y, w, h);
            this.canvasCtx.restore();
        }
    };

    /**
     * @description
     * Create visualizer object instance.
     *
     * @param  {Object} cfg
     * {
     *     audio: <String>,
     *     canvas: <String>,
     *     barWidth: <Integer>,
     *     barHeight: <Integer>,
     *     barSpacing: <Integer>,
     *     barColor: <String>
     * }
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
        canvas: 'myCanvas',
        barWidth: 2,
        barHeight: 2,
        barSpacing: 7,
        barColor: '#cafdff'
    }).loadSound();
}, false);
