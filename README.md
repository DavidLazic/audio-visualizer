## Audio Visualizer
Vanilla JS

#### Description:

Web Audio experiment for audio visualization on canvas.

#### Usage

Include visualizer script in your index.html

````html
<script src="visualizer.js"></script>
````

````html
    <div>
        <audio id="myAudio" src="path/to/source/audio/" data-author="insert/author/name" data-title="insert/audio/name"></audio>
        <canvas id="myCanvas" width="800" height="400"></canvas>
    </div>
````
**Notice**: For visualizer to render audio and author names you'll have to set `data-author` and `data-title` attributes on your audio element.


Create Visualizer instance

````shell
    AUDIO.VISUALIZER.getInstance({
        audio: 'myAudio',
        canvas: 'myCanvas',
    });
````

#### Options

````shell
**audio** (String) (required)
````
Audio element's ID selector.

````shell
**canvas** (String) (required)
````
Canvas element's ID selector.

````shell
**autoplay** (Boolean)
````
Auto-start visualizer.

````shell
**loop** (Boolean)
````
Sets visualizer auto-replay option.

````shell
**style** (Boolean)
````
Sets canvas rendering visualization style. Currently only 'lounge' style is supported.

````shell
**barWidth** (Integer)
````
Sets bar's width in pixels.

````shell
**barHeight** (Integer)
````
Sets initial bar's height in pixels (when there's no visualization).

````shell
**barSpacing** (Integer)
````
Sets spacing between bars in pixels.

````shell
**barColor** (String) - '#cafdff'
````
Sets HEX value as bar's color.

````shell
**shadowBlur** (Integer)
````
Sets value as bar's shadow blur.

````shell
**shadowColor** (String) - '#ffffff'
````
Sets HEX value as bar's shadow color.

````shell
**font** (Array) - ['12px', 'Helvetica']
````
Sets font size and font type.


#### CSS Styles
Style by your own preference or you can use my styles.

````html
<div class="vz-wrapper">
    <audio id="myAudio" src="path/to/source/audio" data-author="insert/author/name" data-title="insert/audio/name"></audio>

    <div class="vz-wrapper -canvas">
        <canvas id="myCanvas" width="800" height="400"></canvas>
    </div>
</div>
````

````css
body {
    margin: 0;
}

.vz-wrapper {
    position: relative;
    height: 100vh;
    width: 100%;
    background: -webkit-gradient(radial, center center, 0, center center, 460, from(#396362), to(#000000));
    background: -webkit-radial-gradient(circle, #396362, #000000);
    background: -moz-radial-gradient(circle, #396362, #000000);
    background: -ms-radial-gradient(circle, #396362, #000000);
    box-shadow: inset 0 0 160px 0 #000;
    cursor: pointer;
}

.vz-wrapper.-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: initial;
    width: initial;
    background: transparent;
    box-shadow: none;
}

@media screen and (min-width: 420px) {
    .vz-wrapper {
        box-shadow: inset 0 0 200px 60px #000;
    }
}
````

[Live preview](http://davidlazic.github.io/audio-visualizer)
