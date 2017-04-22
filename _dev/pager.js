var pagerSelectElem = document.querySelector('.category-pager-select');
var pagerSelectInputElem = document.querySelector('.category-pager-select > input');
var pagerSelectSpanELem = document.querySelector('.category-pager-select > span');
var pagerSelectUlELem = document.querySelector('.category-pager-select > ul');

function pagerFocusHandler() {
    pagerSelectElem.classList.add('focused');
}

function pagerBlurHandler() {
    pagerSelectElem.classList.remove('focused');
}

function pagerClickHandler() {
    pagerSelectInputElem.focus();
    pagerSelectUlELem.classList.add('show');
}

function pagerItemClickHandler(e) {
    pagerSelectUlELem.classList.remove('show');

    if ('关闭' === e.target.innerHTML) {
        return;
    }

    pagerSelectInputElem.value = e.target.innerHTML;
}

function pagerChangeHandler(e) {
    console.log(e);
}

pagerSelectInputElem.addEventListener('input', pagerChangeHandler);
pagerSelectInputElem.addEventListener('focus', pagerFocusHandler);
pagerSelectInputElem.addEventListener('blur', pagerBlurHandler);
pagerSelectSpanELem.addEventListener('click', pagerClickHandler);
pagerSelectUlELem.addEventListener('click', pagerItemClickHandler);

document.addEventListener('beforeunload', function () {
    pagerSelectInputElem.removeEventListener('input', pagerChangeHandler);
    pagerSelectInputElem.removeEventListener('focus', pagerFocusHandler);
    pagerSelectInputElem.removeEventListener('blur', pagerBlurHandler);
    pagerSelectSpanELem.removeEventListener('click', pagerClickHandler);
    pagerSelectUlELem.removeEventListener('click', pagerItemClickHandler);
});
