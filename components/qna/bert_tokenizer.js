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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var SEPERATOR = '\u2581';
exports.UNK_INDEX = 100;
exports.CLS_INDEX = 101;
exports.CLS_TOKEN = '[CLS]';
exports.SEP_INDEX = 102;
exports.SEP_TOKEN = '[SEP]';
exports.NFKC_TOKEN = 'NFKC';
exports.VOCAB_URL = 'https://storage.googleapis.com/learnjs-data/bert_vocab/processed_vocab.json';
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
                return [2, tf.util.fetch(exports.VOCAB_URL).then(function (d) { return d.json(); })];
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
            if (word !== exports.CLS_TOKEN && word !== exports.SEP_TOKEN) {
                return "" + SEPERATOR + word.normalize(exports.NFKC_TOKEN);
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
                outputTokens.push(exports.UNK_INDEX);
            }
            else {
                outputTokens = outputTokens.concat(subTokens);
            }
        }
        return outputTokens;
    };
    return BertTokenizer;
}());
exports.BertTokenizer = BertTokenizer;
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
exports.loadTokenizer = loadTokenizer;
//# sourceMappingURL=bert_tokenizer.js.map