import {Component, ViewChild, ElementRef} from "@angular/core"
import {Router} from "@angular/router";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {CategoryDao} from "./category.dao";
import {DaoUtil} from "../dao/dao.util";

@Component({
    selector: 'category',
    templateUrl: 'category.component.html',
    styleUrls: ['category.component.css'],
    providers: [CategoryDao, DaoUtil]
})
export class CategoryComponent {

    constructor(private dao: CategoryDao,
                private router: Router,
                private sanitizer: DomSanitizer) {}

    @ViewChild('body')
    private bodyContainer: ElementRef;

    private footerFixed: boolean;
    private showMenu: boolean;

    private categoryTitle: string;

    private articleContent: string;
    private articleScriptSrc: string;

    private imageListItemBackgroundSize: string;
    private imageList: ListItem[];
    private noneImageList: ListItem[];

    private pagerTotalCount: number;
    private pagerPageSize: string;
    private pagerCurrentPage: number;

    // ng handlers
    ngOnInit() {
        this.pagerTotalCount = 10;

        this.showMenu = true;
        this.categoryTitle = window.localStorage.getItem('category');

        this.dao.html('http://caols.tech/a.html')
            .subscribe(html => {
                this.articleContent = html;
                this.articleScriptSrc = 'http://caols.tech/a.js';
            });

        this.imageListItemBackgroundSize = 'contain';
        let item = new ListItem();
        item.imageSrc = this.sanitizer.bypassSecurityTrustStyle('url("http://caols.tech/demos/1492848706508.png")');
        item.title = '标题';
        item.brief = '一个人的情绪受环境的影响，这是很正常的，但你苦着脸，一副苦大仇深的样子，对处境并不会有任何的改变，相反，如果微笑着去生活，那会增加亲和力，别人更乐于跟你交往，得到的机会也会更多。';
        // this.imageList = [item, JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item))];
        // this.noneImageList = [item, JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item))];
    }

    // dom handlers
    articleOnload() {
        this.showMenu = false;
        this.footerFixed = this.bodyContainer.nativeElement.offsetHeight < window.innerHeight - 100;
    }

    noneImageListItemClicked(e) {
        window.localStorage.setItem('article', e.target.parentElement.firstElementChild.innerHTML);
        this.router.navigate(['/article']);
    }

    pagerInfoChange(e) {
        let split = e.split('@');
        this.pagerCurrentPage = parseInt(split[0]);
        this.pagerPageSize = split[1];
    }
}

export class ListItem {
    title: string;
    brief: string;
    imageSrc: SafeStyle;
}
