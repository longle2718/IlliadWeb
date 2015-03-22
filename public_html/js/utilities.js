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

/**
 * gVoiceApi
 * 
 * Use Google Voice API to transcribe speech
 * 
 * @param {String} key
 * @param {Binary} data
 * @param {function} cb_done
 * @param {function} cb_fail
 * @returns {none}
 */
var gVoiceApi = function(key, data, cb_done, cb_fail){
    var queryString = $.param({'output':'json', 'lang': 'en-us', 'key': key});
    
    $.ajax({
        url: 'https://www.google.com/speech-api/v2/recognize?'+queryString,
        type:'POST',
        dataType :'arraybuffer',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(xscript){
        console.log('ajax done');
        cb_done(xscript);
    }).fail(function(){
        console.log('ajax fail');
        cb_fail();
    });
};
