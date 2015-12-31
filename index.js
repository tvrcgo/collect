'use strict';

var Transform = require('stream').Transform;
var request = require('request');
var fs = require('fs');
var phantomjs = require('phantomjs');
var proc = require('child_process');

/**
 * Collect
 */
function Collect(filter, reject) {
    // new instance
    if( !(this instanceof Collect)) {
        return new Collect(filter);
    }
    // buffer
    this._data = [];

    // default filter
    filter = filter || function(chunk, next){
        next(chunk);
    };

    // inherits _transform
    this._transform = function(chunk, enc, done) {
        if (chunk instanceof Buffer) {
            this._data.push(chunk);
        }
        else {
            try {
                filter.call(this, chunk, function(obj){
                    this.push(obj);
                }.bind(this))
            }
            catch(err) {
                reject && reject(err);
            }
        }
        done();
    };

    // inherits _flush
    this._flush = function(done){
        if (this._data.length) {
            try {
                filter.call(this, { content: Buffer.concat(this._data).toString() }, function(obj){
                    this.push(obj);
                    done();
                }.bind(this));
            }
            catch(err) {
                reject && reject(err);
                done();
            }
        }
        else {
            done();
        }
    };

    Transform.call(this, { objectMode:true });
}

/**
 * 继承 Transform
 */
Object.setPrototypeOf(Collect.prototype, Transform.prototype);

/**
 * 处理数据
 * @param  {function} 处理函数
 * @return {stream}    Collect实例
 */
Collect.prototype.use = function(mw){
    if (typeof mw === 'function') {
        return this.pipe(Collect(mw));
    }
    return this;
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
        return child.stdout.pipe(Collect(function(data, next){
            if (data && data.content) {
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
    return request(params).on('error', function(err){
        console.error('[collect.src]', err);
    }).pipe(Collect());
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
    this.pipe(Collect(function(data, next){
        if (data && data.content) {
            next(data.content);
        }
        else if (data instanceof String || data instanceof Buffer) {
            next(data);
        }
    })).pipe(dest);
}

Collect.query = require('./lib/query');

/**
* 选择元素
* @param  {array} selectors
* @return {object} collect object.
*/
Collect.prototype.query = function(selectors){
    return this.use(Collect.query(selectors))
};

module.exports = Collect;
