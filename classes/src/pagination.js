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
      * @param {JSON Object} [opts.postParam]
      * @param {Function} [opts.pageButton]
      * @param {Function} [opts.prevButton]
      * @param {Function} [opts.nextButton]
      * @param {Function} [opts.contentRenderer]
      * @constructor
      */
     this.defaults = {
         dispRange: 5,
         perPage: 4,
         remote: false,
         postParam: {},
         pageButton: function (num, active) {
             //return '<li class="wave-effect{1}">{0}</div>'.format(num + 1, active ? ' active': '');
         },
         prevButton: function (num, disabled) {
         },
         nextButton: function (num, disabled) {
         },
         contentRenderer: function (num, ctnt) {
         },
         contentClearer: function () {
         }
     };

     this.options = {};

     extend(this.options, this.defaults, opt);
 }

 Pagination.prototype = {
     /**
      * Load Data from remote URL by POST API
      * @param {Function} [callback] Will be called with argument 'null' on success, or the error object on error
      */
     /*loadRemote: function (callback) {
         var data = {
             page: this.current
         };
         extend(data, this.options.postParam);
         $.post(this.remoteURL, data, function (res) {
             if (typeof callback === "function") callback(null);
             renderAll();
         }, "json").onerror(function (e) {
             if (typeof callback === "function") callback(e);
         });;
     },*/
     loadFromArray: function (arr, callback) {
         this.contents = arr;
         this.current = 0;
         this.pageCount = Math.ceil(arr.length / this.options.perPage);
         this.go(0);
         if (typeof callback === "function") callback(null);
     },
     go: function (num, callback) {
         this.current = num;
         this.options.contentClearer();
         var rg = getPageRange(this);
         for (var i = rg.begin; i < rg.end; ++i) {
             this.options.contentRenderer(i, this.contents[i]);
         }
     },
     prev: function (callback) {
         if (this.current > 0) this.page(this.current - 1, num);
     },
     next: function (callback) {
         if (this.current < this.pageCount - 1) this.page(this.current + 1, num);
     },
     /**
      * @function load
      * @param {Array|String} [arrayOrUrl] The array or the remote URL
      * @param {Function} [callback] Will be called with argument 'null' on success, or the error object on error
      */
     load: function (arrayOrUrl, callback) {
         if (typeof arrayOrUrl === "string") {
             this.remoteURL = arrayOrUrl;
             this.init = true;
             this.loadRemote(callback);
         } else if (arrayOrUrl instanceof Array) {
             this.init = true;
             this.loadFromArray(arrayOrUrl, callback);
         } else {
             throw new Error('Must specify an array or a string at creation');
         }
     }
 };

 /**
  * @function getPageRange
  * @param {Pagination} paginationObject The parent Object
  * @return {JSON Object} { begin: [begin value], end: [end value] }
  */
 function getPageRange(paginationObject) {
     return {
         begin: paginationObject.options.perPage * paginationObject.current,
         end: Math.min(paginationObject.options.perPage * (paginationObject.current + 1), paginationObject.pageCount)
     };
 }

 window.Pagination = Pagination;
})(window, document);

