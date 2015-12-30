'use strict';

/**
 * 按DOM选择器规则处理文档
 * @author tvrcgo
 * @since 2015/11
 */

var cheerio = require('cheerio');

/**
 * Collect query
 * @param  {object} $
 * @param  {array} selectors
 */
function query($, selectors) {
    var data = null;
    var assign = function(selector, context){
        // *[] -> *:nth-child()
        selector = selector.replace(/\[(\d+)\]/g, ':nth-child($1)');
        // *@attr -> *.getAttribute(attr)
        var attr = selector.match(/@([\w_\-]+)/g);
        selector = selector.replace(/@[\w]+/g, '');
        attr && (attr = attr[0].substring(1));
        // :html -> *.html()
        var html = selector.match(/:html/g);
        selector = selector.replace(/:html/g, '');

        var elem = context ? $(context).find(selector).get() : $(selector).get();
        return elem.map(function(el){
            if (attr) {
                return $(el).attr(attr);
            }
            if (html) {
                return $(el).html();
            }
            return el;
        });
    };

    var finder = function(selector, context){
        return /,/.test(selector) ? selector.split(',').map(function(sel){
            return assign(sel, context);
        }) : assign(selector, context);
    }

    selectors.forEach(function(selector){
        data = data ? data.map(function(item){
            return finder(selector, item);
        }) : finder(selector);
    })

    var val = function(elem){

        if (!elem || elem.constructor === String) {
            return elem || '';
        }

        if (elem.constructor === Object) {
            return $(elem).text().replace(/(^[\s\n]+|[\s\n]+$)/g, '');
        }

        if (elem.length>1) {
            return elem.map(function(item){
                return val(item);
            });
        }
        else {
            return val(elem[0]);
        }
    };

    return val(data);
}

module.exports = function(sets){
    return function(body, next){
        try {
            var $ = cheerio.load(body.content, { decodeEntities:false });
            Object.keys(sets).forEach(function(key){
                sets[key] = query($, [].concat(sets[key]));
            });
            next(sets);
        } catch (e) {
            console.error(e.stack);
            next({});
        }
    }
};
