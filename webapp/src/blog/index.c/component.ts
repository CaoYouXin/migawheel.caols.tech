import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Elem, Content, RenderedText, CoreHistory, MigaWheelCore } from "./migawheel.core";
import { API, DaoUtil, RestCode } from "../../http";

@Component({
  selector: '',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  providers: [MigaWheelCore]
})
export class BlogIndexComponent implements OnInit {

  loading: boolean;
  clickEffect: boolean;
  searchFocused: boolean;
  searchHintsShow: boolean;
  categorySelected: boolean;
  elemsTransform: string;
  searchText: string;
  allPosts: Array<any>;
  selectedHint: number;

  firstKeyUp: boolean = false;
  hints: Array<any> = [];
  elems: Array<Elem> = [];
  renderedCategory: Array<RenderedText> = [];

  private categories: any;
  private history: History;
  private svgMoving: boolean;
  private svgCanMove: boolean;
  private daCount: number = 0;
  private lastAngle: number;

  constructor(private core: MigaWheelCore,
    private dao: DaoUtil,
    private rest: RestCode,
    private router: Router) { }

  private furtherRender(data, cate) {
    const self = this;

    if (!data.length) {
      alert('没有条目了！');
      return;
    }

    self.history = new History(self.history, self.core.toCoreHistory(), self.renderedCategory);

    self.render(data);

    self.categorySelected = true;
    self.renderedCategory = self.core.renderCategory(cate);
  }

  private openCategory(category, cb) {
    const self = this;

    let data = self.renderCategory(category.BlogCategoryId);

    self.dao.getJSON(API.getAPI("posts")(category.BlogCategoryId)).subscribe(
      ret => this.rest.checkCode(ret, (retBody) => {
        if (!!cb) cb();

        retBody.forEach(p => p.isPost = true);

        self.furtherRender([...data, ...retBody], category.BlogCategoryName);
      }),
      err => DaoUtil.logError(err)
    );
  }

  private openPost(post) {
    switch (post.BlogPostType) {
      case 2:
        this.router.navigate(['/post', '' + post.BlogPostId]);
        return;
      case 1:
      default:
        window.open(post.BlogPostUrl, '_blank');
        return;
    }
  }

  private findAll(regExp: RegExp, ret: Array<any>, array: Array<any>) {
    array.forEach(c => {
      if (regExp.test(c.BlogCategoryName)) {
        ret.push(c);
      }

      if (!!c.ChildCategories && c.ChildCategories.length) {
        this.findAll(regExp, ret, c.ChildCategories);
      }
    });

    return ret;
  }

  private search(cmd: string): { c: Array<any>, p: Array<any> } {
    if (!this.allPosts || !this.allPosts.length || !this.categories || !this.categories.length || !cmd) {
      return {
        c: [],
        p: []
      };
    }

    let regExp = new RegExp(cmd.replace(/\s+/g, '|'));

    return {
      c: this.findAll(regExp, [], this.categories).map(c => { c.isPost = false; return c; }),
      p: this.allPosts.filter(post => {
        return regExp.test(post.BlogPostName)
          || regExp.test(post.BlogPostCreateTime)
          || regExp.test(post.BlogPostUpdateTime);
      }).map(p => { p.isPost = true; return p; })
    };
  }

  private searchHintsReset(show: boolean) {
    this.selectedHint = -1;
    this.hints = [];
    this.searchHintsShow = show || false;
  }

  private searchHintsUpdate(searchStr: string) {
    this.searchHintsReset(true);

    let ret = this.search(searchStr);
    if (ret.c.length + ret.p.length > 5) {
      this.hints = [...ret.c.slice(0, 2), ...ret.p.slice(0, 5 - Math.min(2, ret.c.length))];
      return;
    }

    this.hints = [...ret.c, ...ret.p];
  }

  private searchHintsSelect(cmd: string) {
    let newIndex = this.selectedHint + (cmd === 'ArrowUp' ? -1 : 1);

    if (newIndex > -1 && newIndex < this.hints.length) {
      this.selectedHint = newIndex;
    }
  }

  private searchHintClicked(hint: any) {
    if (!hint.isPost) {
      this.openCategory(hint, () => this.searchHintsReset(false));
    } else {
      this.searchHintsReset(false);
      this.openPost(hint);
    }
  }

  private searchInputKeyEnterUp(value: string) {
    if (-1 !== this.selectedHint) {
      let hint = this.hints[this.selectedHint];
      this.searchHintClicked(hint);
      return;
    }

    this.searchHintsReset(false);

    let ret = this.search(value);

    this.furtherRender([...ret.c, ...ret.p], '搜索结果');
  }

  private searchInputKeyBackspaceUp(value: string) {
    if (!value || value === '') {
      this.firstKeyUp = true;
      this.searchHintsReset(false);
    } else {
      this.searchHintsUpdate(value);
    }
  }

  private calcAngle(e) {
    let dx = e.pageX - window.innerWidth / 2;
    let dy = e.pageY - window.innerHeight / 2;

    let angle = Math.acos(dx / Math.sqrt(dx * dx + dy * dy));
    if (dy > 0) {
      angle = 2 * Math.PI - angle;
    }

    return angle;
  }

