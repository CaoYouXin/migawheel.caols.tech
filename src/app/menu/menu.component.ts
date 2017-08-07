import {Component, Input, OnInit} from "@angular/core";

@Component({
    selector: 'menu',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.component.css']
})
export class MenuComponent {
    private menuTransform: string;
    private bannerTransparent: boolean;

    @Input('show')
    private show: boolean;

    @Input('loading')
    loading: boolean;

    private replaceMenu(showMenu: boolean) {
        this.bannerTransparent = !showMenu;
        this.menuTransform = showMenu ? null : (window.innerWidth > window.innerHeight ? 'left' : 'right');
    }

    // ng event handlers
    ngOnChanges() {
        this.replaceMenu(this.show);
    }

    // dom event handlers
    menuClicked() {
        this.bannerTransparent = !this.bannerTransparent;
        this.replaceMenu(!this.bannerTransparent);
    }

}