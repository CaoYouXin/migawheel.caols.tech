import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { DaoUtil, API, RestCode, UserService } from "../../http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import 'rxjs/add/operator/switchMap';
import { BlogBasicUtil } from '../util';

@Component({
  selector: 'article',
  templateUrl: './article.component.html',
  styleUrls: ['../util/blog.basic.css', './article.component.css'],
  providers: []
})
export class ArticleComponent implements OnInit {

  nonePrevious = '没有上一篇了';
  noneNext = '没有下一篇了';

  post: any = {
    BlogPostUrl: '/'
  };
  previous: any;
  next: any;
  breadcrumb: Array<any> = [];
  replyFocused: boolean;
  replyComment: any;
  replyCommentIdx: number = -1;
  replyContent: string;
  comments: Array<any> = [];
  liked: boolean;

  @ViewChild("reply")
  reply: ElementRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dao: DaoUtil,
    private rest: RestCode) {
  }

  ngOnInit() {
    const self = this;
    this.route.paramMap
      .switchMap((params: ParamMap) => {
        const id = params.get('id');
        let post = self.dao.getJSON(API.getAPI("post")(id));
        let categories = self.dao.getJSON(API.getAPI("categories"));
        let comments = self.dao.getJSON(API.getAPI("FetchComments")(id));
        let liked = self.dao.getJSON(API.getAPI("liked")(id));

        return new Observable<{ post: any, breadcrumb: any, comments: Array<any>, liked: boolean }>(subject => {
          Observable.zip(post, categories, comments, liked).subscribe(
            rets => {
              let next: any = {};
              rets.forEach((ret, idx) => self.rest.checkCode(ret, retBody => {
                switch (idx) {
                  case 0:
                    next.post = retBody;
                    next.BlogCategoryId = retBody.BlogCategoryId;
                    break;
                  case 1:
                    next.breadcrumb = BlogBasicUtil.genBreadcrumb([], retBody, next.BlogCategoryId);
                    break;
                  case 2:
                    next.comments = retBody;
                    break;
                  case 3:
                    next.liked = retBody;
                    break;
                  default:
                    throw new Error(idx + ' not handled.');
                }
              }));
              subject.next(next);
              subject.complete();
            },
            err => DaoUtil.logError(err)
          );
        });
      })
      .subscribe((ret: { post: any, breadcrumb: any, comments: Array<any>, liked: boolean }) => {
        self.post = ret.post;
        self.breadcrumb = ret.breadcrumb;
        self.comments = ret.comments;
        self.liked = ret.liked;

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
      });
  }

  toPost(p) {
    this.router.navigate(['/post', '' + p.BlogPostId]);
  }

  toCategory(bc) {
    this.router.navigate(['/category', '' + bc.BlogCategoryId]);
  }

  toHome() {
    this.router.navigate(['/']);
  }

  like() {
    const self = this;
    this.dao.getJSON(API.getAPI("like")(this.post.BlogPostId)).subscribe(
      ret => this.rest.checkCode(ret, retBody => {
        if (retBody) {
          self.liked = true;
          alert('操作成功！');
        }
      }),
      err => DaoUtil.logError(err)
    );
  }

  replyCommentBtnClicked(c, cc, idx) {
    this.replyComment = cc || c;
    this.replyCommentIdx = idx;
    this.reply.nativeElement.focus();
  }

  resetReplyComment() {
    this.replyComment = null;
    this.replyCommentIdx = -1;
  }

  replyPublishBtnClicked() {
    const content = this.replyContent;
    if (!content) {
      return;
    }

    const user = UserService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const self = this;
    this.dao.postJSON(API.getAPI("Comment"), {
      BlogPostId: self.post.BlogPostId,
      WriterUserId: user.UserId,
      CommentContent: content,
      ParentCommentId: !this.replyComment ? 0 : this.replyComment.ParentCommentId || this.replyComment.CommentId,
      CommenteeUserId: !this.replyComment ? 0 : this.replyComment.WriterUserId
    }).subscribe(
      ret => self.rest.checkCode(ret, retBody => {
        retBody.WriterName = user.UserName;

        if (-1 === this.replyCommentIdx) {
          self.comments = [retBody, ...self.comments];
        } else {
          const cc = self.comments[this.replyCommentIdx];
          cc.Leafs = cc.Leafs || [];
          cc.Leafs = [retBody, ...cc.Leafs];
        }

        this.replyContent = '';
      }),
      err => DaoUtil.logError(err)
      );
  }

}
