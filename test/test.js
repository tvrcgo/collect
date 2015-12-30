
var expect = require('chai').expect;
var fs = require('fs');
var collect = require('../index.js');

describe('collect', function(){

    this.timeout(1000*20);

    it('Fetch content', function(done){
        collect.src('http://www.qq.com')
            .use(function(data){
                expect(data).to.be.ok;
                done();
            })
    })

    it('Dest file', function(done){

        var file = 'body.txt';

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        collect.src('http://www.baidu.com')
            .dest(file);

        fs.exists(file, function(exist){
            expect(exist).to.be.ok;
            done();
            fs.unlinkSync(file);
        })
    })

    it('Fetch ajax page', function(done){
        this.timeout(20000);
        collect.src('http://www.cnbeta.com', { javascript: true, delay: 1000*3, timeout: 15000 })
            .use(collect.query({
                ids: ".items_area .item@id"
            }))
            .use(function(data, next){
                expect(data.ids).to.have.length.above(100);
                expect(data.ids[0]).to.be.ok;
                done();
            })
    })

})

describe('collect.query', function(){

    this.timeout(5000);

    it('Select element', function(done){

        collect.src('http://www.baidu.com')
            .use(collect.query({
                src: '#lg img@src'
            }))
            .use(function(data){
                expect(data.src).to.be.ok;
                done();
            })
    })

    it('Each: select', function(done){

        collect.src('http://www.houzz.com/photos')
            .use(collect.query({
                imgs: '.rightSideContent .content-row .imageArea img@src',
            }))
            .use(function(data){
                expect(data.imgs).to.have.length.above(5);
                expect(data.imgs[0]).to.be.ok;
                done();
            })

    })

    it('Each: multi selects', function(done){

        collect.src('http://movie.douban.com/later/guangzhou/')
            .use(collect.query({
                movies: ['#showing-soon .item', 'h3 a, h3 a@href, .thumb img@src']
            }))
            .use(function(data){
                expect(data.movies).to.have.length.above(15);
                expect(data.movies[0]).to.have.length(3);
                expect(data.movies[0][0]).to.not.equal(data.movies[0][1]);
                done();
            })
    })

})
