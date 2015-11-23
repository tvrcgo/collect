'use strict';

var Transform = require('stream').Transform;
var request = require('request');
var fs = require('fs');
var phantomjs = require('phantomjs');
var proc = require('child_process');

/**
 * Collect
 */
function Collect() {
    if( !(this instanceof Collect)) {
        return new Collect;
    }
    this._middleware = [];
    this._data = [];
    Transform.call(this);
}

/**
 * 继承 Transform
 * @param {Object} Collect.prototype
 * @param {Object} Transform.prototype
 */
Object.setPrototypeOf(Collect.prototype, Transform.prototype);

Collect.prototype._transform = function(chunk, encoding, done){
    this._data.push(chunk);
    done();
}

Collect.prototype._flush = function(done){
    // parse body
    var body = this._data.toString();
    // process middlewares
    var next = function(idx){
        idx = idx || 0;
        return function(data){
            if (idx < this._middleware.length) {
                this._middleware[idx].call(this, data, next(++idx))
            }
            else {
                this.push(data);
            }
        }.bind(this);
    }.bind(this);
    // start process.
    next.call(this).call(this, body);

    done();
}

/**
 * 中间件
 * @param  {function} mw 中间件函数
 * @return {stream}    Collect实例
 */
Collect.prototype.use = function(mw){
    if (typeof mw == 'function') {
        this._middleware.push(mw);
    }
    if (mw instanceof this.constructor) {
        this._middleware = this._middleware.concat(mw._middleware);
    }
    return this;
}

/**
 * 处理结果保存到文件
 * @param  {String} filename
 */
Collect.prototype.dest = function(filename, opts) {
    opts = opts || {};
    var dest = fs.createWriteStream(filename, {
        flags: opts.flags || 'a',
        encoding: opts.encoding || 'utf-8'
    });
    this.pipe(dest);
}

/**
 * 获取源数据
 * @param  {String} url
 * @param  {Object} opts
 * @return {stream} Transform stream.
 */
Collect.src = function(url, opts){
    // Options.
    opts = opts || {};
    // Collect instance
    var co = Collect();
    // Fetch page content with ajax.
    if (opts.javascript) {
        var delay = opts.delay;
        var child = proc.spawn(phantomjs.path, [ __dirname + "/lib/asrc.js", url, delay ]);
        return child.stdout.pipe(co);
    }
    // Default user-agent
    var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36';
    // Request params
    var params = {
        url: url,
        headers: {
            'User-Agent': opts.userAgent || UA
        },
        proxy: opts.proxy || '',
        gzip: true
    };
    // Set cookie
    if (opts.cookie) {
        var j = request.jar();
        var cookie = request.cookie(opts.cookie);
        j.setCookie(cookie, url);
        params.jar = j;
    }
    return request(params).pipe(co);
}

Collect.query = require('./lib/query');

module.exports = Collect;
