export class BlogBasicUtil {

  static genBreadcrumb(now: Array<any>, cs: Array<any>, id): Array<any> {

    for (let i = 0; i < cs.length; i++) {
      let c = cs[i];
      now = [...now, c];

      if (c.BlogCategoryId + '' === id + '') {
        return now;
      }

      let cc = c.ChildCategories || [];
      if (!cc.length) {
        now.pop();
        continue;
      }

      let newNow = this.genBreadcrumb(now, cc, id);
      if (newNow.length > now.length) {
        return newNow;
      } else {
        now.pop();
      }
    }
    return now;

  }

}