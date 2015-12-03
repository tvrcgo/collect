'use strict';

var webpage = require('webpage'),
    args = require('system').args,
    page = webpage.create(),
    exitTimer = null,
    exitDelay = 1000*3,
    pageTimeout = 1000*10,
    startTime = 0;

page.settings = {
    javascriptEnabled: true,
    loadImages: false,
    resourceTimeout: exitDelay,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36"
};

page.onResourceRequested = function(data, req){
    if (abortResourceRequest(data.url)) {
        req.abort();
    }
    else {
        wait.call(this);
    }
}

page.onResourceReceived = function(res){
    if (res.stage == 'end' && res.status == 200 && /(json|javascript|html)/g.test(res.contentType)) {
        wait.call(this);
    }
}

page.onError = function(msg, trace){
    //
}

function open(url){

    try {
        startTime = +new Date;
        page.open(url, function(status){
            if (status == 'success') {
                wait.call(this);
            }
            else {
                phantom.exit();
            }
        })
    } catch (e) {
        phantom.exit();
    }
}

function wait(){

    page.evaluate(function(){
        // Scroll to bottom of page.
        if (window && document && document.body) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    // src global timeout.
    if ((+new Date) - startTime > pageTimeout) {
        exitDelay = 0;
    }

    clearTimeout(exitTimer);
    exitTimer = setTimeout(function(){
        // dump page content to stdout stream.
        console.log("PHANTOM_ECHO")
        console.log(page.content);
        console.log("PHANTOM_ECHO")
        phantom.exit();
    }, exitDelay);

}

function abortResourceRequest(url) {
    var abort = false;
    abort = abort || /\.(css|jpg|png|gif|ttf|svg)(\?|#)?/.test(url);
    abort = abort || /(cb\.baidu|eclick\.baidu|pos\.baidu|simba\.taobao|p\.tanx|x\.jd)\.com/.test(url);
    abort = abort || /(doubleclick|googleads|googlesyndication)/.test(url);
    return abort;
}

if (args.length>1) {
    var url = args[1],
        delay = args[2],
        timeout = args[3];

    if (delay) {
        exitDelay = ~~delay;
    }

    if (timeout) {
        pageTimeout = ~~timeout;
    }

    if (url) {
        open.call(this, url);
    }
}
