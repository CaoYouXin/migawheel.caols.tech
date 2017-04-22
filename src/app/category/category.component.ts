import {Component} from "@angular/core"
import {Router} from "@angular/router";

@Component({
    selector: 'category',
    templateUrl: 'category.component.html',
    styleUrls: ['category.component.css']
})
export class CategoryComponent {
    private showMenu: boolean;

    private categoryTitle: string;

    private articleContent: string;
    private articleScriptSrc: string;

    private imageList: ListItem[];
    private noneImageList: ListItem[];

    constructor(private router: Router) {}

    // ng handlers
    ngOnInit() {
        this.showMenu = true;
        this.categoryTitle = window.localStorage.getItem('category');

        this.articleContent = '<link rel="stylesheet" href="http://caols.tech/a.css">' +
            '<p id="test">Show Or Not</p><button id="testBtn">Do Cmd</button>' +
            '<button onclick="alert(\'hello world\')">hello world</button>';
        this.articleScriptSrc = 'http://caols.tech/a.js';

        let item = new ListItem();
        item.title = '标题';
        item.brief = '一个人的情绪受环境的影响，这是很正常的，但你苦着脸，一副苦大仇深的样子，对处境并不会有任何的改变，相反，如果微笑着去生活，那会增加亲和力，别人更乐于跟你交往，得到的机会也会更多。';
        this.noneImageList = [item, JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(item))];
    }

    // dom handlers
    articleOnload() {
        this.showMenu = false;
    }

    noneImageListItemClicked(e) {
        window.localStorage.setItem('article', e.target.parentElement.firstElementChild.innerHTML);
        this.router.navigate(['/article']);
    }

}

export class ListItem {
    title: string;
    brief: string;
    imageSrc: string;
}
