import {Component, ViewChild, ElementRef} from "@angular/core";
import {Router} from "@angular/router"

@Component({
    selector: 'article',
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css']
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
    private replyFocused: boolean;

    constructor(private router: Router) {}

    // ng handlers
    ngOnInit() {
        this.articleTitle = window.localStorage.getItem('article');

        this.showMenu = true;
        this.categoryName = 'Demo';

        this.articleContent = '<link rel="stylesheet" href="http://caols.tech/a.css">' +
            '<p id="test">Show Or Not</p><button id="testBtn">Do Cmd</button>' +
            '<button onclick="alert(\'hello world\')">hello world</button>';
        this.articleScriptSrc = 'http://caols.tech/a.js';
    }

    // dom handlers
    categoryClicked() {
        window.localStorage.setItem('category', this.categoryName);

        this.router.navigate(['/category']);
    }

    articleOnload() {
        this.showMenu = false;
        this.footerFixed = this.bodyContainer.nativeElement.offsetHeight < window.innerHeight - 100;
    }
}