  private render(data: any[]) {
    if (!data.length) {
      alert('没有条目了！');
      return;
    }

    this.elemsTransform = 'translate(250,250) rotate(0 0 0)';
    this.elems = this.core.render(data);
  }

  private renderCategory(id) {
    if (null === id) {
      this.categories.forEach(c => c.isPost = false);
      return this.categories;
    }

    let ret = this.recursiveMatch(this.categories, id);
    ret.forEach(c => c.isPost = false);
    return ret;
  }

  private recursiveMatch(array, id) {
    if (null === array) {
      return [];
    }

    for (var i = 0; i < array.length; i++) {
      var element = array[i];
      if (element.BlogCategoryId + '' === id + '') {
        return element.ChildCategories || [];
      }
    }

    return this.recursiveMatch(element.ChildCategories || null, id);
  }

  ngOnInit() {
    const self = this;

    this.loading = true;
    this.dao.getJSON(API.getAPI("categories")).subscribe(
      ret => self.rest.checkCode(ret, (retBody) => {
        self.loading = false;
        self.categories = retBody;
        self.render([...self.renderCategory(null)]);
      }),
      err => DaoUtil.logError(err)
    );

    this.dao.getJSON(API.getAPI("all/posts")).subscribe(
      ret => self.rest.checkCode(ret, (retBody) => {
        self.allPosts = retBody;
      }),
      err => DaoUtil.logError(err)
    );
  }

  searchKeyUp(e) {
    if (this.firstKeyUp) {
      this.searchHintsReset(true);
      this.firstKeyUp = false;
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        this.searchHintsSelect(e.key);
        break;
      case 'Enter':
        this.searchInputKeyEnterUp(this.searchText);
        break;
      case 'Backspace':
        this.searchInputKeyBackspaceUp(this.searchText);
        break;
      default:
        this.searchHintsUpdate(this.searchText);
        return;
    }
  }

  searchFocus(e) {
    this.searchFocused = true;

    if (this.searchText) {
      this.searchHintsUpdate(this.searchText);
    }
  }

  searchClicked(e, hint) {
    this.searchHintClicked(hint);
  }

  svgMouseDown(e) {
    if (1 === e.buttons) {
      this.lastAngle = this.calcAngle(e);
      this.svgMoving = false;
      this.svgCanMove = true;
    }
  }

  svgMouseUp(e) {
    this.svgCanMove = false;
  }

  svgMouseMove(e) {
    if (!this.svgCanMove) {
      return;
    }
    this.svgMoving = true;

    let angle = this.calcAngle(e);
    let da = angle - this.lastAngle;
    if (da < -Math.PI) {
      da += 2 * Math.PI;
    } else if (da > Math.PI) {
      da -= 2 * Math.PI;
    }

    this.elemsTransform = this.elemsTransform.replace(/rotate\((\S+) /, function ($0, $1) {
      return 'rotate(' + (parseFloat($1) - da / Math.PI * 180) + ' ';
    });

    this.daCount -= da;
    if (Math.abs(this.daCount) / Math.PI >= .25 && this.core.hasEllipsis()) {

      if (this.daCount < 0) {

        this.elems = this.core.shiftLeft();
      } else {

        this.elems = this.core.shiftRight();
      }

      this.daCount = 0;
    }

    this.lastAngle = angle;
  }

  leftClicked(e) {
    if (this.svgMoving) {
      return;
    }

    this.loading = true;
    this.clickEffect = true;
    setTimeout((self) => {
      self.loading = false;
      self.clickEffect = false;
      window.open('https://github.com/CaoYouXin', '_blank');
    }, 1000, this);
  }

  rightClicked(e) {
    if (this.svgMoving) {
      return;
    }

    this.loading = true;
    this.clickEffect = true;
    setTimeout((self) => {
      self.loading = false;
      self.clickEffect = false;
      window.open('http://demo.caols.tech/profile/index.html', '_blank');
    }, 1000, this);
  }

  elemClicked(e, elem) {
    if (this.svgMoving) {
      return;
    }

    if (!elem.source) {
      return null;
    }

    this.loading = true;
    this.clickEffect = true;
    setTimeout((self) => {
      self.clickEffect = false;

      if (!elem.source.isPost) {
        self.openCategory(elem.source, () => self.loading = false);
      } else {
        self.loading = false;
        self.openPost(elem.source);
      }

    }, 1000, this);
  }

  backClicked(e) {
    if (this.svgMoving) {
      return;
    }

    if (!this.history) {
      return;
    }

    this.loading = true;
    this.clickEffect = true;
    setTimeout((self) => {
      self.loading = false;
      self.clickEffect = false;

      self.core.fromCoreHistory(self.history.coreHistory);
      self.elems = self.core.buildShowElems();
      self.renderedCategory = self.history.cate;

      self.history = self.history.parent;
      if (!self.history) {
        self.categorySelected = false;
      }
    }, 1000, this);
  }

}

class History {

  parent: History;
  coreHistory: CoreHistory;
  cate: RenderedText[];

  constructor(parent: History, coreHistory: CoreHistory, cate: RenderedText[]) {
    this.parent = parent;
    this.coreHistory = coreHistory;
    this.cate = cate;
  }

}