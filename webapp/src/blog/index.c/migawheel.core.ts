import { Injectable } from "@angular/core";

export class Configs {
  static PostMode: any = {
    smallRadius: 100,
    largeRadius: 250
  };
  static CategoryMode: any = {
    smallRadius: 100,
    largeRadius: 150
  };
}

const configChineseAngle = (fontSize, radius) => {
  let ret: number[] = [];
  for (let i = 0; i < radius.length; i++) {
    ret.push(2 * Math.atan(fontSize / 2 / (radius[i] - fontSize)));
  }
  return ret;
};

const configEnglishAngle = (chineseAngle) => {
  let ret: number[] = [];
  for (let i = 0; i < chineseAngle.length; i++) {
    ret.push(chineseAngle[i] / 2);
  }
  return ret;
}

@Injectable()
export class MigaWheelCore {

  private radius: number[] = [220, 195, 170, 145, 120];
  private lineNum: number = this.radius.length;
  private fontSize: number = 16;

  private chineseAngle: number[] = configChineseAngle(this.fontSize, this.radius);
  private englishAngle: number[] = configEnglishAngle(this.chineseAngle);

  private renderedElems: Elem[];
  private headElemIndex: number;
  private tailElemIndex: number;
  private ellipsisElem: Elem;

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

  toCoreHistory(): CoreHistory {
    return new CoreHistory(this.renderedElems, this.headElemIndex, this.tailElemIndex, this.ellipsisElem);
  }

  fromCoreHistory(history: CoreHistory) {
    this.renderedElems = history.renderedElems;
    this.headElemIndex = history.headElemIndex;
    this.tailElemIndex = history.tailElemIndex;
    this.ellipsisElem = history.ellipsisElem;
  }

  render(data: any[]): Elem[] {
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

        self.ellipsisElem = new Elem(rad, [], false, Configs.PostMode.smallRadius, Configs.PostMode.largeRadius, 2 * Math.PI - rad, null);

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

  buildShowElems(): Elem[] {
    let ret: Elem[] = [];

    for (let i = this.headElemIndex; true; i++ , i %= this.renderedElems.length) {
      ret.push(this.renderedElems[i]);

      if (i === this.tailElemIndex) {
        break;
      }
    }

    if (this.hasEllipsis()) ret.push(this.ellipsisElem);

    return ret;
  }

  private buildElem(datum: any): Elem {
    let maxLen = 0, self = this, contents: Content[] = [], processedData = [];

    if (!datum.isPost) {
      processedData.push(' ' + datum.BlogCategoryName.trim() + ' ');
    } else {
      processedData = this.rangeTitle(datum);
    }

    processedData.forEach((pd, index) => {
      if (!datum.isPost) {
        index = this.lineNum - index - 1;
      }

      let len = 0;
      for (let i = 0; i < pd.length; i++) {
        let wordAngle = pd.charCodeAt(i) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
        contents.push(new Content(len + wordAngle / 2, pd.charAt(i), self.radius[index],
          pd.charCodeAt(i) < 128 ? self.fontSize / 2 : self.fontSize));
        len += wordAngle;
      }

      if (len > maxLen) {
        maxLen = len;
      }
    });

    if (!datum.isPost) {
      return new Elem(-1, contents, true, Configs.CategoryMode.smallRadius, Configs.CategoryMode.largeRadius, maxLen, datum);
    } else {
      return new Elem(-1, contents, true, Configs.PostMode.smallRadius, Configs.PostMode.largeRadius, maxLen, datum);
    }
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

  private calcSpaceAngle(index) {
    return ' '.charCodeAt(0) < 128 ? this.englishAngle[index] : this.chineseAngle[index];
  }

  private rangeTitle(datum): string[] {
    let ret = [datum.BlogPostCreateTime.substr(0, '2017-08-08'.length) + ' -', datum.BlogPostUpdateTime.substr(0, '2017-08-08'.length)];
    ret = ret.map(function (s) {
      return ' ' + s.trim() + ' ';
    });
    let str = datum.BlogPostName.trim();

    let alpha0 = Math.max(this.calcTotalAngle(ret[0], this.lineNum - 2), this.calcTotalAngle(ret[1], this.lineNum - 1));
    let alpha = this.calcTotalAngle(' ' + str + ' ', this.lineNum - 4);

    let ratio = alpha / alpha0, line3, line4, line5;

    if (ratio <= 1) {
      ret = ['  ', ' ' + str + ' ', '  '].concat(ret);
      return ret;
    }

    if (ratio <= 2) {
      line4 = this.splitToAngle(' ' + str + ' ', alpha0 - this.calcSpaceAngle(this.lineNum - 4), this.lineNum - 4, false);
      ret = ['  ', line4 + ' ', ' ' + str.substr(line4.length - 1) + ' '].concat(ret);
      return ret;
    }

    if (ratio <= 3) {
      line3 = this.splitToAngle(' ' + str + ' ', alpha0 - this.calcSpaceAngle(this.lineNum - 3), this.lineNum - 3, true);
      line4 = this.splitToAngle(' ' + str.substr(0, str.length - line3.length + 1) + ' ',
        alpha0 - this.calcSpaceAngle(this.lineNum - 4), this.lineNum - 4, true);
      ret = [' ' + str.substr(0, str.length - line3.length - line4.length + 2) + ' ', line4 + ' ', line3 + ' '].concat(ret);
      return ret;
    }


    line5 = this.splitToAngle(' ' + str + ' ', alpha0 - this.calcSpaceAngle(this.lineNum - 5), this.lineNum - 5, false);
    line4 = this.splitToAngle(' ' + str.substr(line5.length - 1) + ' ', alpha0 - this.calcSpaceAngle(this.lineNum - 4),
      this.lineNum - 4, false);
    line3 = this.splitToAngle(' ' + str.substr(line5.length + line4.length - 2) + ' ',
      alpha0 - this.calcSpaceAngle(this.lineNum - 3), this.lineNum - 3, false);
    ret = [line5 + ' ', line4 + ' ', line3 + ' '].concat(ret);
    return ret;
  }
}

export class Elem {
  source: any;

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

  constructor(rad: number, content: Content[], isRandomFill: boolean, smallR: number, largeR: number, lenRad: number, source: any) {
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

    this.source = source;
  }
}

export class Content {
  transform: string;
  content: string;
  y: string;
  x: string;

  constructor(rad: number, content: string, radius: number, width: number) {
    this.transform = 'rotate(' + (rad / Math.PI * 180) + ' 0 0)';
    this.content = content;
    this.y = '-' + radius;
    this.x = '-' + (width / 2);
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

export class CoreHistory {

  renderedElems: Elem[];
  headElemIndex: number;
  tailElemIndex: number;
  ellipsisElem: Elem;

  constructor(renderedElems: Elem[], headElemIndex: number, tailElemIndex: number, ellipsisElem: Elem) {
    this.renderedElems = renderedElems;
    this.headElemIndex = headElemIndex;
    this.tailElemIndex = tailElemIndex;
    this.ellipsisElem = ellipsisElem;
  }

}
