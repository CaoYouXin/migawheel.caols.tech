
import {Injectable} from "@angular/core";
export class Configs {
    static PostMode: string = 'POST.Mode';
    static CategoryMode: string = 'CATEGORY.Mode';

    static postConfig() {
        return [Configs.PostMode, [220, 195, 170, 145, 120], 16, 100, 250];
    }

    static categoryConfig() {
        return [Configs.CategoryMode, [120], 16, 100, 150];
    }
}

@Injectable()
export class MigaWheelCore {

    mode: string;

    private lineNum: number;
    private radius: number[];
    private fontSize: number;
    private smallRadius: number;
    private largeRadius: number;

    private chineseAngle: number[];
    private englishAngle: number[];
    
    private dataProcessFn: Function;

    private renderedElems: Elem[];
    private headElemIndex: number;
    private tailElemIndex: number;
    private ellipsisElem: Elem;

    previousCategories: string[];

    hasEllipsis(): boolean {
        let dIndex = this.tailElemIndex - this.headElemIndex;
        if (dIndex < 0) {
            dIndex += this.renderedElems.length;
        }

        return dIndex < this.renderedElems.length - 1;
    }

    private indexAdd(index: number): number {
        index++;
        return index %= this.renderedElems.length;
    }

    private indexMinus(index: number): number {
        index--;
        if (index < 0) {
            index += this.renderedElems.length;
        }
        return index %= this.renderedElems.length;
    }

    private radAdd(rad: number, dRad: number): number {
        rad += dRad;
        return rad %= 2 * Math.PI;
    }

    private radMinus(rad: number, dRad: number): number {
        rad -= dRad;
        if (rad < 0) {
            rad += 2 * Math.PI;
        }
        return rad %= 2 * Math.PI;
    }

    shiftLeft(): Elem[] {
        let len = this.ellipsisElem.lenRad +
            this.renderedElems[this.headElemIndex].lenRad,
            toAdd = this.indexAdd(this.tailElemIndex),
            rad = this.ellipsisElem.rad;

        this.headElemIndex = this.indexAdd(this.headElemIndex);

        while (len > this.renderedElems[toAdd].lenRad) {
            this.renderedElems[toAdd].setTransform(rad);
            rad = this.radAdd(rad, this.renderedElems[toAdd].lenRad);

            len -= this.renderedElems[toAdd].lenRad;
            toAdd = this.indexAdd(toAdd);
        }
        this.tailElemIndex = this.indexMinus(toAdd);

        this.ellipsisElem.setLocAndSize(rad, len);

        return this.buildShowElems();
    }

    shiftRight(): Elem[] {
        let len = this.ellipsisElem.lenRad +
                this.renderedElems[this.tailElemIndex].lenRad,
            toAdd = this.indexMinus(this.headElemIndex),
            rad = this.ellipsisElem.rad + this.ellipsisElem.lenRad;

        this.tailElemIndex = this.indexMinus(this.tailElemIndex);

        while (len > this.renderedElems[toAdd].lenRad) {
            rad = this.radMinus(rad, this.renderedElems[toAdd].lenRad);
            this.renderedElems[toAdd].setTransform(rad);

            len -= this.renderedElems[toAdd].lenRad;
            toAdd = this.indexMinus(toAdd);
        }
        this.headElemIndex = this.indexAdd(toAdd);

        this.ellipsisElem.setLocAndSize(this.radMinus(rad, len), len);

        return this.buildShowElems();
    }

    config(mode: string, radius: number[], fontSize: number, smallR: number, largeR: number) {
        this.mode = mode;

        if (Configs.CategoryMode === mode) {
            this.dataProcessFn = function (str) {
                return [' ' + str.trim() + ' '];
            };
        } else {
            this.dataProcessFn = this.rangeTitle;
        }

        this.radius = radius;
        this.lineNum = radius.length;
        this.fontSize = fontSize;

        this.calcChineseAngle(fontSize, radius);
        this.calcEnglishAngle();

        this.smallRadius = smallR;
        this.largeRadius = largeR;
    }

