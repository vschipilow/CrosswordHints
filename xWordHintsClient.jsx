
"use strict";

function doIt() {
    document.getElementById('result').innerHTML = '<p>Searching ...</p>';
    let port = document.getElementById('port').value;
    let word = document.getElementById('word').value.replace(/[^a-zA-Z]/g, '?');
    document.getElementById('word').value = word;
//     let url = ['http://localhost:', port, '/search?word=', word];
    let url = ['http://localhost:', port, '/search?word=', word];
    let wordType = document.getElementById('wordType').value;
    switch (wordType) {
        case 'scrabble':
            let scrabble = document.getElementById('scrabble').value;
            url.push('&type=s&scrabble=', scrabble);
            break;
        case 'wordle':
            let wordleWrong = document.getElementById('wordleWrong').value.replace(/[^a-zA-Z]/g, '?');
            document.getElementById('wordleWrong').value = wordleWrong;
            let wordleNot = document.getElementById('wordleNot').value;
            url.push('&type=w&wordleWrong=', wordleWrong, '&wordleNot=', wordleNot);
            break;
        case 'crossword':
            url.push('&type=c');
            break;
        default:
            alert (`unknown type = ${wordType}`);
    }
    fetch(url.join(''))
    .then(x => x.text())
    .then(y => {
        let ra = y.split(',');
        let result = ['<table>'];
        ra.forEach((value) => {
            result.push('<tr><td>', value, '</td></tr>');
        });
        result.push('</table>');
        document.getElementById('result').innerHTML = result.join('');
    });
}

function changeType (value) {
    document.getElementById('result').innerHTML = '';
    let optionalField = document.getElementById('optionalField');
    switch (value) {
        case 'crossword':
            optionalField.innerHTML = '';
            break;
        case 'scrabble':
            optionalField.innerHTML = ['<p><input type="text" id="scrabble" placeholder="letters"',
                ' spellcheck="false"></p>'].join('');
            break;
        case 'wordle':
            optionalField.innerHTML = ['<p>',
                '<input type="text" id="wordleWrong" placeholder="wrong position" spellcheck="false">',
                '</p><p>',
                '<input type="text" id="wordleNot" placeholder="not in word" spellcheck="false">',
                '</p>'].join('');
            break;
        default:
            alert(`invalid type = ${value}`);
    }
}