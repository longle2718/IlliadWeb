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
        headers: {
            "Content-Type":"audio/l16; rate=16000;"
        },
        data: data,
        dataType :'arraybuffer',
        timeOut: 10000,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(xscript){
        console.log('ajax done');
        cb_done(JSON.parse(xscript));
    }).fail(function(){
        console.log('ajax fail');
        cb_fail();
    });
};

/**
* 
* @returns {q}
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

   return q;
};

/**
* 
* @returns {model}
*/
var getPredModel = function(){
   var model = new PredModel();
   switch ($("#classes").val()){
        case 'air_conditioner':
            $.getJSON("data/air_conditioner.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'car_horn':
            $.getJSON("data/car_horn.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'children_playing':
            $.getJSON("data/children_playing.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'dog_bark':
            $.getJSON("data/dog_bark.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'drilling':
            $.getJSON("data/drilling.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'engine_idling':
            $.getJSON("data/engine_idling.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'gun_shot':
            $.getJSON("data/gun_shot.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'jackhammer':
            $.getJSON("data/jackhammer.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'siren':
            $.getJSON("data/siren.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'street_music':
            $.getJSON("data/street_music.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'knock':
            $.getJSON("data/knock.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'door_slam':
            $.getJSON("data/door_slam.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'steps':
            $.getJSON("data/steps.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'chair_moving':
            $.getJSON("data/chair_moving.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'key_jingle':
            $.getJSON("data/key_jingle.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'phone_ring':
            $.getJSON("data/phone_ring.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'cough':
            $.getJSON("data/cough.json", function(json){
                model.fromJSON(json);
            });
            break;
        case 'speech':
            $.getJSON("data/speech.json", function(json){
               model.fromJSON(json);
            });
            break;
   }
   return model;
};

var PredModel = function () {
    this.alpha;
    this.bias; // score bias
    this.kernelFcn;
    this.kernelScale;
    this.mu; // standardization mean
    this.sigma; // standardization sigma
    this.sv; // support vectos
    this.svl; // support vector labels
    this.sxfp; // score transform parameters
    console.log('model instance created');
};
PredModel.prototype = {
    fromJSON: function(json){
        this.alpha = json.alpha;
        this.bias = json.bias;
        this.kernelFcn = json.kernelFcn;
        this.kernelScale= json.kernelScale;
        this.mu = json.mu;
        this.sigma = json.sigma;
        this.sv = json.sv;
        this.svl = json.svl;
        this.xformFcn = json.xformFcn;
        this.sxfp = json.sxfp;
    },
    predict: function(model, feat){
        if (this.kernelFcn === 'gaussian'){
            var std_feat = math.dotDivide(math.subtract(feat, model.mu), model.sigma);
            wx = new Array(model.sv.length);
            for (k = 0; k < model.sv.length; k++){
                wx[k] = model.alpha[k]*model.svl[k]*math.exp(-math.pow(math.norm(math.subtract(model.sv[k], std_feat),2),2)/math.pow(model.kernelScale,2));
            }
            score = math.sum(wx)+model.bias;
            
            if (model.xformFcn === 'sigmoid'){
                return sigmoid(score, model.sxfp[0], model.sxfp[1]);
            }
            else if (model.xformFcn === 'step'){
                return step(score, model.sxfp[0], model.sxfp[1], model.sxfp[2]);
            }
            else{
                return -1;
            }
        }
        else{
            console.log("ERROR! unrecognized kernel type." + this.kernelType);
            return null;
        }
    }
};

var sigmoid = function(x,a,b){
    return 1/(1+math.exp(a*x+b));
};

var step = function(x,lb,ub,pi){
    if (x < lb){
        return 0;
    }
    else if(x >= lb && x <= ub){
        return pi;
    }
    else if (x > ub){
        return 1;
    }
};