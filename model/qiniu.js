/**
 * Function Upload
 * @type {function} callback(err, hash, key, persistentId)
 * @param {String} localFile local file path
 * @param {String} remoteFile remote file name
 *
 * Function Delete
 * @type {function} callback(err)
 * @param {String} remoteFile remote file name
 *
 * Function exists
 * @type {function} callback(err, doc)
 * @param {String} remoteFile remote file name
 */

var qiniu = require("qiniu");

qiniu.conf.ACCESS_KEY = 'lNBe_bGux3rwY3cVvkP_VK2oRr4Ok_d2y1oCzmOL';
qiniu.conf.SECRET_KEY = 'aOO060vhprVuSKelKfNqp2mRFHR5AxUBmJ8de_RK';

bucket = 'acgsheet';

function uptoken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
    return putPolicy.token();
}

function uploadFile(uptoken, key, localFile, callback) {
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
            callback(null, ret.hash, ret.key, ret.persistentId);       
        } else {
            callback(err);
        }
    });
}

module.exports = {
    upload: function(localFile, remoteFile, callback) {
        var key = remoteFile, filePath = localFile, token = uptoken(bucket, key);
        uploadFile(token, key, filePath, callback);
    }, 
    delete: function(remoteFile, callback) {
        var client = new qiniu.rs.Client();
        client.remove(bucket, remoteFile, function(err) {
            callback(err);
        });
    },
    exists: function(remoteFile, callback) {
        var client = new qiniu.rs.Client();
        client.stat(bucket, remoteFile, function(err, ret) {
            callback(err, ret);
        });
    }
};

