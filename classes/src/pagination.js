(function(window, document, undefined) {'use strict';
 function Pagination(opt) {
     this.defaults = {
         offset: 5
     };

     this.options = {};
     extend(this.options, this.defaults, opt);
 }

 window.Pagination = Pagination;
})(window, document);
