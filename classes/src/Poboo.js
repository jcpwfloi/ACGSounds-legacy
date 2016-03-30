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
  *         @constructor(opts) opts alias options
  */

 function PoBoo(opts) {
     EventListener.call(this);

     this.options = {};
     this.defaults = {
         canvasObject: '#drawer',
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
 }

 PoBoo.prototype = {
     load: function(midi) {
         if (typeof midi === "string") {
             if (midi.indexOf('data') === 0) {
                 //deal with base64 data
             } else {
                 read_array_buffer_from_url(midi, function(buf) {
                     var file = new MIDIFile(buf);
                 });
             }
         }
     }
 };

 extend(PoBoo.prototype, EventListener.prototype);

 function read_array_buffer_from_url(url, callback) {
     var req = new XMLHttpRequest();
     req.open('GET', url, true);
     req.responseType = 'arraybuffer';
     req.onload = function(e) {
         var buf = req.response;
         if (buf) {
             callback(buf);
         }
     };
     req.send(null);
 }

 PoBoo.version = '<%= version %>';

 window.PoBoo = PoBoo;
 
 if (typeof define === "function" && defined.amd) {
     define("flow", [], function () { return PoBoo; });
 }

})(window, document);