    renderCategory(category: string): RenderedText[] {
        let ret: RenderedText[] = [];

        let width = this.countWidth(category), text;
        if (width > 160) {
            category = category.substr(0, ~~(320 / width * category.length));
            let line1 = category.substr(0, category.length / 2);
            ret.push(new RenderedText(0 - this.countWidth(line1) / 2, 0 - this.fontSize * 0.3, line1));

            let line2 = category.substr(category.length / 2);
            ret.push(new RenderedText(0 - this.countWidth(line2) / 2, this.fontSize * 1.5, line2));
        } else {
            ret.push(new RenderedText(0 - width / 2, this.fontSize / 2, category));
        }

        return ret;
    }

    private countWidth(str): number {
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            count += str.charCodeAt(i) < 128 ? this.fontSize / 2 : this.fontSize;
        }
        return count;
    }

    render(data: string[]): Elem[] {

        if (this.mode === Configs.CategoryMode) {
            this.previousCategories = data;
        }

        let self = this, rad = 0, completed = false;

        this.renderedElems = [];
        data.forEach((d, index) => {
            let elem = self.buildElem(d);
            self.renderedElems.push(elem);

            if (completed) {
                return;
            }

            if ((rad + elem.lenRad) > (2 * Math.PI) || ((rad + elem.lenRad) === (2 * Math.PI) && index !== data.length)) {
                self.tailElemIndex = index - 1;
                self.headElemIndex = 0;

                self.ellipsisElem = new Elem(rad, [], false, this.smallRadius, this.largeRadius, 2 * Math.PI - rad);

                completed = true;
            }

            elem.setTransform(completed ? -1 : rad);
            rad += elem.lenRad;
        });

        if (!completed) {
            this.tailElemIndex = this.renderedElems.length - 1;
            this.headElemIndex = 0;
        }

        return this.buildShowElems();
    }

    private buildShowElems(): Elem[] {
        let ret: Elem[] = [];

        // console.log(this.headElemIndex, this.tailElemIndex);

        for (let i = this.headElemIndex; true; i++, i %= this.renderedElems.length) {
            ret.push(this.renderedElems[i]);

            if (i === this.tailElemIndex) {
                break;
            }
        }

        if (this.hasEllipsis()) ret.push(this.ellipsisElem);

        // ret.forEach((r) => {
        //     console.log(r.rad, r.lenRad);
        // });

        return ret;
    }

    private buildElem(str: string): Elem {
        let processedData = this.dataProcessFn(str);
        let maxLen = 0, self = this,
            contents: Content[] = [];

        processedData.forEach((pd, index) => {
            let len = 0;
            for (let i = 0; i < pd.length; i++) {
                contents.push(new Content(len, pd.charAt(i), self.radius[index]));
                len += pd.charCodeAt(i) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
            }

            if (len > maxLen) {
                maxLen = len;
            }
        });

        return new Elem(-1, contents, true, this.smallRadius, this.largeRadius, maxLen);
    }

    private calcChineseAngle(fontSize: number, radius: number[]) {
        let ret: number[] = [];
        for (let i = 0; i < radius.length; i++) {
            ret.push(2 * Math.asin(fontSize / 2 / (radius[i] - fontSize)));
        }
        this.chineseAngle = ret;
    }

    private calcEnglishAngle() {
        let ret: number[] = [];
        for (let i = 0; i < this.chineseAngle.length; i++) {
            ret.push(this.chineseAngle[i] / 2);
        }
        this.englishAngle = ret;
    }

    private calcTotalAngle(str, index): number {
        let ret = 0;
        for (let i = 0; i < str.length; i++) {
            ret += str.charCodeAt(i) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
        }
        return ret;
    }

    private splitToAngle(str, angle, index, reverse): string {
        let count = 0, i;
        if (reverse === undefined || !reverse) {
            for (i = 0; i < str.length; i++) {
                count += str.charCodeAt(i) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
                if (count >= angle) {
                    return str.substr(0, count === angle ? i + 1 : i);
                }
            }
        } else {
            for (i = str.length - 1; i >= 0; i--) {
                count += str.charCodeAt(i) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
                if (count >= angle) {
                    return str.substr(count === angle ? i : i + 1);
                }
            }
        }
        return str;
    }

    private rangeTitle(str): string[] {

        let indexOf = str.indexOf('[]');
        if (indexOf === -1) {
            console.log('error, data format error. lack of "[]" delimiter');
        }

        let ret = str.substr(indexOf + '[]'.length).split('||');
        if (ret.length !== 2) {
            console.log('error, data format error. lack of "||" delimiter');
        }

        ret[0] = ret[0] + ' -';
        str = str.substr(0, indexOf);

        let alpha0 = this.calcTotalAngle(ret[0], this.lineNum- 2);
        let alpha = this.calcTotalAngle(str, this.lineNum- 3);
    
        let ratio = alpha / alpha0, line3, line4, line5;

        if (ratio <= 1) {
            ret = ['', str, ''].concat(ret);
        } else if (ratio <= 2) {
            line4 = this.splitToAngle(str, alpha0, this.lineNum- 4, false);
            ret = ['', line4, str.substr(line4.length)].concat(ret);
        } else if (ratio <= 3) {
            line3 = this.splitToAngle(str, alpha0, this.lineNum- 3, true);
            line4 = this.splitToAngle(str.substr(0, str.length - line3.length), alpha0, this.lineNum- 4, true);
            ret = [str.substr(0, str.length - line3.length - line4.length), line4, line3].concat(ret);
        } else {
            line5 = this.splitToAngle(str, alpha / 3, this.lineNum- 5, false);
            line4 = this.splitToAngle(str.substr(line5.length), alpha / 3, this.lineNum- 4, false);
            ret = [line5, line4, str.substr(line5.length + line4.length)].concat(ret);
        }
    
        return ret.map(function (s) {
            return ' ' + s.trim() + ' ';
        });
    }
}

