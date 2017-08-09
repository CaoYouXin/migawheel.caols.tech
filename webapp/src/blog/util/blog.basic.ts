export class BlogBasicUtil {

  static genBreadcrumb(now: Array<any>, cs: Array<any>, idx: number, id): Array<any> {
    if (idx >= cs.length) {
      throw 'index out of range';
    }

    let c = cs[idx];
    now = [...now, c];

    if (c.BlogCategoryId + '' === id + '') {
      return now;
    }

    let cc = cs[idx].ChildCategories || [];
    if (!cc.length) {
      now.pop();
      return now;
    }

    let cIdx = 0, newNow = [];
    while (cIdx < cc.length) {
      newNow = this.genBreadcrumb(now, cc, cIdx++, id);
      if (newNow.length > now.length) {
        break;
      }
    }

    if (newNow.length > now.length) {
      return newNow;
    } else {
      now.pop();
      return now;
    }
  }

}