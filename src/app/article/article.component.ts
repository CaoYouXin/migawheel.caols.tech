import {Component, ViewChild, ElementRef} from "@angular/core";
import {Router} from "@angular/router"
import {ArticleDao} from "./article.dao";
import {DaoUtil} from "../dao/dao.util";

class Configs {
    static nonePrevious = '没有上一篇了';
    static noneNext = '没有下一篇了';
}

@Component({
    selector: 'article',
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css'],
    providers: [ArticleDao, DaoUtil]
})
export class ArticleComponent {

    @ViewChild('body')
    private bodyContainer: ElementRef;

    private footerFixed: boolean;
    private showMenu: boolean;

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

    constructor(private dao: ArticleDao, private router: Router) {}

    private articleLoad(title: string) {
        if (Configs.nonePrevious === title ||
            Configs.noneNext === title) {
            return;
        }

        this.showMenu = true;
        let self = this;
        this.dao.post(title)
            .subscribe(post => {
                self.articleTitle = title;
                self.articleCreateTime = post.create;
                self.articleUpdateTime = post.update;
                self.categoryName = post.category;
                self.articleContent = post.content;
                self.articleScriptSrc = post.script;
            });
    }

    // ng handlers
    ngOnInit() {
        this.articleTitle = window.localStorage.getItem('article');

        this.categoryName = 'Demo';
        this.articleLikeCount = 99;
        this.previousArticle = Configs.nonePrevious;
        this.nextArticle = Configs.noneNext;
        this.top5 = [];

        this.articleLoad(this.articleTitle);
    }

    // dom handlers
    categoryClicked() {
        window.localStorage.setItem('category', this.categoryName);
        let navigate = this.router.navigate(['/category']);
    }

    articleOnload() {
        this.showMenu = false;
        this.footerFixed = this.bodyContainer.nativeElement.offsetHeight < window.innerHeight - 150;
    }

    replyPublishBtnClicked() {
        console.log('评论: ' + this.replyContent);
    }

}
