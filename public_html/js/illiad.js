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

var IllDownData = function(db, user, pwd, filename, cb){
    var queryString = $.param({'user':user, 'passwd': pwd, 'filename': filename});
    
    $.ajax({
        url: 'https://acoustic.ifp.uiuc.edu:8081/gridfs/'+db+'/data?'+queryString,
        type:'GET',
        dataType :'arraybuffer',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        console.log('IllDownData ' + data.byteLength);
        cb(data);
    }).fail(function(){
        console.log('ajax fail');
    });
    
    /*
    var request = new XMLHttpRequest();
    request.open('GET', 'https://acoustic.ifp.uiuc.edu:8081/gridfs/'+db+'/data?'+queryString, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        var data = request.response;
        console.log(data.byteLength);
        cb(data);
    };
    request.send();
    */
};

var IllDownEvent = function(db, user, pwd, filename, cb){
    var queryString = $.param({'dbname':db, 'colname':'event', 'user':user, 'passwd': pwd});
    
    $.ajax({
        url: 'https://acoustic.ifp.uiuc.edu:8081/query?'+queryString,
        data: '{filename:"'+filename+'"}',
        type:'POST',
        dataType: 'text',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        var event = JSON.parse(data);
        console.log('IllDownEvent ' + event[0].filename);
        cb(event);
    }).fail(function(){
        console.log('ajax fail');
    });
};

var IllUpdateField = function(db, user, pwd, filename, op, field){
    var queryString = $.param({'dbname':db, 'colname':'event', 'user':user, 'passwd': pwd});
    
    $.ajax({
        url: 'https://acoustic.ifp.uiuc.edu:8081/write?'+queryString,
        data: '{filename:"'+filename+'"}\n{$'+op+':'+field+'}',
        type:'POST',
        dataType: 'text',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        console.log('IllUpdateField ' + data);
    }).fail(function(){
        console.log('ajax fail');
    });
};

var IllQuery = function (db, user, pwd, q, cb){
    //var tZoneOffset = 5/24;
    
    // Construct the query string
    var params = {'dbname':db, 'colname': 'event', 'user': user, 'passwd': pwd};
    if (q.hasOwnProperty('limit')){
        params.limit = q.limit;
    }
    var queryString = $.param(params);
    
    // Construct the query data to send
    if (q.hasOwnProperty('t1') && q.hasOwnProperty('t2')){
        timeDat = '{recordDate:{$gte:{$date:"'+ q.t1+'"}, $lte:{$date:"'+q.t2+'"}}}';
    }
    else if (q.hasOwnProperty('t1')){
        timeDat = '{recordDate:{$gte:{$date:"'+ q.t1+'"}}}';
    }
    
    if (q.hasOwnProperty('f1') && q.hasOwnProperty('f2')){
        freqDat = ',{minFreq:{$gte:'+q.f1+'}},{maxFreq:{$lte:'+q.f2+'}}';
    }
    else if (q.hasOwnProperty('f1')){
        freqDat = ',{minFreq:{$gte:'+q.f1+'}}';
    }else{
        freqDat = '';
    }
    
    if (q.hasOwnProperty('loc') && q.hasOwnProperty('rad')){
        locDat = ',{location:{$geoWithin:{$centerSphere:[['+q.loc[1]+','+q.loc[0]+'], '+q.rad+']}}}';
    }else{
        locDat = '';
    }
    
    if (q.hasOwnProperty('kw')){
        kwDat = ',{transcript:"'+q.kw+'"}';
    }else{
        kwDat = '';
    }
    
    // FIX: memcached key is too long
    postDat = '{$and:['+timeDat+freqDat+locDat+kwDat+']}';
    
    $.ajax({
        url: 'https://acoustic.ifp.uiuc.edu:8081/query?'+queryString,
        data: postDat,
        type:'POST',
        dataType: 'text',
        timeOut: 10000
    }).done(function(data){
        file = JSON.parse(data);
        cb(file);
    }).fail(function(){
        console.log('ajax fail');
    });
};