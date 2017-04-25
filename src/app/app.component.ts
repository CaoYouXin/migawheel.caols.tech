import {Component} from "@angular/core";
import {Configs} from "./migawheel/migawheel.core";
import {API} from "./const/api.const";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    ngOnInit() {
        API.setDevMode(true);
    }

}
