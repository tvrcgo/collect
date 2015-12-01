'use strict';

var webpage = require('webpage'),
    args = require('system').args,
    page = webpage.create(),
    exitTimer = null,
    exitDelay = 1000*5,
    pageTimeout = 1000*15,
    startTime = 0;

page.settings = {
    javascriptEnabled: true,
    loadImages: false,
    resourceTimeout: exitDelay,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36"
};

page.onResourceRequested = function(req){
    wait.call(this);
}

page.onResourceReceived = function(res){
    wait.call(this);
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
        console.log(e);
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
        exitDelay = 1;
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
