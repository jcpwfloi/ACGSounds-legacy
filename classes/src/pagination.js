(function(window, document, undefined) {'use strict';
 function Pagination(opt, data) {
     /**
      * Pagination is a library providing paging methods for ACGSounds
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
         postParam: {}
     };

     this.options = {};

     extend(this.options, this.defaults, opt);

     this.init = function() {
         if (!this.remote) {
             if (typeof data === "Array") {
                 this.localData = data;
             } else throw new Error('Please Specify local Data in Array. (Usage: new Pagination(opts, data))');

             this.total = Math.floor(this.localData.length / this.options.perPage);
         }
         this.current = 1;
     }

     this.init();
 }

 Pagination.prototype = {
     /**
      * Load Data from remote URL by POST API
      * @param {String} options.url Remote URL
      */
     remoteLoad: function() {
         if (!this.options.url)
             throw new Error('No Remote URL Specified');
         var data = {
             page: current
         };
         if (typeof this.options.csrf === "function") data._csrf = csrf();
         extend(data, this.options.postParam);
         $.post(this.options.url, data, function(res) {
             this.total = total;
             callback(null, res.data);
         }, "json").onerror(function(e) {
             callback(e);
         });;
     },
     /**
      * Load Data locally
      */
     localLoad: function(callback) {
         callback(null, this.localData.slice((this.current - 1) * this.options.perPage), this.current * this.options.perPage - 1);
     },
     load: function(callback) {
         if (this.options.remote)
             remoteLoad(callback);
         else
             localLoad(callback);
     },
     renderView: function() {
     }
 };

 window.Pagination = Pagination;
})(window, document);

