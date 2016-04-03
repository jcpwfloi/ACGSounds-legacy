(function(window, document, undefined) {'use strict';
 /**
  * PoBoo is a part of ACGSounds Runtime Library dedicated to
  * render waterfall effect of MIDI.
  *
  * Author:
  *     @arcGravitus
  *
  * API Introduction:
  *     @class PoBoo
  *         @inherit EventListener
  *         @constructor(opts) opts alias options
  *
  *     @public
  *
  *     @private
  *         @param {String, function, Object} read_array_buffer_from_url Reads from URL and request ArrayBuffer data
  *         @param {Object, ArrayBuffer} loadMIDIFileAndCatchError() reads from ArrayBuffer and Convert it into a MIDIFile along with a "load" event
  *         @param {Number, Number, Number, Number, Number} roundedRect(x, y, width, height, radius) draw a rounded rectangle with a radius `radius`
  *         @param {} calculateKeySize() calculate the width and height of black and white keys
  *         @param {} calculateKeyInfo() calculate the offsetX and `isBlack` of each distinct key
  *         @param {} setPageCSS() set the margin and padding of body to 0 and disable scroll
  *         @param {} drawPianoKeyBoard() draw piano keyboard
  *         @param {} drawBackground() draw gray background
  *         @param {} clearBackground() clear background
  *         @param {Number, Number, Number} drawKey(keyCode, deltaTime, persistTime) draw key with `keycode` pitch(0-87), deltaTime(nowTime - topTime),persisTime the keypress time of distinct key.
  */

 var canvas, ctx;

 var BLACKKEYHEIGHT = 8.6, BLACKKEYWIDTH = 1.2, WHITEKEYHEIGHT = 14.4, WHITEKEYWIDTH = 2.4;

 var height, width, keyHeight, keyWidth, blackKeyHeight, blackKeyWidth;

 var blackKey = [true, true, false, true, true, true, false];
 var isBlackGroup = [false, true, false, true, false, false, true, false, true, false, true, false];

 var keyInfo = [];
 var isBlack = [];

 var fallingTime = 3000;

 function PoBoo(opts) {
     EventListener.call(this);

     this.options = {};
     this.defaults = {
         canvasObject: 'canvas',
         colors: [
             [248, 82, 28], //C
             [172, 68, 34], //C#
             [135, 76, 32], //D
             [79, 59, 36], //D#
             [60, 90, 60], //E
             [49, 90, 60], //F
             [29, 94, 52], //F#
             [360, 96, 51], //G
             [1, 89, 33], //G#
             [325, 84, 46], //A
             [273, 80, 27], //A#
             [302, 88, 26] //B
         ]
     };

     extend(this.options, this.defaults, opts);

     //start Internal EventListener
     
    this.on('load', function(err) {
        if (this.midiFile) this.analyze();
        else throw new Error('Error loading MIDIFile');
    });

     //end Internal EventListener

     canvas = document.getElementById('canvas');
     ctx = canvas.getContext('2d');

     calculateKeySize();
     calculateKeyInfo();
     setPageCSS();
     drawPianoKeyBoard();
     drawBackground();
 }

 PoBoo.prototype = {
     load: function(midi) {
         if (midi instanceof ArrayBuffer) {
             this.midiFile = new MIDIFile(midi);
             this.fire('load');
         } else if (typeof midi === "string") {
             if (midi.indexOf('data') === 0) {
             } else {
                 read_array_buffer_from_url(midi, function(buf) {
                     this.midiFile = new MIDIFile(buf);
                     this.fire('load');
                 }, this);
             }
         }
     },
     analyze: function() {
         read_midi_events.call(this);
         generate_pitch_pairs();
     }
 };

 extend(PoBoo.prototype, EventListener.prototype);

 function read_array_buffer_from_url(url, callback, context) {
     var req = new XMLHttpRequest();
     req.open('GET', url, true);
     req.responseType = 'arraybuffer';
     req.onload = function(e) {
         var buf = req.response;
         if (buf) {
             callback.call(context, buf);
         }
     };
     req.send(null);
 }
 
 function read_midi_events() {
     var file = this.midiFile;
     var events = file.getEvents();
     var ret = [];
     for (var i = 0; i < events.length; ++i) {
         if (events[i].type === MIDIEvents.EVENT_MIDI) {
             if (events[i].subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF) {
                 ret.push({
                     time: events[i].playTime,
                     is_on: 0,
                     pitch: events[i].param1,
                     vel: events[i].param2
                 });
             } else if (events[i].subtype === MIDIEvents.EVENT_MIDI_NOTE_ON) {
                 ret.push({
                     time: events[i].playTime,
                     is_on: 1,
                     pitch: events[i].param1,
                     vel: events[i].param2
                 });
             }
         }
     }
     this.event = events;
     this.analyzedEvents = ret;
     this.fire('analyze', ret);
 }

 function generate_pitch_pairs() {
 }

 function roundedRect(cornerX, cornerY, width, height, cornerRadius) {
     ctx.beginPath();
     if (width > 0)
         ctx.moveTo(cornerX + cornerRadius, cornerY);
     else
         ctx.moveTo(cornerX - cornerRadius, cornerY);
     ctx.arcTo(cornerX + width, cornerY, cornerX + width, cornerY + height, cornerRadius);
     ctx.arcTo(cornerX + width, cornerY + height, cornerX, cornerY + height, cornerRadius);
     ctx.arcTo(cornerX, cornerY + height, cornerX, cornerY, cornerRadius);
     if (width > 0)
         ctx.arcTo(cornerX, cornerY, cornerX + cornerRadius, cornerY, cornerRadius);
     else
         ctx.arcTo(cornerX, cornerY, cornerX - cornerRadius, cornerY, cornerRadius);
     ctx.stroke();
     ctx.fill();
 }

 function calculateKeySize() {
     height = canvas.height = window.innerHeight;
     width = canvas.width = window.innerWidth;
     keyWidth = width / 52;
     keyHeight = keyWidth / WHITEKEYWIDTH * WHITEKEYHEIGHT;
     blackKeyWidth = keyWidth / WHITEKEYWIDTH * BLACKKEYWIDTH;
     blackKeyHeight = keyHeight / WHITEKEYHEIGHT * BLACKKEYHEIGHT;
 }

 function calculateKeyInfo() {
     for (var i = 0; i < 88; ++ i) isBlack.push(false);
     isBlack[1] = true;
     for (var i = 0; i < 7; ++ i)
     for (var j = 0; j < 12; ++ j) {
         isBlack[3 + i * 12 + j] = isBlackGroup[j];
     }
     isBlack.push(false);
     var offsetWidth = 0;
     for (var i = 0; i < 88; ++ i) {
         if (isBlack[i]) {
             keyInfo.push({
                 isBlack: true,
                 x: offsetWidth - blackKeyWidth / 2
             });
         } else {
             keyInfo.push({
                 isBlack: false,
                 x: offsetWidth
             });
             offsetWidth += keyWidth;
         }
     }
 }

 function setPageCSS() {
     document.body.style.margin = 0;
     document.body.style.padding = 0;
     document.body.style.overflow = 'scroll';
     document.body.style.overflowX = 'hidden';
     document.body.style.overflowY = 'hidden';
 }

 function drawPianoKeyBoard() {
     ctx.fillStyle = 'rgba(0,0,0,1)';
     ctx.strokeStyle = 'rgba(100,100,100,1)';

     for (var i = 0; i < 52; ++ i)
         ctx.strokeRect(i * keyWidth, height - keyHeight, keyWidth, keyHeight);

     ctx.fillRect(keyWidth - blackKeyWidth / 2, height - keyHeight, blackKeyWidth, blackKeyHeight);

     canvas.globalCompositeOperation = 'source-over';

     for (var i = 0; i < 7; ++ i)
     for (var j = 0; j < 7; ++ j)
     if (blackKey[j]) {
         var offsetWidth = (i * 7 + j + 2) * keyWidth;
         ctx.fillRect(offsetWidth + keyWidth - blackKeyWidth / 2, height - keyHeight, blackKeyWidth, blackKeyHeight);
     }
 }

 function drawBackground() {
     ctx.save();
     ctx.fillStyle = 'rgba(100, 100, 100, 1)';
     ctx.fillRect(0, 0, width, height - keyHeight);

     ctx.fillStyle = 'rgba(255, 255, 255, 1)';
     ctx.translate(keyWidth * 2, 0);

     for (var i = 0; i < 8; ++ i) {
         ctx.fillRect(0, -0.5, 1, height - keyHeight);
         ctx.translate(keyWidth * 7, 0);
     }

     ctx.restore();
 }

 function clearBackground() {
     ctx.clearRect(0, 0, width, height - keyHeight);
 }

 function drawKey(keyCode, deltaTime, persistTime) {
     var thisKeyHeight = persistTime / fallingTime * (height - keyHeight);
     var thisKeyY = (height - keyHeight) / fallingTime * deltaTime;

     ctx.fillStyle = isBlack[keyCode] ? '#4db6ac' : '#b2dfdb';
     ctx.strokeStyle = 'black';

     if (thisKeyY > height - keyHeight) return;

     roundedRect(keyInfo[keyCode].x, thisKeyY, isBlack[keyCode] ? blackKeyWidth : keyWidth, ((thisKeyY + thisKeyHeight > height - keyHeight) ? height - keyHeight - thisKeyY : thisKeyHeight), 3);
 }

 PoBoo.version = '<%= version %>';

 window.PoBoo = PoBoo;

 if (typeof define === "function" && defined.amd) {
     define("PoBoo", [], function () { return PoBoo; });
 }

})(window, document);

