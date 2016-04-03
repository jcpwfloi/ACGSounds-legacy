(function(window, document, undefined) {'use strict';
 function MessageToaster(opts) {
     EventListener.call(this);

     this.options = {};

     this.defaults = {
         defaultTime: 3000,
         defaultStyle: 'rounded'
     };

     extend(this.options, this.defaults, opts);
 }

 MessageToaster.prototype = {
 };

 extend(MessageToaster.prototype, EventListener.prototype);

 window.MessageToaster = MessageToaster;
})(window, document)

