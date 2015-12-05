var AUDIO = AUDIO || {};

AUDIO.VISUALIZER = (function () {
	'use strict';

	/**
	 * @description
	 * Visualizer constructor.
	 *
	 * @param {Object} cfg
	 */
	function Visualizer (cfg) {
		this.elem = cfg.elem || {};
		this.canvas = cfg.canvas || {};
		this.gradient = null;
		this.ctx = null;
		this.processor = null;
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
	Visualizer.prototype.setScriptProcessor = function () {
		this.processor = this.ctx.createScriptProcessor(2048, 1, 1);
		this.processor.connect(this.ctx.destination);

		this.processor.onaudioprocess = function () {
			this.analyser.getByteFrequencyData(this.frequencyData);
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
		this.analyser.connect(this.processor);
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
		this.audioSrc = this.elem.getAttribute('src');
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
		this.gradient.addColorStop(0.75, '#ff0000');
		this.gradient.addColorStop(0.25, '#ffff00');
		this.gradient.addColorStop(0, '#ffffff');
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
		console.log('error', e);
	};

	/**
	 * @description
	 * Create visualizer object.
	 *
	 * @param  {Object} cfg
	 * @return {Function}
	 * @private
	 */
	function _createVisualizer (cfg) {
		var visualizer = new Visualizer(cfg);

		return function () {
			visualizer
				.setContext()
				.setScriptProcessor()
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
	AUDIO.VISUALIZER.init({
		elem: document.getElementById('myAudio'),
		canvas: document.getElementById('canvas').getContext('2d')
	});
}, false);
