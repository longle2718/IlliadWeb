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
    fromClass: function(classname, cb){
        var jsonFile;
        switch (classname){
            case 'air_conditioner':
                jsonFile = "data/air_conditioner.json";
                break;
            case 'car_horn':
                jsonFile = "data/car_horn.json";
                break;
            case 'children_playing':
                jsonFile = "data/children_playing.json";
                break;
            case 'dog_bark':
                jsonFile = "data/dog_bark.json";
                break;
            case 'drilling':
                jsonFile = "data/drilling.json";
                break;
            case 'engine_idling':
                jsonFile = "data/engine_idling.json";
                break;
            case 'gun_shot':
                jsonFile = "data/gun_shot.json";
                break;
            case 'jackhammer':
                jsonFile = "data/jackhammer.json";
                break;
            case 'siren':
                jsonFile = "data/siren.json";
                break;
            case 'street_music':
                jsonFile = "data/street_music.json";
                break;
            case 'knock':
                jsonFile = "data/knock.json";
                break;
            case 'door_slam':
                jsonFile = "data/door_slam.json";
                break;
            case 'steps':
                jsonFile = "data/steps.json";
                break;
            case 'chair_moving':
                jsonFile = "data/chair_moving.json";
                break;
            case 'key_jingle':
                jsonFile = "data/key_jingle.json";
                break;
            case 'phone_ring':
                jsonFile = "data/phone_ring.json";
                break;
            case 'cough':
                jsonFile = "data/cough.json";
                break;
            case 'speech':
                jsonFile = "data/speech.json";
                break;
            default:
                break;
        }
        
        if (typeof jsonFile === 'undefined'){
            cb(this);
        } else{
            // save this PredModel to distinguish it from the "this" in getJSON's callback
            var _this = this;
            $.getJSON(jsonFile, function(json){
                _this.fromJSON(json);
                cb(_this);
            });
        }
    },
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
