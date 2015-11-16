'use strict';

var util = require('util');
var Transform = require('stream').Transform;
var request = require('request');
var cheerio = request('cheerio');

function Collect() {
    if( !(this instanceof Collect)) {
        return new Collect;
    }
    this._middleware = [];
    this._data = [];
    Transform.call(this);
}

util.inherits(Collect, Transform);

Collect.prototype._transform = function(chunk, encoding, done){
    this._data.push(chunk);
}

Collect.prototype._flush = function(done){
    var i=0;
    var mws = this._middleware;
    var mw = mws[i];
    while(i<mws.length) {
        mw.call(this, mw[++i]);
    }
}

Collect.src = function(url){
    var co = new this.constructor;
    request(url).pipe(co);
    return co;
}

Collect.prototype.use = function(mw){
    this._middleware.push(mw);
    return this;
}
