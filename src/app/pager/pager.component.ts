import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    selector: 'pager',
    templateUrl: 'pager.component.html',
    styleUrls: ['pager.component.css']
})
export class PagerComponent {

    showSelector: boolean;

    @Input()
    private pageSize: string;

    @Input()
    private currentPage: number;
    private totalPage: number;

    @Input()
    private totalCount: number;

    @Output()
    private change: EventEmitter<string> = new EventEmitter<string>();

    private emit() {
        this.change.emit(this.currentPage + '@' + this.pageSize);
    }

    private reCalc() {
        this.currentPage = 1;
        this.totalPage = '无限' === this.pageSize ? 1 : Math.ceil(this.totalCount / parseInt(this.pageSize));
    }

    // ng handlers
    ngOnChanges(changeRecord) {
        if (changeRecord.totalCount || changeRecord.pageSize) {
            this.reCalc();
        }
    }

    // dom handlers
    currentPageAdd(add: number) {
        let newPage = this.currentPage + add;
        if (newPage > 0 && newPage <= this.totalPage) {
            this.currentPage = newPage;
            this.emit();
        }
    }

    selectorClicked(e) {
        this.showSelector = false;

        if ('关闭' === e.target.innerHTML) {
            return;
        }

        this.pageSizeChange(e.target.innerHTML);
    }

    pageSizeChange(str) {
        let matched = str.match(/\d+|无限/);
        if (!matched) {
            alert('输入不合法');
            return false;
        }

        this.pageSize = matched[0];
        this.reCalc();
        this.emit();
    }

}
