/**
 * Created by cls on 2017/4/17.
 */

var menuBtnELem = document.querySelector('.banner > .menu-btn');
var menuElem = document.querySelector('.menu');
var banner1Elem = document.querySelector('.banner');
var banner2Elem = document.querySelector('.left-banner');

function replaceMenu() {
    menuElem.classList.add(window.innerWidth > window.innerHeight ? 'left' : 'right');
}

replaceMenu();

function menuClickHandler() {
    if (menuElem.classList.contains('left') || menuElem.classList.contains('right')) {
        menuElem.classList.remove('left');
        menuElem.classList.remove('right');
        banner1Elem.classList.add('solid');
        banner2Elem.classList.add('solid');
    } else {
        replaceMenu();
        banner1Elem.classList.remove('solid');
        banner2Elem.classList.remove('solid');
    }
}

menuBtnELem.addEventListener('click', menuClickHandler);

document.addEventListener('beforeunload', function () {
    menuBtnELem.removeEventListener('click', menuClickHandler);
});
