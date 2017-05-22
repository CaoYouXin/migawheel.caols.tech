import {Component} from "@angular/core";
import {API} from "../const/api.const";
import {environment} from "../environments/environment";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    ngOnInit() {
        API.setProductMode(environment.production);
    }

}
