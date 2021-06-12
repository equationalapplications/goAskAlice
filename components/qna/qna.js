/**
    * @license
    * Copyright 2020 Google LLC. All Rights Reserved.
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    * http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    * =============================================================================
    */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tensorflow/tfjs-core'), require('@tensorflow/tfjs-converter')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tensorflow/tfjs-core', '@tensorflow/tfjs-converter'], factory) :
    (factory((global.qna = {}),global.tf,global.tf));
}(this, (function (exports,tf,tfconv) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
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
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    var SEPERATOR = '\u2581';
    var UNK_INDEX = 100;
    var CLS_INDEX = 101;
    var CLS_TOKEN = '[CLS]';
    var SEP_INDEX = 102;
    var SEP_TOKEN = '[SEP]';
    var NFKC_TOKEN = 'NFKC';
    var VOCAB_URL = 'https://storage.googleapis.com/learnjs-data/bert_vocab/processed_vocab.json';
    var TrieNode = (function () {
        function TrieNode(key) {
            this.key = key;
            this.children = {};
            this.end = false;
        }
        TrieNode.prototype.getWord = function () {
            var output = [];
            var node = this;
            while (node != null) {
                if (node.key != null) {
                    output.unshift(node.key);
                }
                node = node.parent;
            }
            return [output, this.score, this.index];
        };
        return TrieNode;
    }());
    var Trie = (function () {
        function Trie() {
            this.root = new TrieNode(null);
        }
        Trie.prototype.insert = function (word, score, index) {
            var e_1, _a;
            var node = this.root;
            var symbols = [];
            try {
                for (var word_1 = __values(word), word_1_1 = word_1.next(); !word_1_1.done; word_1_1 = word_1.next()) {
                    var symbol = word_1_1.value;
                    symbols.push(symbol);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (word_1_1 && !word_1_1.done && (_a = word_1.return)) _a.call(word_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            for (var i = 0; i < symbols.length; i++) {
                if (node.children[symbols[i]] == null) {
                    node.children[symbols[i]] = new TrieNode(symbols[i]);
                    node.children[symbols[i]].parent = node;
                }
                node = node.children[symbols[i]];
                if (i === symbols.length - 1) {
                    node.end = true;
                    node.score = score;
                    node.index = index;
                }
            }
        };
        Trie.prototype.find = function (token) {
            var node = this.root;
            var iter = 0;
            while (iter < token.length && node != null) {
                node = node.children[token[iter]];
                iter++;
            }
            return node;
        };
        return Trie;
    }());
    function isWhitespace(ch) {
        return /\s/.test(ch);
    }
    function isInvalid(ch) {
        return (ch.charCodeAt(0) === 0 || ch.charCodeAt(0) === 0xfffd);
    }
    var punctuations = '[~`!@#$%^&*(){}[];:"\'<,.>?/\\|-_+=';
    function isPunctuation(ch) {
        return punctuations.indexOf(ch) !== -1;
    }
    var BertTokenizer = (function () {
        function BertTokenizer() {
        }
        BertTokenizer.prototype.load = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vocabIndex, word;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this;
                            return [4, this.loadVocab()];
                        case 1:
                            _a.vocab = _b.sent();
                            this.trie = new Trie();
                            for (vocabIndex = 999; vocabIndex < this.vocab.length; vocabIndex++) {
                                word = this.vocab[vocabIndex];
                                this.trie.insert(word, 1, vocabIndex);
                            }
                            return [2];
                    }
                });
            });
        };
        BertTokenizer.prototype.loadVocab = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, tf.util.fetch(VOCAB_URL).then(function (d) { return d.json(); })];
                });
            });
        };
        BertTokenizer.prototype.processInput = function (text) {
            var _this = this;
            var cleanedText = this.cleanText(text);
            var origTokens = cleanedText.split(' ');
            var tokens = origTokens.map(function (token) {
                token = token.toLowerCase();
                return _this.runSplitOnPunc(token);
            });
            var flattenTokens = [];
            for (var index = 0; index < tokens.length; index++) {
                flattenTokens = flattenTokens.concat(tokens[index]);
            }
            return flattenTokens;
        };
        BertTokenizer.prototype.cleanText = function (text) {
            var e_2, _a;
            var stringBuilder = [];
            try {
                for (var text_1 = __values(text), text_1_1 = text_1.next(); !text_1_1.done; text_1_1 = text_1.next()) {
                    var ch = text_1_1.value;
                    if (isInvalid(ch)) {
                        continue;
                    }
                    if (isWhitespace(ch)) {
                        stringBuilder.push(' ');
                    }
                    else {
                        stringBuilder.push(ch);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (text_1_1 && !text_1_1.done && (_a = text_1.return)) _a.call(text_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return stringBuilder.join('');
        };
        BertTokenizer.prototype.runSplitOnPunc = function (text) {
            var e_3, _a;
            var tokens = [];
            var startNewWord = true;
            try {
                for (var text_2 = __values(text), text_2_1 = text_2.next(); !text_2_1.done; text_2_1 = text_2.next()) {
                    var ch = text_2_1.value;
                    if (isPunctuation(ch)) {
                        tokens.push(ch);
                        startNewWord = true;
                    }
                    else {
                        if (startNewWord) {
                            tokens.push('');
                            startNewWord = false;
                        }
                        tokens[tokens.length - 1] += ch;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (text_2_1 && !text_2_1.done && (_a = text_2.return)) _a.call(text_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return tokens;
        };
        BertTokenizer.prototype.tokenize = function (text) {
            var e_4, _a;
            var outputTokens = [];
            var words = this.processInput(text).map(function (word) {
                if (word !== CLS_TOKEN && word !== SEP_TOKEN) {
                    return "" + SEPERATOR + word.normalize(NFKC_TOKEN);
                }
                return word;
            });
            for (var i = 0; i < words.length; i++) {
                var chars = [];
                try {
                    for (var _b = (e_4 = void 0, __values(words[i])), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var symbol = _c.value;
                        chars.push(symbol);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                var isUnknown = false;
                var start = 0;
                var subTokens = [];
                var charsLength = chars.length;
                while (start < charsLength) {
                    var end = charsLength;
                    var currIndex = void 0;
                    while (start < end) {
                        var substr = chars.slice(start, end).join('');
                        var match = this.trie.find(substr);
                        if (match != null && match.end != null) {
                            currIndex = match.getWord()[2];
                            break;
                        }
                        end = end - 1;
                    }
                    if (currIndex == null) {
                        isUnknown = true;
                        break;
                    }
                    subTokens.push(currIndex);
                    start = end;
                }
                if (isUnknown) {
                    outputTokens.push(UNK_INDEX);
                }
                else {
                    outputTokens = outputTokens.concat(subTokens);
                }
            }
            return outputTokens;
        };
        return BertTokenizer;
    }());
    function loadTokenizer() {
        return __awaiter(this, void 0, void 0, function () {
            var tokenizer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenizer = new BertTokenizer();
                        return [4, tokenizer.load()];
                    case 1:
                        _a.sent();
                        return [2, tokenizer];
                }
            });
        });
    }

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
                tokens.push(CLS_INDEX);
                segmentIds.push(0);
                for (var i = 0; i < queryTokens.length; i++) {
                    var queryToken = queryTokens[i];
                    tokens.push(queryToken);
                    segmentIds.push(0);
                }
                tokens.push(SEP_INDEX);
                segmentIds.push(0);
                for (var i = 0; i < docSpan['length']; i++) {
                    var splitTokenIndex = i + docSpan['start'];
                    var docToken = allDocTokens[splitTokenIndex];
                    tokens.push(docToken);
                    segmentIds.push(1);
                    tokenToOrigMap[tokens.length] = tokenToOrigIndex[splitTokenIndex];
                }
                tokens.push(SEP_INDEX);
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
                            return [4, tfconv.loadGraphModel(this.modelConfig.modelUrl)];
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
                            return [4, loadTokenizer()];
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

    var version = '1.0.0-alpha1';

    exports.load = load;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
