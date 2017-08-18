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

        return new Observable<{ post: any, breadcrumb: any, comments: Array<any> }>(subject => {
          post.subscribe(
            ret => self.rest.checkCode(ret, (p) => {
              categories.subscribe(
                ret2 => self.rest.checkCode(ret2, (cs) => {
                  let c = p.BlogCategoryId;
                  let breadcrumb = BlogBasicUtil.genBreadcrumb([], cs, c);

                  comments.subscribe(
                    ret3 => self.rest.checkCode(ret3, (cms) => {
                      subject.next({
                        post: p,
                        breadcrumb,
                        comments: cms
                      });
                      subject.complete();
                    }),
                    err3 => DaoUtil.logError(err3)
                  );
                }),
                err2 => DaoUtil.logError(err2)
              );
            }),
            err => DaoUtil.logError(err)
          );
        });
      })
      .subscribe((ret: { post: any, breadcrumb: any, comments: Array<any> }) => {
        self.post = ret.post;
        self.breadcrumb = ret.breadcrumb;
        self.comments = ret.comments;

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

  like() {
    this.dao.getJSON(API.getAPI("like")(this.post.BlogPostId)).subscribe(
      ret => this.rest.checkCode(ret, retBody => {
        alert(retBody);
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
