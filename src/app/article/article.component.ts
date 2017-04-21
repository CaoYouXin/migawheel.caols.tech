import {Component, ViewChild, ElementRef} from "@angular/core";

@Component({
    selector: 'article',
    templateUrl: 'article.component.html',
    styleUrls: ['article.component.css']
})
export class ArticleComponent {
    private menuTransform: string;
    private bannerTransparent: boolean;

    @ViewChild('articleContent')
    private articleContent: ElementRef;

    private replyFocused: boolean;

    replaceMenu(showMenu: boolean) {
        this.bannerTransparent = !showMenu;
        this.menuTransform = showMenu ? null : (window.innerWidth > window.innerHeight ? 'left' : 'right');
    }

    // ng handlers
    ngOnInit() {
        this.replaceMenu(true);

        this.articleContent.nativeElement.innerHTML = '<style>#test.hidden{display:none;}</style>' +
            '<p id="test">Show Or Not</p><button id="testBtn">Do Cmd</button>' +
            '<button onclick="alert(\'hello world\')">hello world</button>';

        let self = this;
        let scriptElem = document.createElement('script');
        scriptElem.src = 'http://caols.tech/a.js';
        scriptElem.onload = function() {
            self.replaceMenu(false);
        };
        this.articleContent.nativeElement.appendChild(scriptElem);
    }

    // dom handlers
    menuClicked() {
        this.bannerTransparent = !this.bannerTransparent;
        this.replaceMenu(!this.bannerTransparent);
    }
}
