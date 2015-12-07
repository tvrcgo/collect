'use strict';

var Transform = require('stream').Transform;
var request = require('request');
var fs = require('fs');
var phantomjs = require('phantomjs');
var proc = require('child_process');

/**
 * Collect
 */
function Collect(transform, flush) {
    if( !(this instanceof Collect)) {
        return new Collect(transform, flush);
    }
    this._data = [];
    // inherits _transform
    this._transform = transform || function(chunk, enc, done) {
        if (chunk instanceof Buffer) {
            this._data.push(chunk);
        }
        else {
            this.push(chunk);
        }
        done();
    };
    // inherits _flush
    this._flush = flush || function(done){
        if (this._data.length) {
            this.push({ content:this._data.toString() });
        }
        done();
    };

    Transform.call(this, { objectMode:true });
}

/**
 * 继承 Transform
 * @param {Object} Collect.prototype
 * @param {Object} Transform.prototype
 */
Object.setPrototypeOf(Collect.prototype, Transform.prototype);

/**
 * 处理数据
 * @param  {function} 处理函数
 * @return {stream}    Collect实例
 */
Collect.prototype.use = function(mw){
    if (mw instanceof Collect) {
        return this.pipe(mw);
    }

    if (typeof mw === 'function') {
        return this.pipe(Collect(function(obj, enc, callback){
            try {
                mw.call(this, obj, function(tarObj){
                    callback.call(this, null, tarObj);
                });
            }
            catch(err) {
                throw err;
            }
        }))
    }
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
    // Fetch page content with ajax.
    if (opts.javascript) {
        var delay = opts.delay || 3000;
        var timeout = opts.timeout || 10*1000;
        var child = proc.spawn(phantomjs.path, [ __dirname + "/lib/asrc.js", url, delay, timeout ]);
        // filter phantom_echo content
        return child.stdout.pipe(Collect().use(function(data, next){
            if (data) {
                data.content = data.content.split('PHANTOM_ECHO')[1];
                next(data);
            }
            else {
                throw new Error('asrc no data.');
            }
        }));
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
        gzip: true,
        timeout: opts.timeout || 10*1000
    };
    // Set cookie
    if (opts.cookie) {
        var j = request.jar();
        var cookie = request.cookie(opts.cookie);
        j.setCookie(cookie, url);
        params.jar = j;
    }
    return request(params).pipe(Collect());
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

Collect.query = require('./lib/query');

module.exports = Collect;
