'use strict';

/**
 * 按DOM选择器规则处理文档
 * @author tvrcgo
 * @since 2015/11
 */

var cheerio = require('cheerio');
var $;

function query(rule) {

    return function(body, next){
        try {
            var dom = cheerio.load(body);
            $ = dom;
            next(proc(dom, rule));
        } catch (e) {
            next(e);
        }
    }
}

function proc(dom, rule){

    var match;
    if ( rule.select ) {
        match = (typeof dom == 'function') ? dom(rule.select) : dom.find(rule.select);
    }
    else {
        match = dom;
    }

    // multi rules
    if ( rule instanceof Array && rule.length ) {
        return rule.map(function(r, idx){
            var ret = proc.call(this, match, r);
            if (ret) return ret;
        });
    }

    // loop
    if ( rule.each ) {
        return match.map(function(idx, elem) {
            var ret = proc.call(this, $(elem), rule.each);
            if (ret && ret instanceof Array) return [ret];
            else return ret;
        }).get();
    }

    // index value
    if ( rule.index ) {
        return match.map(function(idx, elem){
            if ( rule.index.indexOf(idx)>=0 ) {
                return val(elem, rule);
            }
        }).get();
    }

    // single value
    return val(match, rule);

}

function val(match, rule) {

    var val = {};

    // default: return text
    if ( !rule.value && !rule.attr ) {
        return match.text();
    }

    // value
    switch (rule.value) {
        case 'html':
            val[rule.value] = match.html();
            break;
        case 'text':
            val[rule.value] = match.text();
            break;
        default:
    }

    // attributes
    if ( rule.attr ) {
        if ( typeof rule.attr === 'array' ) {
            for ( var att of rule.attr ) {
                val[att] = match.attr(att) || '';
            }
        }
        else {
            val[rule.attr] = match.attr(rule.attr) || '';
        }
    }

    return val;
}


module.exports = query;
