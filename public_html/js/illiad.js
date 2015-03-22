/* 
 * The MIT License
 *
 * Copyright 2014 Long.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * IllDownGrid
 * 
 * Download from MongoDB's grid collection asynchronously, results
 * are handled with callbacks.
 * 
 * @param {String} db
 * @param {String} user
 * @param {String} pwd
 * @param {String} gridCol e.g. data
 * @param {String} filename
 * @param {function} cb_done
 * @param {function} cb_fail
 * @returns {none}
 */
var IllDownGrid = function(db, user, pwd, gridCol, filename, cb_done, cb_fail){
    var queryString = $.param({'user':user, 'passwd': pwd, 'filename': filename});
    
    $.ajax({
        url: 'https://acoustic.ifp.illinois.edu:8081/gridfs/'+db+'/'+gridCol+'?'+queryString,
        type:'GET',
        dataType :'arraybuffer',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        console.log(data.byteLength);
        cb_done(data);
    }).fail(function(){
        console.log('ajax fail');
        cb_fail();
    });
    
    /*
    var request = new XMLHttpRequest();
    request.open('GET', 'https://acoustic.ifp.illinois.edu:8081/gridfs/'+db+'/data?'+queryString, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        var data = request.response;
        console.log(data.byteLength);
        cb(data);
    };
    request.send();
    */
};

/**
 * IllDownCol
 * 
 * Download from MongoDB's collection asynchronously, results
 * are handled with callbacks
 * 
 * @param {String} db
 * @param {String} user
 * @param {String} pwd
 * @param {String} col e.g. event
 * @param {String} filename
 * @param {function} cb_done
 * @param {function} cb_fail
 * @returns {none}
 */
var IllDownCol = function(db, user, pwd, col, filename, cb_done, cb_fail){
    var queryString = $.param({'dbname':db, 'colname':col, 'user':user, 'passwd': pwd});
    
    $.ajax({
        url: 'https://acoustic.ifp.illinois.edu:8081/query?'+queryString,
        type:'POST',
        data: '{filename:"'+filename+'"}',
        dataType: 'text',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        var event = JSON.parse(data);
        console.log(event[0].filename);
        cb_done(event);
    }).fail(function(){
        console.log('ajax fail');
        cb_fail();
    });
};

/**
 * 
 * IllUpdateCol
 * 
 * Update an item in MongoDB's collection asynchronously.
 * 
 * @param {String} db
 * @param {String} user
 * @param {String} pwd
 * @param {String} col e.g. event
 * @param {String} filename
 * @param {String} op MongoDB operations
 * @param {String} field the field to update
 * @returns {none}
 */
var IllUpdateCol = function(db, user, pwd, col, filename, op, field){
    var queryString = $.param({'dbname':db, 'colname':col, 'user':user, 'passwd': pwd});
    
    $.ajax({
        url: 'https://acoustic.ifp.illinois.edu:8081/write?'+queryString,
        type:'POST',
        data: '{filename:"'+filename+'"}\n{$'+op+':'+field+'}',
        dataType: 'text',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        console.log(data);
    }).fail(function(){
        console.log('ajax fail');
    });
};

/**
 * IllQueryCol
 * 
 * Query a MongoDB's collection asynchronously, results
 * are handled with callbacks
 * 
 * @param {String} db
 * @param {String} user
 * @param {String} pwd
 * @param {String} col
 * @param {String} q
 * @param {function} cb_done
 * @param {function} cb_fail
 * @returns {none}
 */
var IllQueryCol = function (db, user, pwd, col, q, cb_done, cb_fail){
    //var tZoneOffset = 5/24;
    var earthRad = 3959; // miles
    
    // Construct the query string
    var params = {'dbname':db, 'colname': col, 'user': user, 'passwd': pwd};
    if (q.hasOwnProperty('limit')){
        params.limit = q.limit;
    }
    var queryString = $.param(params);
    var timeDat, freqDat, durDat, lnpDat, locDat, kwDat;
    
    // Construct the query data to send
    if (q.hasOwnProperty('t1') && q.hasOwnProperty('t2')){
        timeDat = '{recordDate:{$gte:{$date:"'+ q.t1+'"}, $lte:{$date:"'+q.t2+'"}}}';
    }
    else if (q.hasOwnProperty('t1')){
        timeDat = '{recordDate:{$gte:{$date:"'+ q.t1+'"}}}';
    }
    else if (q.hasOwnProperty('t2')){
        timeDat = '{recordDate:{$lte:{$date:"'+ q.t2+'"}}}';
    }
    
    if (q.hasOwnProperty('f1') && q.hasOwnProperty('f2')){
        freqDat = ',{minFreq:{$gte:'+q.f1+'}},{maxFreq:{$lte:'+q.f2+'}}';
    }
    else if (q.hasOwnProperty('f1')){
        freqDat = ',{minFreq:{$gte:'+q.f1+'}}';
    }else if (q.hasOwnProperty('f2')){
        freqDat = ',{maxFreq:{$lte:'+q.f2+'}}';
    }else{
        freqDat = '';
    }
    
    if (q.hasOwnProperty('dur1') && q.hasOwnProperty('dur2')){
        durDat = ',{duration:{$gte:'+q.dur1+', $lte:'+q.dur2+'}}';
    }
    else if (q.hasOwnProperty('dur1')){
        durDat = ',{duration:{$gte:'+q.dur1+'}}';
    }
    else if (q.hasOwnProperty('dur2')){
        durDat = ',{duration:{$lte:'+q.dur2+'}}';
    }
    else{
        durDat = '';
    }
    
    if (q.hasOwnProperty('lnp1') && q.hasOwnProperty('lnp2')){
        lnpDat = ',{logProb:{$gte:'+q.lnp1+', $lte:'+q.lnp2+'}}';
    }
    else if (q.hasOwnProperty('lnp1')){
        lnpDat = ',{logProb:{$gte:'+q.lnp1+'}}';
    }
    else if (q.hasOwnProperty('lnp2')){
        lnpDat = ',{logProb:{$lte:'+q.lnp2+'}}';
    }
    else{
        lnpDat = '';
    }
    
    if (q.hasOwnProperty('loc') && q.hasOwnProperty('rad')){
        locDat = ',{location:{$geoWithin:{$centerSphere:[['+q.loc[1]+','+q.loc[0]+'], '+q.rad/earthRad+']}}}';
    }else{
        locDat = '';
    }
    
    if (q.hasOwnProperty('kw')){
        kwDat = ',{$text: {$search:"'+q.kw+'"}}';
    }else{
        kwDat = '';
    }
    
    // FIX: memcached key is too long
    var postDat = '{$and:['+timeDat+freqDat+durDat+lnpDat+locDat+kwDat+']}';
    
    $.ajax({
        url: 'https://acoustic.ifp.illinois.edu:8081/query?'+queryString,
        type:'POST',
        data: postDat,
        dataType: 'text',
        timeOut: 10000
    }).done(function(data){
        var events = JSON.parse(data);
        cb_done(events);
    }).fail(function(){
        console.log('ajax fail');
        cb_fail();
    });
};