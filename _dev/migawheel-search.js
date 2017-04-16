/**
 * Created by cls on 2017/4/16.
 */

var searchElem = document.querySelector('.search');
var searchHintsElem = document.querySelector('.search-hints');
var searchInputElem = document.querySelector('.search > input');

var migawheelSearchEHs = {
    firstKeyUp: true,

    setDateFetchHandler: function (handler) {
        if (typeof handler === 'function') {
            this.dataFetchHandler = handler;
        } else {
            this.dataFetchHandler = function () {
                // 空函数
                return null;
            };
        }
    },
    setMigaShowHandler: function (handler) {
        if (typeof handler === 'function') {
            this.migaShowHandler = handler;
        } else {
            this.migaShowHandler = function () {
                // 空函数
                return null;
            };
        }
    },
    searchHintsReset: function (text) {
        searchHintsElem.setAttribute('data-rel', '-1');
        searchHintsElem.style.top = (searchElem.offsetTop + 50) + 'px';
        searchHintsElem.style.left = (searchElem.offsetLeft) + 'px';
        searchHintsElem.innerHTML = text || searchHintsElem.getAttribute('data-placeholder');
    },
    searchHintsUpdate: function (inputElem) {
        var analysisResult = this.analysisSearchString(inputElem.value);

        if (typeof analysisResult.category === 'string') {
            this.searchHintsReset(analysisResult.category);
            return;
        }
        if (typeof analysisResult.article === 'string') {
            this.searchHintsReset(analysisResult.article);
            return;
        }

        this.buildSearchHints(this.dataFetchHandler(analysisResult));
    },
    searchHintsSelect: function (updown) {
        var index = parseInt(searchHintsElem.getAttribute('data-rel'));
        var newIndex = index + (updown === 'ArrowUp' ? -1 : 1);

        if (newIndex > -1 && newIndex < searchHintsElem.childElementCount) {
            if (index !== -1) {
                searchHintsElem.children[index].classList.remove('selected');
            }
            searchHintsElem.children[newIndex].classList.add('selected');
            searchHintsElem.setAttribute('data-rel', newIndex + '');
        }
    },
    buildSearchHints: function (hints) {
        searchHintsElem.innerHTML = '';
        for (var i = 0; i < Math.min(5, hints.length); i++) {
            var p = document.createElement('p');
            p.innerHTML = hints[i];
            searchHintsElem.appendChild(p);
        }
    },
    analysisSearchString: function (searchStr) {
        function _analysis(str) {
            var regs = [
                'Y(\\d{4}|\\d{2})(?:-(\\d{4}|\\d{2}))?',
                'M(\\d{2}|\\d)(?:-(\\d{2}|\\d))?',
                'D(\\d{2}|\\d)(?:-(\\d{2}|\\d))?'
                // /Y(\d{4}|\d{2})[^-]/,
                // /M(\d{2}|\d)[^-]/,
                // /D(\d{2}|\d)[^-]/,
            ];

            var ret = {year: {start: null, end: null}, month: {start: null, end: null}, day: {start: null, end: null}},
                keys = Object.keys(ret);

            var splitRegItems = [' +'];
            for (var index = 0; index < regs.length; index++) {
                var i, reg = regs[index];
                var matched = str.match(new RegExp(reg));
                if (matched) {

                    var key = keys[index];
                    var retProp = ret[key];
                    var retPropKeys = Object.keys(retProp);
                    for (i = 1; i < matched.length; i++) {

                        if (matched[i] === undefined) {
                            continue;
                        }

                        if (key === 'year' && matched[i].length === 2) {
                            matched[i] = '20' + matched[i];
                        }

                        matched[i] = parseInt(matched[i]);

                        if (key === 'month' && (matched[i] < 1 || matched[i] > 12)) {
                            // month
                            return '搜索串有误：月份超出地球月范围。';
                        }
                        if (key === 'day' && (matched[i] < 1 || matched[i] > 31)) {
                            // day
                            return '搜索串有误：日期超出地球日范围。';
                        }

                        retProp[retPropKeys[i - 1]] = matched[i];
                    }

                    if (!!retProp[retPropKeys[1]] && retProp[retPropKeys[1]] < retProp[retPropKeys[0]]) {
                        return '搜索串有误：时间顺序[' + key + ']错误。';
                    }

                    matched = str.match(new RegExp(reg, 'g'));
                    if (matched) {
                        for (i = 0; i < matched.length; i++) {
                            splitRegItems.push(matched[i]);
                        }
                    }
                }
            }

            ret.keyWords = str.split(new RegExp(splitRegItems.join('|'))).filter(function (kw) {
                return kw !== '';
            }).reduce(function (p, v) {
                for (var i = 0; i < p.length; i++) {
                    if (p[i] === v) {
                        return p;
                    }
                }
                p.push(v);
                return p;
            }, []);

            return ret;
        }

        var ret = {};

        var cateAndArticle = searchStr.split(':');

        if (cateAndArticle[0] === 'A') {
            ret.category = null;
        } else {
            ret.category = _analysis(cateAndArticle[0]);
        }

        if (cateAndArticle.length > 1) {
            ret.article = _analysis(cateAndArticle[1]);
        } else {
            ret.article = null;
        }

        return ret;
    },
    inputFocus: function () {
        searchElem.classList.add('focused');
        if (searchInputElem.value.length > 0) {
            this.searchHintsReset();
            this.searchHintsUpdate(searchInputElem);
            searchHintsElem.classList.add('show');
        }
    },
    inputBlur: function () {
        searchElem.classList.remove('focused');
        searchHintsElem.classList.remove('show');
    },
    inputKeyUp: function (e) {
        if (this.firstKeyUp) {
            this.searchHintsReset();
            searchHintsElem.classList.add('show');
            this.firstKeyUp = false;
        }

        switch (e.key) {
            case 'ArrowDown': case 'ArrowUp':
                this.searchHintsSelect(e.key);
                break;
            case 'Enter':
                this.inputKeyEnterUp(e.target);
                break;
            case 'Backspace':
                this.inputKeyBackspaceUp(e.target);
                break;
            case ':':
                this.inputKeyColonUp(e.target);
                break;
            default:
                this.searchHintsUpdate(e.target);
                return;
        }
    },
    inputKeyBackspaceUp: function (inputElem) {
        if (inputElem.value === '') {
            this.firstKeyUp = true;
            searchHintsElem.classList.remove('show');
        }
    },
    inputKeyEnterUp: function (inputElem) {
        console.log('Search String: [' + inputElem.value + ']');

        var analysisResult = this.analysisSearchString(inputElem.value);

        if (typeof analysisResult.category === 'string') {
            this.searchHintsReset(analysisResult.category);
            return;
        }
        if (typeof analysisResult.article === 'string') {
            this.searchHintsReset(analysisResult.article);
            return;
        }

        this.migaShowHandler(analysisResult);
    },
    inputKeyColonUp: function (inputElem) {
        console.log('Search String: [' + inputElem.value + ']');

        var colon = ':', firstTime = true;
        inputElem.value = inputElem.value.split('').reduce(function (p, v) {
            if (v !== colon || firstTime) {
                p.push(v);
                if (v === colon) firstTime = false;
            }
            return p;
        }, []).join('');
    }
};

var focusListener = migawheelSearchEHs.inputFocus.bind(migawheelSearchEHs);
var blurListener = migawheelSearchEHs.inputBlur.bind(migawheelSearchEHs);
var keyupListener = migawheelSearchEHs.inputKeyUp.bind(migawheelSearchEHs);

searchInputElem.addEventListener('focus', focusListener);
searchInputElem.addEventListener('blur', blurListener);
searchInputElem.addEventListener('keyup', keyupListener);

document.addEventListener('beforeunload', function () {

    searchInputElem.removeEventListener('focus', focusListener);
    searchInputElem.removeEventListener('blur', blurListener);
    searchInputElem.removeEventListener('keyup', keyupListener);

});
