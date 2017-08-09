import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, HostListener } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { DaoUtil, API, RestCode } from "../../http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'article',
  templateUrl: 'article.component.html',
  styleUrls: ['article.component.css'],
  providers: []
})
export class ArticleComponent implements OnInit {

  nonePrevious = '没有上一篇了';
  noneNext = '没有下一篇了';
  prefix: string = API.getAPI("server/origin") + '/serve';
  post: any = {};
  previous: any;
  next: any;
  breadcrumb: Array<any> = [];
  height: number = 0;
  loading: boolean = true;
  replyFocused: boolean;
  replyUserName: string;
  replyContent: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dao: DaoUtil,
    private rest: RestCode) {
  }

  @HostListener("window:message", ['$event'])
  receiveMessage(e) {
    if (e.origin !== API.getAPI("server/origin")) {
      return;
    }

    let data = JSON.parse(e.data);
    this.height = data.height;
    this.loading = false;
  }

  private genBreadcrumb(now: Array<any>, cs: Array<any>, idx: number, id): Array<any> {
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

  ngOnInit() {
    const self = this;
    this.route.paramMap
      .switchMap((params: ParamMap) => {
        self.loading = true;
        self.height = 0;

        let post = self.dao.getJSON(API.getAPI("post")(params.get('id')));
        let categories = self.dao.getJSON(API.getAPI("categories"));

        return new Observable<{ post: any, breadcrumb: any }>(subject => {
          post.subscribe(
            ret => self.rest.checkCode(ret, (p) => {
              categories.subscribe(
                ret2 => self.rest.checkCode(ret2, (cs) => {
                  let c = p.BlogCategoryId;
                  let breadcrumb = self.genBreadcrumb([], cs, 0, c);

                  subject.next({
                    post: p,
                    breadcrumb
                  });
                  subject.complete();
                }),
                err2 => DaoUtil.logError(err2)
              );
            }),
            err => DaoUtil.logError(err)
          );
        });
      })
      .subscribe((ret: { post: any, breadcrumb: any }) => {
        self.post = ret.post;
        self.breadcrumb = ret.breadcrumb;

        self.dao.getJSON(API.getAPI("PreviousPost")(self.post.BlogPostUpdateTime)).subscribe(
          ret => this.rest.checkCode(ret, retBody => {
            self.previous = retBody;
          }),
          err => DaoUtil.logError(err)
        );

        self.dao.getJSON(API.getAPI("NextPost")(self.post.BlogPostUpdateTime)).subscribe(
          ret => this.rest.checkCode(ret, retBody => {
            self.next = retBody;
          }),
          err => DaoUtil.logError(err)
        );

        setTimeout(() => {
          if (!self.loading) {
            return;
          }

          self.loading = false;
          self.height = 500;
        }, 3000);
      });
  }

  toPost(p) {
    this.router.navigate(['/post', '' + p.BlogPostId]);
  }

  toCategory(bc) {
    this.router.navigate(['/category', '' + bc.BlogCategoryId]);
  }

  like() {
    this.dao.getJSON(API.getAPI("like")(this.post.BlogPostId)).subscribe(
      ret => this.rest.checkCode(ret, retBody => {
        console.log(retBody);
      }),
      err => DaoUtil.logError(err)
    );
  }

  replyCommentBtnClicked() {
    console.log('回复');
  }

  resetReplyUserName() {

  }

  replyPublishBtnClicked() {
    console.log(this.replyContent);
  }

}
