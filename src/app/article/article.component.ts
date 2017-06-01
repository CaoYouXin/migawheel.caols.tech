import {Component, ElementRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {ArticleDao} from "./article.dao";
import {DaoUtil} from "../dao/dao.util";
import {PostUnload} from "../common/post.unload";
import {URIUtil} from "../route/uri.util";

class Configs {
    static nonePrevious = '没有上一篇了';
    static noneNext = '没有下一篇了';
}

@Component({
    selector: 'article',
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css'],
    providers: [ArticleDao, DaoUtil, PostUnload]
})
export class ArticleComponent {

    @ViewChild('body')
    private bodyContainer: ElementRef;

    private postId: number;

    private footerFixed: boolean;
    private showMenu: boolean;
    private loading: boolean;

    private articleContent: string;
    private articleScriptSrc: string;

    private articleTitle: string;
    private categoryName: string;
    private articleLikeCount: number;
    private articleCreateTime: string;
    private articleUpdateTime: string;
    private previousArticle: string;
    private nextArticle: string;
    private top5: string[];

    private replyFocused: boolean;
    private replyContent: string;

    private comments: Array<any>;

    constructor(private dao: ArticleDao,
                private router: Router,
                private unload: PostUnload) {
    }

    private articleLoad(title: string) {
        if (Configs.nonePrevious === title ||
            Configs.noneNext === title) {
            return;
        }

        this.unload.unload(null);
        this.loading = true;
        this.showMenu = true;
        let self = this;
        this.dao.post(title)
            .subscribe(post => {
                self.postId = post.postId;
                self.articleTitle = title;
                self.articleCreateTime = post.create;
                self.articleUpdateTime = post.update;
                self.categoryName = post.categoryName;
                self.articleContent = post.content;
                self.articleScriptSrc = post.script;
                self.articleLikeCount = post.articleLikeCount;
            }, error => DaoUtil.logError(error));
    }

    // ng handlers
    ngOnInit() {
        this.articleTitle = URIUtil.getParam(this.router.routerState.snapshot.url, ['n'])['n'];

        this.categoryName = 'Demo';
        this.articleLikeCount = 99;
        this.previousArticle = Configs.nonePrevious;
        this.nextArticle = Configs.noneNext;
        this.top5 = [];

        this.articleLoad(this.articleTitle);
    }

    // dom handlers
    like() {
        const self = this;
        this.dao.like(this.postId)
            .subscribe(ret =>
                DaoUtil.process(ret, function (articleLikeCount) {
                    self.articleLikeCount = articleLikeCount;
                }), error => DaoUtil.logError(error)
            );
    }

    categoryClicked() {
        this.unload.unload(null);
        let navigate = this.router.navigate(['/category', {n: this.categoryName}]);
    }

    articleOnload() {
        this.loading = false;
        this.showMenu = false;
        this.footerFixed = this.bodyContainer.nativeElement.offsetHeight < window.innerHeight - 150;

        const self = this;
        this.dao.fetchComments(this.postId)
            .subscribe(ret =>
                DaoUtil.process(ret, function (comments) {
                    self.comments = comments;
                }), error => DaoUtil.logError(error)
            );
    }

    replyPublishBtnClicked() {
        if (!Boolean(this.replyContent)) {
            alert("请写下评论！");
            return;
        }

        const self = this;
        this.dao.commentPost(this.postId, this.replyContent)
            .subscribe(ret =>
                DaoUtil.process(ret, function (comment) {
                    let reverse = self.comments.reverse();
                    reverse.push(comment);
                    self.comments = reverse.reverse();
                    self.replyContent = '';
                }), error => DaoUtil.logError(error)
            );
    }

    makeComment(comment, follow) {

    }

}
