import {Component, ViewChild, ElementRef} from "@angular/core"
import {Router} from "@angular/router";
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {CategoryDao, ListItem} from "./category.dao";
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

    private categoryName: string;
    private categoryLikeCount: number;
    private categoryCreateTime: string;
    private categoryUpdateTime: string;

    private categoryContent: string;
    private categoryScriptSrc: string;

    private imageListItemBackgroundSize: string;
    private _imageList: ListItem[];
    private imageList: ListItem[];
    private _noneImageList: ListItem[];
    private noneImageList: ListItem[];

    private list1PagerTotalCount: number;
    private list1PagerPageSize: string;
    private list1PagerCurrentPage: number;

    private list2PagerTotalCount: number;
    private list2PagerPageSize: string;
    private list2PagerCurrentPage: number;

    private list1Render() {
        let pageSize = parseInt(this.list1PagerPageSize);
        this.imageList = this._imageList.slice(
            (this.list1PagerCurrentPage - 1) * pageSize,
            this.list1PagerCurrentPage * pageSize
        );
    }

    private list2Render() {
        let pageSize = parseInt(this.list2PagerPageSize);
        this.noneImageList = this._noneImageList.slice(
            (this.list2PagerCurrentPage - 1) * pageSize,
            this.list2PagerCurrentPage * pageSize
        );
    }

    // ng handlers
    ngOnInit() {
        this.list1PagerCurrentPage = 1;
        this.list2PagerCurrentPage = 1;
        this.list1PagerPageSize = '5';
        this.list2PagerPageSize = '5';
        this.list1PagerTotalCount = 0;
        this.list2PagerTotalCount = 0;

        this.showMenu = true;
        this.categoryName = window.localStorage.getItem('category');
        this.categoryLikeCount = 99;
        this.imageList = [];
        this.noneImageList = [];

        let self = this;
        this.dao.category(this.categoryName)
            .subscribe(category => {
                self.categoryCreateTime = category.create;
                self.categoryUpdateTime = category.update;
                self.categoryContent = category.content;
                self.categoryScriptSrc = category.script;

                self._imageList = category.imageList.map(ilItem => {
                    ilItem.imageSrc = self.sanitizer.bypassSecurityTrustStyle('url("' + ilItem._imageSrc + '")');
                    return ilItem;
                });
                self._noneImageList = category.noneImageList;

                self.list1PagerCurrentPage = 1;
                self.list2PagerCurrentPage = 1;
                self.list1PagerTotalCount = category.imageList.length;
                self.list2PagerTotalCount = category.noneImageList.length;

                self.list1Render();
                self.list2Render();
            });

        this.imageListItemBackgroundSize = 'contain';
    }

    // dom handlers
    categoryOnload() {
        this.showMenu = false;
        this.footerFixed = this.bodyContainer.nativeElement.offsetHeight < window.innerHeight - 100;
    }

    noneImageListItemClicked(e) {
        window.localStorage.setItem('article', e.target.parentElement.firstElementChild.innerHTML);
        this.router.navigate(['/article']);
    }

    list1PagerInfoChange(e) {
        let split = e.split('@');
        this.list1PagerCurrentPage = parseInt(split[0]);
        this.list1PagerPageSize = split[1];
        this.list1Render();
    }

    list2PagerInfoChange(e) {
        let split = e.split('@');
        this.list2PagerCurrentPage = parseInt(split[0]);
        this.list2PagerPageSize = split[1];
        this.list2Render();
    }
}
