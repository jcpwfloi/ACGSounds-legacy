(function(window, document, undefined) {'use strict';
 function Compass(opt) {
     /**
      * Compass is a library providing search among ranges
      * Authors
      *     @Pisces000221
      * Dependencies:
      *     None
      *
      * Initialized with a collection of ranges (closed intervals),
      * Compass quickly finds which of the ranges intersect with another given range.
      * The ranges are all inclusive (closed intervals).
      *
      * The implementation uses a threshold to divide the ranges into
      * 'babies' (short ones) and 'giants' (long ones).
      * For each query, a binary search is carried out on the sorted list of 'babies'
      * while 'giants' are iterated through and checked.
      *
      * @param [opts]
      * @param {Number} [opts.threshold]
      * @constructor
      */

     EventListener.call(this);

     this.defaults = extend(this.defaults, {
         threshold: 5000
     });

     this.options = extend(this.options, {});
     this.babies = [];
     this.giants = [];

     extend(this.options, this.defaults, opt);
 }

 Compass.prototype = {
     load: function (arr) {
         if (!(arr instanceof Array)) throw new Error('Compass: only supports arrays');
         this.babies = [];
         this.giants = [];
         for (var i = 0; i < arr.length; ++i) {
             if (typeof arr[i].end !== 'number' || typeof arr[i].start !== 'number' || arr[i].end < arr[i].start) continue;
             if (arr[i].end - arr[i].start > this.options.threshold) this.giants.push(arr[i]);
             else this.babies.push(arr[i]);
         }
         this.babies.sort(function (a, b) { return a.start - b.start; });
     },
     eachDo: function (start, end, fun, context) {
         if (this.babies.length > 0) {
            var bStart, bEnd;
            var l = 0, r = this.babies.length, mid;
            while (l + 1 < r) {
                mid = l + r >> 1;
                if (this.babies[mid].start < start - this.options.threshold) l = mid;
                else r = mid;
            }
            bStart = l;
            l = 0, r = this.babies.length;
            while (l + 1 < r) {
                mid = l + r >> 1;
                if (this.babies[mid].start <= end) l = mid;
                else r = mid;
            }
            bEnd = l;
            //console.log(this.babies, bStart, bEnd);
            for (var i = bStart; i <= bEnd; ++i)
                if (this.babies[i].start <= end && this.babies[i].end >= start) fun.call(context, this.babies[i]);
         }
         for (var i = 0; i < this.giants.length; ++i)
             if (this.giants[i].start <= end && this.giants[i].end >= start)
                 fun.call(context, this.giants[i]);
     }
 };

 extend(Compass.prototype, EventListener.prototype);

 window.Compass = Compass;
})(window, document);

