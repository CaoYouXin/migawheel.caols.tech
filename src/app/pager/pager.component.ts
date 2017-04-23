import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    selector: 'pager',
    templateUrl: 'pager.component.html',
    styleUrls: ['pager.component.css']
})
export class PagerComponent {

    private showSelector: boolean;

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

        this.pageSize = e.target.innerHTML;
        this.reCalc();

        this.currentPage = 1;
        this.emit();
    }

    pageSizeChange(str) {
        this.pageSize = str.match(/\d+/);
        this.reCalc();

        this.currentPage = 1;
        this.emit();
    }

}