export class Elem {
    transform: string;
    content: Content[];

    bgFill: string;
    bgD: string;

    rad: number;
    lenRad: number;

    smallR: number;
    largeR: number;

    setTransform(rad: number) {
        this.rad = rad;
        this.transform = 'rotate(' + (rad / Math.PI * 180) + ' 0 0)';
    }

    setLocAndSize(rad: number, lenRad: number) {
        this.setTransform(rad);

        let largeArcFlag = lenRad > Math.PI ? 1 : 0;
        this.bgD = 'M 0,-' + (this.smallR)
            + 'A ' + this.smallR + ',' + this.smallR + ' 0 ' + largeArcFlag + ',1 '
            + (this.smallR * Math.sin(lenRad)) + ',' + (-this.smallR * Math.cos(lenRad))
            + 'L ' + (this.largeR * Math.sin(lenRad)) + ',' + (-this.largeR * Math.cos(lenRad))
            + 'A ' + this.largeR + ',' + this.largeR + ' 0 ' + largeArcFlag + ',0 0,-' + (this.largeR) + 'Z';

        this.lenRad = lenRad;
    }

    constructor(rad: number, content: Content[], isRandomFill: boolean, smallR: number, largeR: number, lenRad: number) {
        if (rad >= 0) this.setTransform(rad);
        this.content = content;

        if (isRandomFill) {
            let fill = (~~((1 << 23) * Math.random())).toString(16);
            fill = '#' + '000000'.substr(fill.length) + fill;
            this.bgFill = fill;
        } else {
            this.bgFill = 'url(#gradient)';
        }

        this.smallR = smallR;
        this.largeR = largeR;

        let largeArcFlag = lenRad > Math.PI ? 1 : 0;
        this.bgD = 'M 0,-' + (smallR)
            + 'A ' + smallR + ',' + smallR + ' 0 ' + largeArcFlag + ',1 '
            + (smallR * Math.sin(lenRad)) + ',' + (-smallR * Math.cos(lenRad))
            + 'L ' + (largeR * Math.sin(lenRad)) + ',' + (-largeR * Math.cos(lenRad))
            + 'A ' + largeR + ',' + largeR + ' 0 ' + largeArcFlag + ',0 0,-' + (largeR) + 'Z';

        this.lenRad = lenRad;
    }
}

export class Content {
    transform: string;
    content: string;
    y: string;

    constructor(rad: number, content: string, radius: number) {
        this.transform = 'rotate(' + (rad / Math.PI * 180) + ' 0 0)';
        this.content = content;
        this.y = '-' + radius;
    }
}

export class RenderedText {
    x: string;
    y: string;
    content: string;

    constructor(x: number, y: number, content: string) {
        this.x = '' + x;
        this.y = '' + y;
        this.content = content;
    }
}
