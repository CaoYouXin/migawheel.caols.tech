/**
 * Created by cls on 2017/4/15.
 */
var migawheelMode = {
    None: 0,
    Category: 1,
    Article: 2
};

var migawheel = {
    showMode: migawheelMode.None,
    compiledTexts: [],
    lens: [],
    starts: [],
    ends: [],
    ellipsisStart: -1,
    ellipsisEnd: -1,
    ellipsisStartAngle: -1,
    ellipsisEndAngle: -1,
    ellipsisLen: -1,
    daCount: 0,
    textsElem: document.getElementsByClassName('texts')[0],
    bgsElem: document.getElementsByClassName('bgs')[0],
    cateBackElem: document.getElementsByClassName('cateBack')[0],
    svg: document.getElementById('taiqi'),
    NS: "http://www.w3.org/2000/svg",
    flag: false,
    mouseClickFlag: false,
    lastAngle: -1,
    originX: 250,
    originY: 250,
    largeRadius: 250,
    smallRadius: 100,
    len: -1,
    fontSize: -1,

    calcChineseAngle: function (fontSize, radius, len) {
        if (len > 0) {
            var ret = [];
            for (var i = 0; i < len; i++) {
                ret.push(Math.floor(2 * Math.asin(fontSize / 2 / (radius[i] - fontSize)) / Math.PI * 180));
            }
            return ret;
        } else {

            return Math.floor(2 * Math.asin(fontSize / 2 / (radius - fontSize)) / Math.PI * 180);
        }
    },
    calcEnglishAngle: function (chineseAngle, len) {
        if (len > 0) {
            var ret = [];
            for (var i = 0; i < len; i++) {
                ret.push(chineseAngle[i] / 2);
            }
            return ret;
        } else {
            return chineseAngle / 2;
        }
    },
    compile: function (str, radius, englishAngle, chineseAngle, len) {
        var _compile = function (str, radius, englishAngle, chineseAngle, lenAddFlag) {
            var g = document.createElementNS(migawheel.NS, "g");
            g.classList.add('cate');

            for (var i = 0, r = 0; i < str.length; i++) {
                var text = document.createElementNS(migawheel.NS, "text");

                text.setAttribute('x', '0');
                text.setAttribute('y', '-' + radius);
                text.setAttribute('transform', 'rotate(' + (r += i === 0 ? 0 : (str.charCodeAt(i - 1) < 128 ? englishAngle : chineseAngle)) + ' 0 0)');
                text.innerHTML = str.charAt(i);

                g.appendChild(text);

                if (i === str.length - 1) {
                    r += str.charCodeAt(i) < 128 ? englishAngle : chineseAngle;
                    if (lenAddFlag) {
                        migawheel.lens.push(r);
                    } else if (migawheel.lens[migawheel.lens.length - 1] < r) {
                        migawheel.lens[migawheel.lens.length - 1] = r;
                    }
                }
            }
            return g;
        };

        var g;
        if (len > 0) {
            var group = document.createElementNS(migawheel.NS, "g");

            for (var i = 0; i < len; i++) {

                g = _compile(str[i], radius[i], englishAngle[i], chineseAngle[i], i === 0);
                group.appendChild(g);

            }

            migawheel.compiledTexts.push(group);

        } else {
            g = _compile(str, radius, englishAngle, chineseAngle, true);

            migawheel.compiledTexts.push(g);

        }

    },
    rangeTitle: function (str, englishAngles, chineseAngles, len) {

        function calcTotalAngle(str, englishAngles, chineseAngles, index) {
            var ret = 0;
            for (var i = 0; i < str.length; i++) {
                ret += str.charCodeAt(i) < 128 ? englishAngles[index] : chineseAngles[index];
            }
            return ret;
        }

        function splitToAngle(str, angle, englishAngles, chineseAngles, index, reverse) {
            var count = 0, i;
            if (reverse === undefined || !reverse) {
                for (i = 0; i < str.length; i++) {
                    count += str.charCodeAt(i) < 128 ? englishAngles[index] : chineseAngles[index];
                    if (count >= angle) {
                        return str.substr(0, count === angle ? i + 1 : i);
                    }
                }
            } else {
                for (i = str.length - 1; i >= 0; i--) {
                    count += str.charCodeAt(i) < 128 ? englishAngles[index] : chineseAngles[index];
                    if (count >= angle) {
                        return str.substr(count === angle ? i : i + 1);
                    }
                }
            }
            return str;
        }

        var indexOf = str.indexOf('[]');
        var ret = str.substr(indexOf + '[]'.length).split('||');
        ret[0] = ret[0] + ' -';
        str = str.substr(0, indexOf);
        var alpha0 = calcTotalAngle(ret[0], englishAngles, chineseAngles, len - 2);
        var alpha = calcTotalAngle(str, englishAngles, chineseAngles, len - 3);

        var ratio = alpha / alpha0, line3, line4, line5;

        if (ratio <= 1) {
            ret = ['', str, ''].concat(ret);
        } else if (ratio <= 2) {
            line4 = splitToAngle(str, alpha0, englishAngles, chineseAngles, len - 4);
            ret = ['', line4, str.substr(line4.length)].concat(ret);
        } else if (ratio <= 3) {
            line3 = splitToAngle(str, alpha0, englishAngles, chineseAngles, len - 3, true);
            line4 = splitToAngle(str.substr(0, str.length - line3.length), alpha0, englishAngles, chineseAngles, len - 4, true);
            ret = [str.substr(0, str.length - line3.length - line4.length), line4, line3].concat(ret);
        } else {
            line5 = splitToAngle(str, alpha / 3, englishAngles, chineseAngles, len - 5);
            line4 = splitToAngle(str.substr(line5.length), alpha / 3, englishAngles, chineseAngles, len - 4);
            ret = [line5, line4, str.substr(line5.length + line4.length)].concat(ret);
        }

        return ret.map(function (s) {
            return ' ' + s.trim() + ' ';
        });
    },
    buildBg: function (path, start, end, smallR, largeR, isRandomFill) {
        path = path || document.createElementNS(migawheel.NS, "path");

        if (isRandomFill) {
            var fill = (~~((1 << 24) * Math.random())).toString(16);
            fill = '#' + '000000'.substr(fill.length) + fill;
            path.setAttribute('fill', fill);
        } else {
            path.setAttribute('fill', 'url(#gradient)');
        }

        var x = start / 180 * Math.PI;
        var y = end / 180 * Math.PI;
        var dis = end - start;
        var lsFlag = (dis < 0 ? dis + 360 : dis) > 180 ? '1' : '0';

        path.setAttribute('d', 'M ' + (smallR * Math.sin(x)) + ',' + (-smallR * Math.cos(x))
            + 'A ' + smallR + ',' + smallR + ' 0 ' + lsFlag + ',1 ' + (smallR * Math.sin(y)) + ',' + (-smallR * Math.cos(y))
            + 'L ' + (largeR * Math.sin(y)) + ',' + (-largeR * Math.cos(y))
            + 'A ' + largeR + ',' + largeR + ' 0 ' + lsFlag + ',0 ' + (largeR * Math.sin(x)) + ',' + (-largeR * Math.cos(x)) + 'Z');

        return path;
    },
    buildCateBack: function (cateName) {
        migawheel.cateBackElem.innerHTML = '';

        var circle = document.createElementNS(migawheel.NS, 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('r', '100');
        circle.setAttribute('fill', 'url(#gradient)');
        migawheel.cateBackElem.appendChild(circle);

        function countWidth(str) {
            var count = 0;
            for (var i = 0; i < str.length; i++) {
                count += str.charCodeAt(i) < 128 ? migawheel.fontSize / 2 : migawheel.fontSize;
            }
            return count;
        }

        function showTwoLines(str) {
            var line1 = cateName.substr(0, cateName.length / 2);
            var text = document.createElementNS(migawheel.NS, 'text');
            text.setAttribute('x', '' + (0 - countWidth(line1) / 2));
            text.setAttribute('y', '' + (0 - migawheel.fontSize * 0.3));
            text.innerHTML = line1;
            migawheel.cateBackElem.appendChild(text);

            var line2 = cateName.substr(cateName.length / 2);
            text = document.createElementNS(migawheel.NS, 'text');
            text.setAttribute('x', '' + (0 - countWidth(line2) / 2));
            text.setAttribute('y', '' + (migawheel.fontSize * 1.5));
            text.innerHTML = line2;
            migawheel.cateBackElem.appendChild(text);
        }

        var width = countWidth(cateName), text;
        if (width > 160) {
            showTwoLines(cateName.substr(0, ~~(320 / width * cateName.length)));
        } else {
            text = document.createElementNS(migawheel.NS, 'text');
            text.setAttribute('x', '' + (0 - width / 2));
            text.setAttribute('y', '' + (migawheel.fontSize / 2));
            text.innerHTML = cateName;
            migawheel.cateBackElem.appendChild(text);
        }
    },
    calcAngle: function (e) {
        var dx = e.offsetX - migawheel.originX;
        var dy = e.offsetY - migawheel.originY;

        var angle = Math.acos(dx / Math.sqrt(dx * dx + dy * dy)) / Math.PI * 180;
        if (dy > 0) {
            angle = 360 - angle;
        }

        return angle;
    },
    transform: function (elem, da) {
        var transformStr = elem.getAttribute('transform');
        elem.setAttribute('transform', transformStr.replace(/rotate\((\S+) /, function ($0, $1) {
            return 'rotate(' + (parseFloat($1) + da) + ' ';
        }));
    },
    mousedownHandler: function (e) {
        migawheel.flag = true;
        migawheel.mouseClickFlag = true;
        migawheel.lastAngle = migawheel.calcAngle(e);
    },
    mouseupHandler: function (e) {
        migawheel.flag = false;
    },
    mousemoveHandler: function (e) {
        migawheel.mouseClickFlag = false;
        if (migawheel.flag) {

            var angle = migawheel.calcAngle(e);
            var da = angle - migawheel.lastAngle;
            if (da < -180) {
                da += 360;
            } else if (da > 180) {
                da -= 360;
            }

            migawheel.transform(migawheel.bgsElem, -da);
            migawheel.transform(migawheel.textsElem, -da);

            migawheel.daCount -= da;
            if (Math.abs(migawheel.daCount) / 30 >= 1 && migawheel.ellipsisStart > -1) {
                // 变换现实隐藏项
                var addIndex = [], textRemoveIndex, bgRemoveIndex;

                if (migawheel.daCount < 0) {
                    migawheel.ellipsisEnd = (migawheel.ellipsisEnd + 1) % migawheel.len;
                    migawheel.ellipsisEndAngle = migawheel.ends[migawheel.ellipsisEnd];

                    migawheel.ellipsisLen = migawheel.ellipsisEndAngle - migawheel.ellipsisStartAngle;
                    migawheel.ellipsisLen = migawheel.ellipsisLen < 0 ? migawheel.ellipsisLen + 360 : migawheel.ellipsisLen;

                    while (migawheel.ellipsisLen > migawheel.lens[migawheel.ellipsisStart]) {
                        migawheel.starts[migawheel.ellipsisStart] = migawheel.ellipsisStartAngle;

                        migawheel.ellipsisStartAngle += migawheel.lens[migawheel.ellipsisStart];
                        migawheel.ellipsisStartAngle %= 360;

                        migawheel.ends[migawheel.ellipsisStart] = migawheel.ellipsisStartAngle;

                        addIndex.push(migawheel.ellipsisStart);
                        migawheel.ellipsisLen -= migawheel.lens[migawheel.ellipsisStart];
                        migawheel.ellipsisStart = (migawheel.ellipsisStart + 1) % migawheel.len;
                    }

                    textRemoveIndex = 0;
                    bgRemoveIndex = 0;

                    // 删除显示项
                    migawheel.textsElem.removeChild(migawheel.textsElem.childNodes[textRemoveIndex]);
                    migawheel.bgsElem.removeChild(migawheel.bgsElem.childNodes[bgRemoveIndex]);

                    // 修改省略区
                    var lastBg = migawheel.bgsElem.childNodes[migawheel.bgsElem.childElementCount - 1];
                    migawheel.buildBg(lastBg, migawheel.ellipsisStartAngle, migawheel.ellipsisEndAngle, migawheel.smallRadius, migawheel.largeRadius, false);

                    // 添加显示项
                    if (addIndex.length > 0) {
                        addIndex.forEach(function (index) {
                            var cCate = migawheel.compiledTexts[index];
                            cCate.setAttribute('transform', 'rotate(' + migawheel.starts[index] + ' 0 0)');
                            var bg = migawheel.buildBg(null, migawheel.starts[index], migawheel.ends[index], migawheel.smallRadius, migawheel.largeRadius, true);

                            migawheel.textsElem.appendChild(cCate);
                            migawheel.bgsElem.insertBefore(bg, lastBg);
                        })
                    }
                } else {
                    migawheel.ellipsisStart = migawheel.ellipsisStart - 1;
                    if (migawheel.ellipsisStart < 0) {
                        migawheel.ellipsisStart += migawheel.len;
                    }
                    migawheel.ellipsisStartAngle = migawheel.starts[migawheel.ellipsisStart];

                    migawheel.ellipsisLen = migawheel.ellipsisEndAngle - migawheel.ellipsisStartAngle;
                    migawheel.ellipsisLen = migawheel.ellipsisLen < 0 ? migawheel.ellipsisLen + 360 : migawheel.ellipsisLen;

                    while (migawheel.ellipsisLen > migawheel.lens[migawheel.ellipsisEnd]) {
                        migawheel.ends[migawheel.ellipsisEnd] = migawheel.ellipsisEndAngle;

                        migawheel.ellipsisEndAngle -= migawheel.lens[migawheel.ellipsisEnd];
                        migawheel.ellipsisEndAngle %= 360;
                        if (migawheel.ellipsisEndAngle === 0) {
                            migawheel.ellipsisEndAngle = 360;
                        }

                        migawheel.starts[migawheel.ellipsisEnd] = migawheel.ellipsisEndAngle;

                        addIndex.push(migawheel.ellipsisEnd);
                        migawheel.ellipsisLen -= migawheel.lens[migawheel.ellipsisEnd];
                        migawheel.ellipsisEnd = migawheel.ellipsisEnd - 1;
                        if (migawheel.ellipsisEnd < 0) {
                            migawheel.ellipsisEnd += migawheel.len;
                        }
                    }

                    textRemoveIndex = migawheel.textsElem.childElementCount - 1;
                    bgRemoveIndex = migawheel.bgsElem.childElementCount - 2;

                    // 删除显示项
                    migawheel.textsElem.removeChild(migawheel.textsElem.childNodes[textRemoveIndex]);
                    migawheel.bgsElem.removeChild(migawheel.bgsElem.childNodes[bgRemoveIndex]);

                    // 修改省略区
                    migawheel.buildBg(migawheel.bgsElem.childNodes[migawheel.bgsElem.childElementCount - 1], migawheel.ellipsisStartAngle, migawheel.ellipsisEndAngle, migawheel.smallRadius, migawheel.largeRadius, false);

                    // 添加显示项
                    if (addIndex.length > 0) {
                        addIndex.forEach(function (index) {
                            var cCate = migawheel.compiledTexts[index];
                            cCate.setAttribute('transform', 'rotate(' + migawheel.starts[index] + ' 0 0)');
                            var bg = migawheel.buildBg(null, migawheel.starts[index], migawheel.ends[index], migawheel.smallRadius, migawheel.largeRadius, true);

                            migawheel.textsElem.insertBefore(cCate, migawheel.textsElem.children[0]);
                            migawheel.bgsElem.insertBefore(bg, migawheel.bgsElem.children[0]);
                        })
                    }
                }

                migawheel.daCount = 0;
            }

            migawheel.lastAngle = angle;
        }
    },
    clickHandler: function (e) {
        if (!migawheel.mouseClickFlag) {
            return false;
        }

        var dx = e.offsetX - migawheel.originX;
        var dy = e.offsetY - migawheel.originY;
        var r = Math.sqrt(dx * dx + dy * dy);

        function clickArticle(e) {
            var clickText = migawheel.getClickText(e);
            if (clickText) {
                migawheel.articleClickHandler(clickText);
            }
        }

        if (r < 100) {
            if (migawheel.showMode === migawheelMode.Article) {
                migawheel.cateBackHandler();
            } else {
                dy = e.offsetY - migawheel.originY + 50;
                r = Math.sqrt(dx * dx + dy * dy);
                if (r < 50) {
                    migawheel.taiqiLeftClickHandler();
                } else {
                    dy = e.offsetY - migawheel.originY - 50;
                    r = Math.sqrt(dx * dx + dy * dy);
                    if (r < 50) {
                        migawheel.taiqiRightClickHandler();
                    }
                }
            }
        } else if (r < 150) {
            if (migawheel.showMode === migawheelMode.Category) {

                var clickText = migawheel.getClickText(e);
                if (clickText) {
                    migawheel.cateClickHandler(clickText);
                }

            } else if (migawheel.showMode === migawheelMode.Article) {
                clickArticle(e);
            }
        } else {
            if (migawheel.showMode === migawheelMode.Article) {
                clickArticle(e);
            }
        }
    },
    getClickText: function (e) {
        var clickAngle = migawheel.calcAngle(e);
        var matched = migawheel.bgsElem.getAttribute('transform').match(/rotate\((\S+) /);
        if (matched) {
            clickAngle += parseFloat(matched[1]);
            clickAngle %= 360;
        }

        var bgChildren = migawheel.bgsElem.children, index = -1;
        for (var i = 0; i < bgChildren.length; i++) {
            matched = bgChildren[i].getAttribute('d').match(/^M (\S+?),(\S+?)A (?:[\S\s]+?),[0-1] (\S+?),(\S+?)L(?:[\S\s]+)$/);
            if (matched) {
                var startAngle = migawheel.calcAngle({
                    offsetX: parseFloat(matched[3]) + migawheel.originX,
                    offsetY: parseFloat(matched[4]) + migawheel.originY
                });
                var endAngle = migawheel.calcAngle({
                    offsetX: parseFloat(matched[1]) + migawheel.originX,
                    offsetY: parseFloat(matched[2]) + migawheel.originY
                });

                if (startAngle < endAngle) {
                    if (startAngle < clickAngle && clickAngle < endAngle) {
                        index = i;
                        break;
                    }
                } else {
                    if (startAngle < clickAngle || clickAngle < endAngle) {
                        index = i;
                        break;
                    }
                }
            }
        }

        var clickText = migawheel.textsElem.children[index];
        if (clickText) {
            var charArray = [], j;
            if (clickText.classList.contains('cate')) {
                for (j = 0; j < clickText.children.length; j++) {
                    charArray.push(clickText.children[j].innerHTML);
                }
                // console.log('clickText: ['+charArray.join('').trim()+']');
                return charArray.join('').trim();
            } else {
                var str = '';
                for (var k = 0; k < 3; k++) {
                    var cate = clickText.children[k];
                    if (cate.classList.contains('cate')) {
                        charArray = [];
                        for (j = 0; j < cate.children.length; j++) {
                            charArray.push(cate.children[j].innerHTML);
                        }
                        str += charArray.join('').trim();
                    }
                }
                // console.log('clickText: ['+str+']');
                return str;
            }
        } else {
            // console.log('clickText: [null]');
            return null;
        }
    },
    setCateBackHandler: function (handler) {
        if (typeof handler === 'function') {
            migawheel.cateBackHandler = handler;
        } else {
            migawheel.cateBackHandler = function () {
                // 空函数
            };
        }
    },
    setCateClickHandler: function (handler) {
        if (typeof handler === 'function') {
            migawheel.cateClickHandler = handler;
        } else {
            migawheel.cateClickHandler = function () {
                // 空函数
            };
        }
    },
    setArticleClickHandler: function (handler) {
        if (typeof handler === 'function') {
            migawheel.articleClickHandler = handler;
        } else {
            migawheel.articleClickHandler = function () {
                // 空函数
            };
        }
    },
    setTaiqiLeftClickHandler: function (handler) {
        if (typeof handler === 'function') {
            migawheel.taiqiLeftClickHandler = handler;
        } else {
            migawheel.taiqiLeftClickHandler = function () {
                // 空函数
            };
        }
    },
    setTaiqiRightClickHandler: function (handler) {
        if (typeof handler === 'function') {
            migawheel.taiqiRightClickHandler = handler;
        } else {
            migawheel.taiqiRightClickHandler = function () {
                // 空函数
            };
        }
    },

    config: function (mode, fontRadius, fontSize, smallR, largeR, processStrFn) {
        migawheel.showMode = mode;

        migawheel.radius = fontRadius;
        migawheel.fontSize = fontSize;
        migawheel.chineseAngle = migawheel.calcChineseAngle(fontSize, fontRadius, fontRadius.length);
        migawheel.englishAngle = migawheel.calcEnglishAngle(this.chineseAngle, fontRadius.length);

        migawheel.smallRadius = smallR;
        migawheel.largeRadius = largeR;

        if (typeof processStrFn === "function") {
            migawheel.processStr = processStrFn;
        } else {
            migawheel.processStr = this.rangeTitle;
        }
    },
    compileParams: function (str) {
        return [migawheel.processStr(str, migawheel.englishAngle, migawheel.chineseAngle, migawheel.radius.length),
            migawheel.radius, migawheel.englishAngle, migawheel.chineseAngle, migawheel.radius.length];
    },
    init: function (data) {
        migawheel.len = data.length;

        migawheel.ellipsisStart = -1;
        migawheel.ellipsisEnd = -1;
        migawheel.lens = [];
        migawheel.starts = [];
        migawheel.ends = [];
        migawheel.compiledTexts = [];
        migawheel.textsElem.innerHTML = '';
        migawheel.bgsElem.innerHTML = '';
        migawheel.cateBackElem.innerHTML = '';

        data.forEach(function (str) {
            migawheel.compile.apply(migawheel, migawheel.compileParams(str));
        });

        var start = 0, end, len = data.length;
        for (var i = 0; i < len; i++) {
            start += i === 0 ? 0 : migawheel.lens[i - 1];
            end = start + migawheel.lens[i];

            migawheel.starts.push(start);
            migawheel.ends.push(end);

            if (end > 360 || (end === 360 && i < len - 1)) {
                // 需要省略号
                migawheel.ellipsisStart = i;
                migawheel.ellipsisEnd = len - 1;
                migawheel.ellipsisStartAngle = start;
                migawheel.ellipsisEndAngle = 360;

                migawheel.bgsElem.appendChild(migawheel.buildBg(null, migawheel.ellipsisStartAngle, migawheel.ellipsisEndAngle, migawheel.smallRadius, migawheel.largeRadius, false));

                break;
            }

            var cCate = migawheel.compiledTexts[i];
            cCate.setAttribute('transform', 'rotate(' + start + ' 0 0)');
            migawheel.textsElem.appendChild(cCate);
            migawheel.bgsElem.appendChild(migawheel.buildBg(null, start, end, migawheel.smallRadius, migawheel.largeRadius, true));
        }

        if (!migawheel.handlersBindFlag) {
            migawheel.svg.addEventListener('mousedown', migawheel.mousedownHandler);
            migawheel.svg.addEventListener('mouseup', migawheel.mouseupHandler);
            migawheel.svg.addEventListener('mousemove', migawheel.mousemoveHandler);
            migawheel.svg.addEventListener('click', migawheel.clickHandler);
            migawheel.handlersBindFlag = true;
        }
    }
};
