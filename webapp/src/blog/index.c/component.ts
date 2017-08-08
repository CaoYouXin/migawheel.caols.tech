import { Component, OnInit } from "@angular/core";
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

  hints: Array<any> = [];
  elems: Array<Elem> = [];
  renderedCategory: Array<RenderedText> = [];

  private categories: any;
  private history: History;
  private svgMoving: boolean;
  private daCount: number = 0;
  private lastAngle: number;

  constructor(private core: MigaWheelCore,
    private dao: DaoUtil,
    private rest: RestCode) { }

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
    this.loading = true;
    this.dao.getJSON(API.getAPI("categories")).subscribe(
      ret => this.rest.checkCode(ret, (retBody) => {
        this.loading = false;
        this.categories = retBody;
        this.render([...this.renderCategory(null)]);
      }),
      err => DaoUtil.logError(err)
    );
  }

  searchKeyUp(e) {

  }

  searchFocus(e) {
    this.searchFocused = true;
  }

  searchClicked(e, hint) {

  }

  svgMouseDown(e) {
    if (1 === e.buttons) {
      this.lastAngle = this.calcAngle(e);
      this.svgMoving = true;
    }
  }

  svgMouseMove(e) {
    if (!this.svgMoving) {
      return;
    }

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

  svgMouseUp(e) {
    this.svgMoving = false;
  }

  leftClicked(e) {
    if (this.svgMoving) {
      this.svgMoving = false;
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
      this.svgMoving = false;
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
      this.svgMoving = false;
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
        let data = self.renderCategory(elem.source.BlogCategoryId);

        self.dao.getJSON(API.getAPI("posts")(elem.source.BlogCategoryId)).subscribe(
          ret => this.rest.checkCode(ret, (retBody) => {
            self.loading = false;

            retBody.forEach(p => p.isPost = true);
            data = [...data, ...retBody];

            if (!data.length) {
              alert('没有条目了！');
              return;
            }
            self.history = new History(self.history, self.core.toCoreHistory(), self.renderedCategory);

            self.render(data);

            self.categorySelected = true;
            self.renderedCategory = self.core.renderCategory(elem.source.BlogCategoryName);
          }),
          err => DaoUtil.logError(err)
        );
      } else {

      }

    }, 1000, this);
  }

  backClicked(e) {
    if (this.svgMoving) {
      this.svgMoving = false;
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