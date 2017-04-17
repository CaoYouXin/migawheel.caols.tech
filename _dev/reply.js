/**
 * Created by cls on 2017/4/17.
 */

var replyElem = document.querySelector('.reply');
var replyInputElem = document.querySelector('.reply > textarea');

function replyFocus() {
    replyElem.classList.add('focused');
    replyInputElem.classList.add('focused');
}

function replyBlur() {
    // replyElem.classList.remove('focused');
}

replyInputElem.addEventListener('focus', replyFocus);
replyInputElem.addEventListener('blur', replyBlur);

document.addEventListener('beforeunload', function () {
    replyInputElem.removeEventListener('focus', replyFocus);
    replyInputElem.removeEventListener('blur', replyBlur);
});
