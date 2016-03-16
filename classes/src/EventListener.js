(function(window, document, undefined) {'use strict';
 EventListener.prototype = {
     on: function(event, callback) {
         event = event.toLowerCase();
         if (!this.events.hasOwnProperty(event)) {
             this.events[event] = [];
         }
         this.events[event].push(callback);
     },

     off: function(event, fn) {
         if (event !== undefined) {
             event = event.toLowercase();
             if (fn !== undefined) {
                 if (this.events.hasOwnProperty(event)) {
                     arrayRemove(this.events[event], fn);
                 }
             } else {
                 delete this.events[event];
             }
         } else {
             this.events = {};
         }
     },

     fire: function(event, args) {
         args = Array.prototype.slice.call(arguments);
         event = event.toLowerCase();
         var preventDefault = false;
         if (this.events.hasOwnProperty(event)) {
             each(this.events[event], function(callback) {
                 preventDefault = callback.apply(this, args.slice(1)) === false || preventDefault;
             }, this);
         }
         if (event != 'catchall') {
             args.unshift('catchAll')
             preventDefault = this.fire.apply(this, args) === false || preventDefault();
         }
         return !preventDefault;
     }
 };
})(window, document);
