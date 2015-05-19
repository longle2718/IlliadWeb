/* 
 * The MIT License
 *
 * Copyright 2015 Long.
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
var getBasicQuery = function (){
    var q = {
        t1: $("#t1").val(),
        t2: $("#t2").val()
    };
    if ($("#f1").val()){
        q.f1 = $("#f1").val();
    }
    if ($("#f2").val()){
        q.f2 = $("#f2").val();
    }
    if ($("#dur1").val()){
        q.dur1 = $("#dur1").val();
    }
    if ($("#dur2").val()){
        q.dur2 = $("#dur2").val();
    }
    if ($("#lat").val() && $("#lng").val()){
        q.loc = [$("#lat").val(), $("#lng").val()];
    }
    if ($("#rad").val()){
        q.rad = $("#rad").val();
    }
    //if ($('input[name="infer"]:checked').val() === "tag"){
        if ($("#kw").val()){
            q.kw = $("#kw").val();
        }
    //}

   return q;
};

var IllQueryPost = function (db, user, pwd, col, q, cb_done, cb_fail){
    //var tZoneOffset = 5/24;
    var earthRad = 3959; // miles
    
    // Construct the query string
    var params = {'dbname':db, 'colname': col, 'user': user, 'passwd': pwd};
    if (q.hasOwnProperty('limit')){
        params.limit = q.limit;
    }
    var queryString = $.param(params);
    var timeDat, freqDat, durDat, lpDat, locDat, kwDat;
    
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
    
    if (q.hasOwnProperty('lp1') && q.hasOwnProperty('lp2')){
        lpDat = ',{logProb:{$gte:'+q.lp1+', $lte:'+q.lp2+'}}';
    }
    else if (q.hasOwnProperty('lp1')){
        lpDat = ',{logProb:{$gte:'+q.lp1+'}}';
    }
    else if (q.hasOwnProperty('lp2')){
        lpDat = ',{logProb:{$lte:'+q.lp2+'}}';
    }
    else{
        lpDat = '';
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
    var postDat = '{$and:['+timeDat+freqDat+durDat+lpDat+locDat+kwDat+']}';
    
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

var displayEvent = function(events){
    var markers = oms.getMarkers();
    for (var i = 0; i <markers.length;i++){
        markers[i].setMap(null);
    }
    oms.clearMarkers();
    dataTable.removeRows(0, dataTable.getNumberOfRows());
    
    for (var i = 0; i <events.length;i++){
        // Create a marker for each event
        var marker = new google.maps.Marker({
                        position:new google.maps.LatLng(parseFloat(events[i].location.coordinates[1]), parseFloat(events[i].location.coordinates[0])),
                        score: events[i].score,
                        tag: events[i].tag,
                        recordDate: events[i].recordDate.$date,
                        filename: events[i].filename,
                        icon:'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld='+ (i) +'|'
                                +num2hexcolor(events[i].score)+'|FFFFFF' // fill color|text color
        });
        marker.setMap(map);

        google.maps.event.addListener(marker, 'mouseover', (function(marker) {
                        return function(){
                                        iw.setContent("<p>"+marker.recordDate+"<br>"+marker.score+"<br>"+marker.tag+"</p>");
                                        iw.open(map, marker);
                        };
        })(marker));
        google.maps.event.addListener(marker, 'mouseout', function(){
                        iw.close();
        });
        oms.addMarker(marker);
        
        // A row in the dataTable for each event
        dataTable.addRows([
            [new Date(marker.recordDate), marker.score, i.toString(), marker.recordDate+"\n"+marker.score+"\n"+marker.tag, marker.filename, marker.tag]
        ]);
    }
    var view = new google.visualization.DataView(dataTable);
    view.setColumns([0,1,2,3]);
    chart.draw(view, chartOptions);
};

var num2hexcolor = function(val){
    var max = 2.5e3;
    var min = 0;
    // cap the input value
    if (val > max)
        val = max;
    else if (val < min)
        val = min;
    // the 5 color heatmap algorithm
    h = math.round((1.0 - val/max) * 100);
    l = math.round(val/max*50);
    var color = tinycolor("hsl("+h+"%, 100%, "+l+"%)");
    return color.toHex();
};

var IllGridfsGet = function(db, user, pwd, gridCol, marker, cb_done, cb_fail){
    var queryString = $.param({'user':user, 'passwd': pwd, 'filename': marker.filename});
    
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
        cb_done(data, marker);
    }).fail(function(){
        console.log('ajax fail');
        cb_fail(marker);
    });
};

var soundPlayTag = function(data, marker){
    audioCtx.decodeAudioData(data, function(buf){
            // Play the sound
            var source = audioCtx.createBufferSource();
            source.buffer = buf;
            source.connect(audioCtx.destination);
            source.start(0);

            // if pred for speech, then invoke ASR (auto speech recog) service for init help
            /*
            var ASR_result = '';
            if ($('input[name="infer"]:checked').val() === "pred" && $("#classes").val() === "speech"){
                gVoiceApi('AIzaSyD5NvcrQ54Rbzdxpo3FtJsAyvUjy6O3cn4', data, function(xscript){
                    ASR_result = ' ';
                    for (var i = 0; i < xscript[2].result[1].alternative.length; i++){
                        ASR_result = ASR_result+xscript[2].result[1].alternative[i].transcript;
                    }
                }, function(){
                    console.log('ASR failed');
                });
            }
            */

            soundTag(marker);
    }, function(error){
                    console.log('audio decoding error');
    });
};

var soundTag = function(marker){
    // Get updated tags from the user
    var newtag = prompt("Modify tags", marker.tag);
    if (newtag || marker.tag){
        IllWritePost('publicDb', 'publicUser', 'publicPwd', 'event',marker.filename, "set", '{tag:"'+newtag+'"}');
        marker.tag = newtag;
        if (marker.selectedItem){
            var tt = dataTable.getValue(marker.selectedItem.row, 3);
            var tt_lines = tt.split('\n');
            tt_lines[2] = marker.tag;
            
            dataTable.setValue(marker.selectedItem.row, 3, tt_lines.join('\n'));
            dataTable.setValue(marker.selectedItem.row, 5, marker.tag);
            
            var view = new google.visualization.DataView(dataTable);
            view.setColumns([0,1,2,3]);
            chart.draw(view, chartOptions);
        }
    }
};

var IllWritePost = function(db, user, pwd, col, filename, op, field){
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