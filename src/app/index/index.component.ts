import {Component} from "@angular/core";

@Component({
    selector: 'index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.css']
})
export class IndexComponent {

    loading: boolean;

    needLoading(isLoading: boolean) {
        this.loading = isLoading;
    }

}
