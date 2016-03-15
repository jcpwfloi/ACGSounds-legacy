(function(window, document, undefined) {'use strict';
 function Pagination(opt, data) {
     /**
      * Pagination is a library providing paging methods for ACGSounds
      * Author
      *     @arcGravitus
      * Dependencies:
      *     jQuery
      *
      * @param [opts]
      * @param {Number} [opts.offset] 
      * @param {Number} [opts.perPage]
      * @param {Number} [opts.current]
      * @param {Boolean} [opts.remote]
      * @param {Function|false} [opts.render]
      * @param {Function|false} [opts.csrf]
      * @param {JSON Object} [opts.postParam]
      * @constructor
      */
     this.defaults = {
         offset: 5, //offset
         perPage: 10,
         remote: false,
         csrf: function() {
             return $('meta[name=csrf-token]').attr('content');
         },
         postParam: {},
         render: function(num, active) {
             return '<li class="wave-effect{1}">{0}</div>'.format(num, active ? ' active': '');
         }
     };

     this.options = {};

     extend(this.options, this.defaults, opt);
 }

 Pagination.prototype = {
     /**
      * Load Data from remote URL by POST API
      * @param {String} url Remote URL
      */
     getRemoteData: function(callback) {
         var data = {
             page: this.current
         };
         if (typeof this.options.csrf === "function") data._csrf = csrf();
         extend(data, this.options.postParam);
         $.post(this.remoteURL, data, function(res) {
             this.total = total;
             if (typeof callback === "function") callback(null, res.data);
         }, "json").onerror(function(e) {
             if (typeof callback === "function") callback(e, null);
         });;
     },
     getLocalData: function(callback) {
         var page = getNum(this);
         callback(null, this.data.slice(page.begin, page.end));
     },
     getData: function(callback) {
         if (!this.init) throw new Error('Pagination not Initialized');
         if (this.remote) getRemoteData(callback);
         else getLocalData(callback);
     },
     /**
      * Load Data locally
      */
     localLoad: function(data, callback) {
         this.data = data;
         this.current = 1;
         this.total = data.length / this.options.perPage;
         if (typeof callback === "function") callback();
     },
     page: function(num, callback) {
         this.current = num;
         getData(function(err, doc) {
             if (typeof callback === "function") {
                 callback(err, doc, this.render());
             }
         });
     },
     load: function(data, callback) {
         if (this.options.remote) {
             if (typeof data !== "string") throw new Error('Remote URL not specified');
             this.remoteURL = data;
             this.init = true;
             if (typeof callback === "function") callback();
         } else {
             if (typeof data !== "array") throw new Error('Please specify a local array as data');
             this.init = true;
             localLoad(data, callback);
         }
     },
     render: function() {
         var page = getNum(this);
         return internalRender(page.begin, page.end, this.current, this);
     }
 };

 /**
  * @function internalRender
  * @param {Number} [begin] The beginning of the page number
  * @param {Number} [end] The ending + 1 of the page number
  * @param {Number} [current] The current Page number
  * @param {Pagination} [paginationObject] The parent Object
  */
 function internalRender(begin, end, current, paginationObject) {
     var str = "";
     for (var i = begin; i < end; ++ i) {
         str += this.options.render(i, current == i);
     }
     return str;
 }

 /**
  * @function getNum
  * @param {Pagination} paginationObject The parent Object
  * @return {JSON Object} { begin: [begin value], end: [end value] }
  */
 function getNum(paginationObject) {
     return {
         begin: paginationObject.options.perPage * (paginationObject.current - 1),
         end: paginationObject.options.perPage * paginationObject.current
     };
 }

 window.Pagination = Pagination;
})(window, document);

