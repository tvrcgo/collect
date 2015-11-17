
var assert = require('assert');
var collect = require('../index.js');

describe('collect', function(){

    it('each: select', function(done){

        collect.src('http://www.houzz.com/photos')
            .use(collect.rule({
                select: '.rightSideContent .content-row',
                each: {
                    select: '.imageArea img',
                    attr: 'src'
                }
            }))
            .use(function(data){
                assert.equal(data.length, 9);
                done();
            })

    })

    it('each: multi selects', function(done){

        collect.src('http://movie.douban.com/later/guangzhou/')
            .use(collect.rule({
                select: '#showing-soon .item',
                each: [
                    {
                        select: 'h3 a',
                        value: 'text',
                        attr: 'href'
                    },
                    {
                        select: '.thumb img',
                        attr: 'src'
                    }
                ]
            }))
            .use(function(data){
                assert.equal(data.length, 20);
                done();
            })
    })
})
