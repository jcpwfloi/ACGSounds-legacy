var Upyun = require('upyun');

var upyun = new Upyun('acgsheets', 'jcpwfloi', 'czr88159080');

var upyunModule = {
    upload: function(filename, remotePath, callback) {
        upyun.uploadFile(remotePath, filename, '', true, callback);
    },
    delete: function(remotePath, callback) {
        upyun.removeFile(remotePath, callback);
    },
    getUsage: function(callback) {
        upyun.getUsage(callback);
    }
};

module.exports = upyunModule;

