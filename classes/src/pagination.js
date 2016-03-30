(function(window, document, undefined) {'use strict';
 function Pagination(opt) {
     /**
      * Pagination is a library providing paging methods for ACGSounds
      * Author
      *     @arcGravitus
      * Dependencies:
      *     jQuery
      *
      * @param [opts]
      * @param {Number} [opts.dispRange] 
      * @param {Number} [opts.perPage]
      * @param {Boolean} [opts.remote]
      * @param {JSON Object} [opts.postParams]
      * @param {Function} [opts.pageButton]
      * @param {Function} [opts.prevButton]
      * @param {Function} [opts.nextButton]
      * @param {Function} [opts.contentRenderer]
      * @constructor
      */

     extend(this, new EventListener());

     this.defaults = extend(this.defaults, {
         dispRange: 2,
         perPage: 4,
         postParams: {},
         pageButton: function (num, active) {
         },
         prevButton: function (disabled) {
         },
         nextButton: function (disabled) {
         },
         ellipsis: function () {
         },
         pageButtonsAdd: function (html) {
         },
         contentRenderer: function (num, ctnt) {
         },
         contentClearer: function () {
         }
     });

     this.options = this.options || {};

     extend(this.options, this.defaults, opt);
 }

 Pagination.prototype = {
     /**
      * Load Data from remote URL by POST API
      * @param {Function} [callback] Will be called with argument 'null' on success, or the error object on error
      */
     loadRemote: function (callback, callback_ctx) {
         if (this.contents && this.contents[this.current * this.options.perPage]) {
             callback.call(callback_ctx, null);
             return;
         }
         var data = {
             start: this.current * this.options.perPage,
             count: this.options.perPage
         };
         extend(data, this.options.postParams);
         $.post(this.remoteURL, data, (function (self, fn) { return function (r) {
             if (!self.contents) {
                self.contents = [];
                self.itemCount = r.count;
                self.current = 0;
                self.pageCount = Math.ceil(r.count / self.options.perPage);
             }
             for (var i = 0; i < r.list.length; ++i) {
                 self.contents[i + self.current * self.options.perPage] = r.list[i];
             }
             if (typeof fn === "function") fn.call(callback_ctx, null);
         }; })(this, callback), 'json').error(function (e) {
             if (typeof callback === "function") callback.call(callback_ctx, e);
         });
     },
     loadFromArray: function (arr, callback) {
         this.contents = arr;
         this.itemCount = arr.length;
         this.pageCount = Math.ceil(arr.length / this.options.perPage);
         this.go(0);
         if (typeof callback === "function") callback(null);
     },
     go: function (num) {
         this.current = num;
         var proceed = function () {
            this.options.contentClearer();
            var rg;
            rg = getPagesRange(this);
            var buttons_html = this.options.prevButton(this.current === 0);
            for (var i = 0; i < rg.length; ++i) {
                if (rg[i] === -1) buttons_html += this.options.ellipsis();
                else buttons_html += this.options.pageButton(rg[i], this.current === rg[i]);
            }
            buttons_html += this.options.nextButton(this.current === this.pageCount - 1);
            this.options.pageButtonsAdd(buttons_html);
            rg = getSinglePageRange(this);
            for (var i = rg.begin; i < rg.end; ++i) {
                this.options.contentRenderer(i, this.contents[i]);
            }
         };
         if (this.remoteURL) this.loadRemote(proceed, this);
         else proceed();
     },
     prev: function (callback) {
         if (this.current > 0) this.go(this.current - 1, callback);
     },
     next: function (callback) {
         if (this.current < this.pageCount - 1) this.go(this.current + 1, callback);
     },
     /**
      * @function load
      * @param {Array|String} [arrayOrUrl] The array or the remote URL
      * @param {Function} [callback] Will be called with argument 'null' on success, or the error object on error
      */
     load: function (arrayOrUrl, callback) {
         this.current = 0;
         this.contents = undefined;
         if (typeof arrayOrUrl === "string") {
             this.remoteURL = arrayOrUrl;
             this.init = true;
             this.loadRemote(callback);
             this.go(0);
         } else if (arrayOrUrl instanceof Array) {
             this.init = true;
             this.loadFromArray(arrayOrUrl, callback);
             this.go(0);
         } else {
             throw new Error('Must specify an array or a string at creation');
         }
     }
 };

 extend(Pagination.prototype, EventListener.prototype);

 /**
  * @function getPagesRange
  * @param {Pagination} pag The pagination Object
  * @return {Array} [0, 1, 2, -1, 7, 8, 9, -1, 15, 16, 17]
  */
 function getPagesRange(pag) {
     var ret = [];
     var l1 = 0, u1 = Math.min(pag.options.dispRange, pag.pageCount);
     var l2 = Math.max(pag.current - pag.options.dispRange, 0), u2 = Math.min(Math.min(pag.current + pag.options.dispRange + 1, pag.itemCount), pag.pageCount);
     var l3 = Math.max(pag.pageCount - pag.options.dispRange, 0), u3 = pag.pageCount;
     for (var i = l1; i < u1; ++i) ret.push(i);
     if (u1 < l2) ret.push(-1);
     for (var i = Math.max(u1, l2); i < u2; ++i) ret.push(i);
     if (u2 < l3) ret.push(-1);
     for (var i = Math.max(u2, l3); i < u3; ++i) ret.push(i);
     return ret;
 }

 /**
  * @function getSinglePageRange
  * @param {Pagination} paginationObject The parent Object
  * @return {JSON Object} { begin: [begin value], end: [end value] }
  */
 function getSinglePageRange(paginationObject) {
     return {
         begin: paginationObject.options.perPage * paginationObject.current,
         end: Math.min(paginationObject.options.perPage * (paginationObject.current + 1), paginationObject.itemCount)
     };
 }

 window.Pagination = Pagination;
})(window, document);

