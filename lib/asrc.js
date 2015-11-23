'use strict';

var webpage = require('webpage'),
    args = require('system').args,
    page = webpage.create(),
    exitTimer = null,
    exitDelay = 1000*5;

page.settings = {
    javascriptEnabled: true,
    loadImages: false,
    resourceTimeout: exitDelay,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36"
};

page.onResourceRequested = function(req){
    // console.log('[req]', req.url);
    wait.call(this);
}

page.onResourceReceived = function(res){
    if (res.stage == 'end') {
        // console.log('[res]', res.status, res.url);
        wait.call(this);
    }
}

function open(url, delay){

    page.open(url, function(status){
        if (status == 'success') {
            wait.call(this);
        }
        else {
            console.log(status);
            phantom.exit();
        }
    })
}

function wait(){

    page.evaluate(function(){
        // Scroll to bottom of page.
        if (window && document && document.body) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });

    clearTimeout(exitTimer);
    exitTimer = setTimeout(function(){
        // dump page content to stdout stream.
        console.log(page.content);
        phantom.exit();
    }, exitDelay);

}

if (args.length>1) {
    var url = args[1],
        delay = args[2];

    if (delay) {
        exitDelay = ~~delay;
    }

    if (url) {
        open.call(this, url);
    }
}
