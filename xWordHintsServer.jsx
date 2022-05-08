
"use strict";

const numLines = 129194;
const url = require('url');
const fs = require('fs');
const readline = require('readline');

var numMsgs = 0;

exports.processRequest =  ( (req, res, port, iPhone) => {
    try {
        let q = url.parse(req.url, true);
        switch (q.pathname) {
            case '/':
            case '/xWordHints.html': {
                console.log('loading xWordHints.html');
                fs.readFile('xWordHints.html', (err, data) => {
                    res.end(setPort(port, data));
                });
                break;
            }
            case '/stylesheet.css': {
               let temp = getStyleSheetFilename(iPhone);
                console.log(`loading ${temp}`);
                fs.readFile(temp, (err, data) => {
                    res.end(data);
                });
                break;
            }
            case '/search': {
                let result = [];
                console.log(q.search);
                let patterns = buildRegExs (q.query);
                for (let p of patterns) {
                    console.log(p);
                }
                let wordLength = q.query.word.length;
                let readCount = 0;
                let csvInterface = readline.createInterface ({
                    input: fs.createReadStream(getWordListFilename(iPhone))
                });
                switch (q.query.type) {
                    case 'c':
                    case 'w': {
                        csvInterface.on('line', (line) => {
                            readCount++;
                            if (line.length == wordLength) {
                                if (isMatch(patterns, line)) {
                                    result.push(line);
                                }
                            }
                            if (readCount == numLines) {
                                res.end(deriveResult(result));
                            }
                        });
                        break;
                    }
                    case 's': {
                        let scrabble = q.query.scrabble.trim().toUpperCase();
                        let word = q.query.word.toUpperCase();
                        csvInterface.on('line', (line) => {
                            readCount++;
                            if (line.length == wordLength) {
                                if (isMatch(patterns, line)) {
                                    if (isMatchS(word, scrabble, line)) {
                                        result.push(line);
                                    }
                                }
                            }
                            if (readCount == numLines) {
                                res.end(deriveResult(result));
                            }
                        });
                        break;
                    }
                    default:
                        console.log(`unknown word type = ${q.query.type}`);
                }
                break;
            }
            default: {
                let fName = q.pathname.substr(1);
                console.log(`loading ${fName}`);
                fs.readFile(fName, (err, data) => {
                    res.end(data);
                });
            }
        }
    }
    catch (err) {
        let errMsg = `${err.name} ${err.message}`;
        res.end(errMsg);
        console.log(errMsg);
        console.log(err);
    }
});

function buildRegExs (query) {
    // word pattern
    let i = 0;
    let patterns = [];
    let patternParts = ['^'];
    for (let x of query.word.toUpperCase()) {
        if (/[A-Z]/.test(x)) {
            if (i > 0) {
                patternParts.push('[A-Z]');
                if (i > 1) {
                    patternParts.push('{', i, '}');
                }
                i = 0;
            }
            patternParts.push(x);
        } else {
            i++;
        }
    }
    if (patternParts.length > 1) {
        patterns.push(new RegExp(patternParts.join('')));
        patternParts = ['^'];
    }
    if (/[cs]/.test(query.type)) {
        return patterns;
    }
    // wordle wrong position patterns
    i = 0;
    for (let x of query.wordleWrong.toUpperCase()) {
        if (/[A-Z]/.test(x)) {
            if (i > 0) {
                patternParts.push('[A-Z]');
                if (i > 1) {
                    patternParts.push('{', i, '}');
                }
                i = 0;
            }
            patternParts.push('[^', x, ']');
            patterns.push(new RegExp(x));
        } else {
            i++;
        }
    }
    if (patternParts.length > 1) {
        patterns.push(new RegExp(patternParts.join('')));
    }
    // wordle Not patterns
    for (let x of query.wordleNot.toUpperCase()) {
        patterns.push(new RegExp(['[^', x, ']{', query.word.length, '}'].join('')));
    }
    return patterns;
}

function deriveResult (result) {
    if (result.length == 0) {
        return '* no match *';
    }
    return result.join(',');
}

function isMatch (patterns, line) {
    for (let p of patterns) {
        if (!p.test(line)) {
            return false;
        }
    }
    return true;
}

function isMatchS (word, scrabble, line) {
    let inRa = scrabble.split('');
    numMsgs++;

    for (let i = 0; i < line.length; i++) {
        if (line[i] != word[i]) {
            let match = false;
            for (let j = 0; j < inRa.length; j++) {
                if (line[i] == inRa[j]) {
                    match = true;
                    inRa.splice(j, 1);
                    break;
                }
            }
            if (!match) {
                return false;
            }
        }
    }
    return true;
}

function setPort(port, data) {
    return data.toString().replace(/XXXX/, port);
}

function getWordListFilename (iPhone) {
    return (iPhone) ? 'auEn.csv' : '/Users/lynandvicschipilow/SqlLite/auEn.csv';
}

function getStyleSheetFilename (iPhone) {
    return (iPhone) ? 'stylesheet.css'
        : '/Users/lynandvicschipilow/NodejsProjects/Stylesheet/stylesheet.css';
}
