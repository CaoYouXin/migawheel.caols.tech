import { Component, OnInit } from "@angular/core"
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { DaoUtil, API, RestCode } from "../../http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import 'rxjs/add/operator/switchMap';
import { BlogBasicUtil } from "../util";

@Component({
  selector: 'category',
  templateUrl: './category.component.html',
  styleUrls: ['../util/blog.basic.css', './category.component.css'],
  providers: []
})
export class CategoryComponent implements OnInit {

  prefix: string = API.getAPI("server/origin") + '/serve';
  category: any = {
    BlogCategoryUrl: '/'
  };
  breadcrumb: Array<any> = [];
  posts: Array<any> = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dao: DaoUtil,
    private rest: RestCode) {
  }

  ngOnInit() {
    const self = this;
    this.route.paramMap
      .switchMap((params: ParamMap) => {
        let c = params.get('id');
        let cs = self.dao.getJSON(API.getAPI("categories"));
        let posts = self.dao.getJSON(API.getAPI("posts")(c));

        return new Observable<{ category: any, breadcrumb: Array<any>, posts: Array<any> }>(subject => {
          cs.subscribe(
            ret => self.rest.checkCode(ret, retBody => {
              let breadcrumb = BlogBasicUtil.genBreadcrumb([], retBody, 0, c);

              posts.subscribe(
                ret2 => self.rest.checkCode(ret2, retBody2 => {
                  subject.next({
                    breadcrumb,
                    category: breadcrumb[breadcrumb.length - 1],
                    posts: retBody2
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
      .subscribe((ret: { category: any, breadcrumb: Array<any>, posts: Array<any> }) => {
        self.breadcrumb = ret.breadcrumb;
        self.category = ret.category;
        self.posts = ret.posts;
      });
  }

  toPost(p) {
    switch (p.BlogPostType) {
      case 2:
        this.router.navigate(['/post', '' + p.BlogPostId]);
        return;
      case 1:
      default:
        window.open(p.BlogPostUrl, '_blank');
        return;
    }
  }

  toCategory(bc) {
    this.router.navigate(['/category', '' + bc.BlogCategoryId]);
  }

}
