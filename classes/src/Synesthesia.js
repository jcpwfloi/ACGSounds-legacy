(function(window, document, undefined) {'use strict';
 /**
  * Synesthesia is a part of ACGSounds Runtime Library dedicated to
  * render waterfall effect of MIDI.
  *
  * Author:
  *     @arcGravitus
  *
  * API Introduction:
  *     @class Synesthesia
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
  *         @param {Number, Number, Number} drawNote(keyCode, deltaTime, persistTime) draw key with `keycode` pitch(0-87), deltaTime(nowTime - topTime),persisTime the keypress time of distinct key.
  */

 var canvas, ctx;

 var BLACKKEYHEIGHT = 8.6, BLACKKEYWIDTH = 1.2, WHITEKEYHEIGHT = 14.4, WHITEKEYWIDTH = 2.4;
 var blackKeyNoteWidth = 1, whiteKeyNoteWidth = 0.8;

 var height, width, keyHeight, keyWidth, blackKeyHeight, blackKeyWidth;

 var octaveBlacks = [false, true, false, true, false, false, true, false, true, false, true, false];

 var noteName = [];
 var isBlack = [];
 var keyRects = [];

 var fallingTime = 2000;
 var attackTimeAdjustment = 164;
 var releaseTime = 55;

 var playing = false;
 var drawer = null;
 var context = null;
 
 var compass = null;

 function Synesthesia(opts) {
     EventListener.call(this);

     this.options = {};
     this.defaults = {
         canvasObject: 'canvas',
         colors: [
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
     repaintKeys(0);
     drawBackground();
 }

 Synesthesia.prototype = {
     load: function(midi) {
         if (midi instanceof ArrayBuffer) {
             this.midiFile = new MIDIFile(midi);
             MIDIjs.load(midi);
             this.fire('load');
         } else if (typeof midi === "string") {
             if (midi.indexOf('data') === 0) {
             } else {
                 read_array_buffer_from_url(midi, function(buf) {
                     this.midiFile = new MIDIFile(buf);
                     MIDIjs.load(buf);
                     this.fire('load');
                 }, this);
             }
         }
     },
     analyze: function() {
         read_midi_events.call(this);
         generate_pitch_pairs.call(this);
     },
     play: function() {
         drawer = this.draw;
         context = this;
         window.requestAnimationFrame(drawer);
         playing = true;
         MIDIjs.play();
     },
     pause: function() {
         playing = false;
         MIDIjs.pause();
     },
     resume: function() {
         playing = true;
         window.requestAnimationFrame(drawer);
         MIDIjs.resume();
     },
     seek: function(time) {
         MIDIjs.seek(time);
         if (!playing) this.resume();
     },
     draw: function() {
         ctx.globalCompositeOperation = "source-over";
         refreshNotes.call(context, MIDIjs.getTime());
         if (playing) window.requestAnimationFrame(drawer);
     }
 };

 extend(Synesthesia.prototype, EventListener.prototype);

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
     var firstNoteDown = -1;
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
                 if (firstNoteDown === -1) firstNoteDown = events[i].playTime;
             }
         }
     }
     for (var i = 0; i < ret.length; ++i) ret[i].time -= firstNoteDown;
     this.event = events;
     this.analyzedEvents = ret;
     this.fire('analyze', ret);
 }

 function generate_pitch_pairs() {
     var map = [], pair = [];
     for (var i = 0; i < 128; ++ i) map.push([]);
     //time, is_on, pitch, vel
     each(this.analyzedEvents, function(val) {
         if (val.is_on == 1) map[val.pitch].push(val);
         else {
             if (map[val.pitch].length) {
                 pair.push({
                     first: map[val.pitch][map[val.pitch].length - 1],
                     second: val
                 });
                 map[val.pitch].pop();
             } else throw new Error('Pitch Pair does not match');
         }
     }, this);
     pair.sort(function (a, b) { return a.first.time - b.first.time; });
     this.pairs = pair;
     compass = new Compass({ threshold: fallingTime * 2 });
     compass.load(pair.map(function (e, idx) { return { start: e.first.time, end: e.second.time, index: idx }; }));
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
     ctx.fill();
     ctx.stroke();
 }

 function fillRectWithColor(rect, color) {
     ctx.fillStyle = color;
     ctx.fillRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
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
     for (var i = 0; i < 88; ++i) {
         noteName[i] = (i + 9) % 12;
         isBlack[i] = octaveBlacks[noteName[i]];
     }
     var offsetWidth = 0;
     for (var i = 0; i < 88; ++i) {
         if (isBlack[i]) {
             keyRects.push({
                 x1: offsetWidth - blackKeyWidth / 2,
                 x2: offsetWidth + blackKeyWidth / 2,
                 y1: height - keyHeight,
                 y2: height - keyHeight + blackKeyHeight
             });
         } else {
             keyRects.push({
                 x1: offsetWidth,
                 x2: offsetWidth + keyWidth,
                 y1: height - keyHeight,
                 y2: height
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

 /*function drawPianoKeyBoard() {
     for (var i = 0; i < 88; ++i) clearKey(i);
 }*/

 function drawBackground() {
     ctx.save();
     ctx.fillStyle = 'rgba(144, 144, 144, 1)';
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

 function max(a, b) { return a > b ? a : b; }

 function noteColor(keyCode, transparency) {
     if (transparency > 1) transparency = 1;
     var keyboardVal = (isBlack[keyCode] ? 0 : 100);
     //context ? context.options.colors[noteName[keyCode]][0] : 0
     return 'hsl({0},{1}%,{2}%)'.format(noteName[keyCode] * 30, 70 + (keyboardVal - 70) * transparency, 65 + (keyboardVal - 65) * transparency);
 }

 function drawNote(keyCode, deltaTime, persistTime) {
     var thisKeyHeight = persistTime / fallingTime * (height - keyHeight);
     var thisKeyY = (height - keyHeight) / fallingTime * (fallingTime - deltaTime) - thisKeyHeight;

     ctx.fillStyle = noteColor(keyCode, 0);
     ctx.strokeStyle = 'rgb(48, 48, 48)';

     var heightCalc = ((thisKeyY + thisKeyHeight > height - keyHeight) ? height - keyHeight - thisKeyY : thisKeyHeight);

     if (thisKeyY > height - keyHeight) return;
     if (thisKeyY < 0 && thisKeyY + heightCalc < 0) return;

     if (thisKeyY < 0)
         heightCalc = heightCalc + thisKeyY;

     var noteWidth = isBlack[keyCode] ? blackKeyWidth * blackKeyNoteWidth : keyWidth * whiteKeyNoteWidth;
     roundedRect((keyRects[keyCode].x1 + keyRects[keyCode].x2 - noteWidth) / 2, max(thisKeyY, 0), noteWidth, heightCalc, 3);
 }

 var keyboardLastOn = [];
 for (var i = 0; i < 88; ++i) keyboardLastOn[i] = -999999;

 function fillKey(keyCode, time) {
     fillRectWithColor(keyRects[keyCode],
         noteColor(keyCode, (time - keyboardLastOn[keyCode]) / releaseTime));
 }

 function repaintKeys(time) {
     for (var i = 0; i < 88; ++i) if (!isBlack[i]) {
         fillKey(i, time);
         ctx.beginPath();
         ctx.moveTo(keyRects[i].x1, keyRects[i].y1);
         ctx.strokeWeight = 1;
         ctx.strokeStyle = 'rgba(192, 192, 192, 1)';
         ctx.lineTo(keyRects[i].x1, keyRects[i].y2);
         ctx.stroke();
     }
     for (var i = 0; i < 88; ++i) if (isBlack[i]) fillKey(i, time);
 }

 window.FPS = (function () {
     var lastLoop = (new Date()).getMilliseconds();
     var count = 1;
     var fps = 0;

     return function () {
         var currentLoop = (new Date()).getMilliseconds();
         if (lastLoop > currentLoop) {
             fps = count;
             count = 1;
         } else {
             count += 1;
         }
         lastLoop = currentLoop;
         return fps;
     };
 }());

 function refreshNotes(time) {
     if (time < 0) return;

     this.fire('animate', FPS());

     time *= 1000;
     time -= attackTimeAdjustment;

     clearBackground();
     drawBackground();

     compass.eachDo(
         time, time + fallingTime, function (e) {
             var i = e.index;
             var keynum = this.pairs[i].first.pitch - 21;
             drawNote(keynum, this.pairs[i].first.time - time, this.pairs[i].second.time - this.pairs[i].first.time);
             if (this.pairs[i].first.time <= time) keyboardLastOn[keynum] = time;
         }, this
     );
     repaintKeys(time);
 }

 Synesthesia.version = '<%= version %>';

 window.Synesthesia = Synesthesia;

 if (typeof define === "function" && defined.amd) {
     define("Synesthesia", [], function () { return Synesthesia; });
 }

})(window, document);

