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
 var isBlack = [], relativePitch = [];

 var fallingTime = 2000;

 var playing = false;
 var drawer = null;
 var context = null;

 function PoBoo(opts) {
     EventListener.call(this);

     this.options = {};
     this.defaults = {
         canvasObject: 'canvas',
         colors: [
             [ 360, 96, 51 ],
             [ 14, 91, 51 ],
             [ 29, 94, 52 ],
             [ 49, 90, 60 ],
             [ 60, 90, 60 ],
             [ 135, 76, 32 ],
             [ 172, 68, 34 ],
             [ 248, 82, 28 ],
             [ 273, 80, 27 ],
             [ 302, 88, 26 ],
             [ 313, 78, 37 ],
             [ 325, 84, 46 ]
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
     draw: function() {
         internalDraw.call(context, MIDIjs.getTime());
         if (playing) window.requestAnimationFrame(drawer);
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

 function comp(a, b) {
     if (a.first.time < b.first.time) return -1;
     if (a.first.time === b.first.time) return 0;
     if (a.first.time > b.first.time) return 1;
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
     pair.sort(comp);
     this.pairs = pair;
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

 function calculateKeySize() {
     height = canvas.height = window.innerHeight;
     width = canvas.width = window.innerWidth;
     keyWidth = width / 52;
     keyHeight = keyWidth / WHITEKEYWIDTH * WHITEKEYHEIGHT;
     blackKeyWidth = keyWidth / WHITEKEYWIDTH * BLACKKEYWIDTH;
     blackKeyHeight = keyHeight / WHITEKEYHEIGHT * BLACKKEYHEIGHT;
 }

 function calculateKeyInfo() {
     for (var i = 0; i < 88; ++ i) isBlack.push(false), relativePitch.push(0);
     isBlack[1] = true;
     relativePitch[0] = 9;
     relativePitch[1] = 10;
     relativePitch[2] = 11;
     for (var i = 0; i < 7; ++ i)
     for (var j = 0; j < 12; ++ j) {
         isBlack[3 + i * 12 + j] = isBlackGroup[j];
         relativePitch[3 + i * 12 + j] = j;
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

 function max(a, b) { return a > b ? a : b; }

 function giveHSLColor(colorArray) {
     return 'hsla({0},{1}%,{2}%,1)'.format(colorArray[0], colorArray[1], colorArray[2]);
 }

 function drawKey(keyCode, deltaTime, persistTime) {
     var thisKeyHeight = persistTime / fallingTime * (height - keyHeight);
     var thisKeyY = (height - keyHeight) / fallingTime * (fallingTime - deltaTime);

     //ctx.fillStyle = 'rgba(' + context.options.colors[relativePitch[keyCode]].join(',') + ',1)';
     ctx.fillStyle = giveHSLColor(context.options.colors[relativePitch[keyCode]]);
     ctx.strokeStyle = 'black';

     var heightCalc = ((thisKeyY + thisKeyHeight > height - keyHeight) ? height - keyHeight - thisKeyY : thisKeyHeight);

     if (thisKeyY > height - keyHeight) return;
     if (thisKeyY < 0 && thisKeyY + heightCalc < 0) return;

     if (thisKeyY < 0)
         heightCalc = heightCalc + thisKeyY;

     roundedRect(keyInfo[keyCode].x, max(thisKeyY, 0), isBlack[keyCode] ? blackKeyWidth : keyWidth, heightCalc, 3);
 }

 function fillKey() {
 }

 function internalDraw(time) {
     if (time < 0) return;

     time *= 1000;

     clearBackground();
     drawBackground();
     var left, right;
     var l = 0, r = this.pairs.length, mid;
     while (l + 1 < r) {
         mid = l + r >> 1;
         if (this.pairs[mid].first.time < time - 2 * fallingTime) l = mid;
         else r = mid;
     }
     left = l;
     l = 0, r = this.pairs.length;
     while (l + 1 < r) {
         mid = l + r >> 1;
         if (this.pairs[mid].first.time < time + fallingTime) l = mid;
         else r = mid;
     }
     right = mid;

     for (var i = left; i <= right; ++ i) {
         drawKey(this.pairs[i].first.pitch - 21, this.pairs[i].first.time - time, this.pairs[i].second.time - this.pairs[i].first.time);
     }

     //draw this.pairs[left, right]

 }

 PoBoo.version = '<%= version %>';

 window.PoBoo = PoBoo;

 if (typeof define === "function" && defined.amd) {
     define("PoBoo", [], function () { return PoBoo; });
 }

})(window, document);

