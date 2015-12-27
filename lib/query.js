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
    var setter = function(selector, context){
        // *[] -> *:nth-child()
        selector = selector.replace(/\[(\d+)\]/g, ':nth-child($1)');
        // *@attr -> *.getAttribute(attr)
        var attr = selector.match(/@([\w_\-]+)/g);
        selector = selector.replace(/@[\w]+/g, '');
        var elem = context ? $(context).find(selector) : $(selector);
        if (attr) {
            attr = attr[0].substring(1);
            if (elem.length>1) {
                $(elem).each(function(i, e){
                    e._attr = attr;
                })
            }
            else {
                elem._attr = attr;
            }
        }

        return elem;
    };

    selectors.forEach(function(selector){

        if (data) {
            if (data.length == 1) {
                data = setter(selector, data);
            }
            else if (data.length > 1) {
                data = $(data).map(function(i, item){
                    if (/,/.test(selector)) {
                        return [selector.split(',').map(function(sel, i){
                            return setter(sel, item);
                        })];
                    }
                    else {
                        return setter(selector, item);
                    }
                });
            }
        }
        else {
            if (/,/.test(selector)) {
                data = selector.split(',').map(function(sel, i){
                    return setter(sel);
                });
            }
            else {
                data = setter(selector);
            }
        }
    })

    // transform value.
    var val = function(data){
        if (data.length>1) {
            return $(data).map(function(i, item){
                var sub = val(item);
                return sub && sub.length ? [sub] : sub;
            }).get();
        }
        else {
            return data._attr ? $(data).attr(data._attr) : $(data).text().replace(/(^[\s\n]+|[\s\n]+$)/g, '');
        }
    }

    return val(data);
}

module.exports = function(sets){
    return function(body, next){
        try {
            var $ = cheerio.load(body.content);
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
