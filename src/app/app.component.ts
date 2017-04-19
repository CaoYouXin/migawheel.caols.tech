import {Component} from "@angular/core";
import {Configs} from "./migawheel/migawheel.core";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app works!';
    data = Configs.CategoryMode + '[:]' + ['Demo', 'APP', '学习笔记', '生活纪实', '感言', '灵感', '知识总结'].join('[.]');

    loadClicked(e) {
        this.data = Configs.PostMode + '[:]我是谁[]2017-01-01||2017-02-02';
    }
}
