import {bundleResourceIO} from '@tensorflow/tfjs-react-native';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });

var tfconv = require("@tensorflow/tfjs-converter");
var tf = require("@tensorflow/tfjs-core");
var bert_tokenizer_1 = require("./bert_tokenizer");
var BASE_DIR = 'https://storage.googleapis.com/tfjs-testing/mobile-bert/';
var MODEL_URL = BASE_DIR + 'model.json';
var INPUT_SIZE = 384;
var MAX_ANSWER_LEN = 32;
var MAX_QUERY_LEN = 64;
var MAX_SEQ_LEN = 384;
var PREDICT_ANSWER_NUM = 5;
var OUTPUT_OFFSET = 1;
var MobileBertImpl = (function () {
    function MobileBertImpl(modelConfig) {
        this.modelConfig = modelConfig;
        if (this.modelConfig == null) {
            this.modelConfig = { modelUrl: MODEL_URL };
        }
    }
    MobileBertImpl.prototype.process = function (query, context, maxQueryLen, maxSeqLen, docStride) {
        if (docStride === void 0) { docStride = 128; }
        var queryTokens = this.tokenizer.tokenize(query);
        if (queryTokens.length > maxQueryLen) {
            throw new Error("The length of question token exceeds the limit (" + maxQueryLen + ").");
        }
        var origTokens = this.tokenizer.processInput(context.trim()).slice(0);
        var tokenToOrigIndex = [];
        var allDocTokens = [];
        for (var i = 0; i < origTokens.length; i++) {
            var token = origTokens[i];
            var subTokens = this.tokenizer.tokenize(token);
            for (var j = 0; j < subTokens.length; j++) {
                var subToken = subTokens[j];
                tokenToOrigIndex.push(i);
                allDocTokens.push(subToken);
            }
        }
        var maxContextLen = maxSeqLen - queryTokens.length - 3;
        var docSpans = [];
        var startOffset = 0;
        while (startOffset < allDocTokens.length) {
            var length_1 = allDocTokens.length - startOffset;
            if (length_1 > maxContextLen) {
                length_1 = maxContextLen;
            }
            docSpans.push({ start: startOffset, length: length_1 });
            if (startOffset + length_1 === allDocTokens.length) {
                break;
            }
            startOffset += Math.min(length_1, docStride);
        }
        var features = docSpans.map(function (docSpan) {
            var tokens = [];
            var segmentIds = [];
            var tokenToOrigMap = {};
            tokens.push(bert_tokenizer_1.CLS_INDEX);
            segmentIds.push(0);
            for (var i = 0; i < queryTokens.length; i++) {
                var queryToken = queryTokens[i];
                tokens.push(queryToken);
                segmentIds.push(0);
            }
            tokens.push(bert_tokenizer_1.SEP_INDEX);
            segmentIds.push(0);
            for (var i = 0; i < docSpan['length']; i++) {
                var splitTokenIndex = i + docSpan['start'];
                var docToken = allDocTokens[splitTokenIndex];
                tokens.push(docToken);
                segmentIds.push(1);
                tokenToOrigMap[tokens.length] = tokenToOrigIndex[splitTokenIndex];
            }
            tokens.push(bert_tokenizer_1.SEP_INDEX);
            segmentIds.push(1);
            var inputIds = tokens;
            var inputMask = inputIds.map(function (id) { return 1; });
            while ((inputIds.length < maxSeqLen)) {
                inputIds.push(0);
                inputMask.push(0);
                segmentIds.push(0);
            }
            return { inputIds: inputIds, inputMask: inputMask, segmentIds: segmentIds, origTokens: origTokens, tokenToOrigMap: tokenToOrigMap };
        });
        return features;
    };
    MobileBertImpl.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, batchSize, inputIds, segmentIds, inputMask, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4, tfconv.loadGraphModel(bundleResourceIO( this.modelConfig.modelUrl, this.modelConfig.modelWeightsID)]; // kv hard code
                    case 1:
                        _a.model = _c.sent();
                        batchSize = 1;
                        inputIds = tf.ones([batchSize, INPUT_SIZE], 'int32');
                        segmentIds = tf.ones([1, INPUT_SIZE], 'int32');
                        inputMask = tf.ones([1, INPUT_SIZE], 'int32');
                        this.model.execute({
                            input_ids: inputIds,
                            segment_ids: segmentIds,
                            input_mask: inputMask,
                            global_step: tf.scalar(1, 'int32')
                        });
                        _b = this;
                        return [4, bert_tokenizer_1.loadTokenizer()];
                    case 2:
                        _b.tokenizer = _c.sent();
                        return [2];
                }
            });
        });
    };
    MobileBertImpl.prototype.findAnswers = function (question, context) {
        return __awaiter(this, void 0, void 0, function () {
            var features, promises, answers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (question == null || context == null) {
                            throw new Error('The input to findAnswers call is null, ' +
                                'please pass a string as input.');
                        }
                        features = this.process(question, context, MAX_QUERY_LEN, MAX_SEQ_LEN);
                        promises = features.map(function (feature, index) { return __awaiter(_this, void 0, void 0, function () {
                            var result, logits;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        result = tf.tidy(function () {
                                            var batchSize = 1;
                                            var inputIds = tf.tensor2d(feature.inputIds, [batchSize, INPUT_SIZE], 'int32');
                                            var segmentIds = tf.tensor2d(feature.segmentIds, [batchSize, INPUT_SIZE], 'int32');
                                            var inputMask = tf.tensor2d(feature.inputMask, [batchSize, INPUT_SIZE], 'int32');
                                            var globalStep = tf.scalar(index, 'int32');
                                            return _this.model.execute({
                                                input_ids: inputIds,
                                                segment_ids: segmentIds,
                                                input_mask: inputMask,
                                                global_step: globalStep
                                            }, ['start_logits', 'end_logits']);
                                        });
                                        return [4, Promise.all([result[0].array(), result[1].array()])];
                                    case 1:
                                        logits = _a.sent();
                                        result[0].dispose();
                                        result[1].dispose();
                                        return [2, this.getBestAnswers(logits[0][0], logits[1][0], feature.origTokens, feature.tokenToOrigMap, index)];
                                }
                            });
                        }); });
                        return [4, Promise.all(promises)];
                    case 1:
                        answers = _a.sent();
                        return [2, answers.reduce(function (flatten, array) { return flatten.concat(array); }, [])
                                .sort(function (logitA, logitB) { return logitB.score - logitA.score; })
                                .slice(0, PREDICT_ANSWER_NUM)];
                }
            });
        });
    };
    MobileBertImpl.prototype.getBestAnswers = function (startLogits, endLogits, origTokens, tokenToOrigMap, docIndex) {
        if (docIndex === void 0) { docIndex = 0; }
        var startIndexes = this.getBestIndex(startLogits);
        var endIndexes = this.getBestIndex(endLogits);
        var origResults = [];
        startIndexes.forEach(function (start) {
            endIndexes.forEach(function (end) {
                if (tokenToOrigMap[start] && tokenToOrigMap[end] && end >= start) {
                    var length_2 = end - start + 1;
                    if (length_2 < MAX_ANSWER_LEN) {
                        origResults.push({ start: start, end: end, score: startLogits[start] + endLogits[end] });
                    }
                }
            });
        });
        origResults.sort(function (a, b) { return b.score - a.score; });
        var answers = [];
        for (var i = 0; i < origResults.length; i++) {
            if (i >= PREDICT_ANSWER_NUM) {
                break;
            }
            var convertedText = '';
            if (origResults[i].start > 0) {
                convertedText = this.convertBack(origTokens, tokenToOrigMap, origResults[i].start, origResults[i].end);
            }
            else {
                convertedText = '';
            }
            answers.push({ text: convertedText, score: origResults[i].score });
        }
        return answers;
    };
    MobileBertImpl.prototype.getBestIndex = function (logits) {
        var tmpList = [];
        for (var i = 0; i < MAX_SEQ_LEN; i++) {
            tmpList.push([i, i, logits[i]]);
        }
        tmpList.sort(function (a, b) { return b[2] - a[2]; });
        var indexes = [];
        for (var i = 0; i < PREDICT_ANSWER_NUM; i++) {
            indexes.push(tmpList[i][0]);
        }
        return indexes;
    };
    MobileBertImpl.prototype.convertBack = function (origTokens, tokenToOrigMap, start, end) {
        var shiftedStart = start + OUTPUT_OFFSET;
        var shiftedEnd = end + OUTPUT_OFFSET;
        var startIndex = tokenToOrigMap[shiftedStart];
        var endIndex = tokenToOrigMap[shiftedEnd];
        var ans = origTokens.slice(startIndex, endIndex + 1).join(' ');
        return ans;
    };
    return MobileBertImpl;
}());
function load(modelConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var mobileBert;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mobileBert = new MobileBertImpl(modelConfig);
                    return [4, mobileBert.load()];
                case 1:
                    _a.sent();
                    return [2, mobileBert];
            }
        });
    });
}
exports.load = load;
//# sourceMappingURL=mobile_bert.js.map