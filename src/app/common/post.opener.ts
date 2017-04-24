import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {PostOpenerDao} from "./post.opener.dao";
import {PostType} from "../const/post.type.const";

@Injectable()
export class PostOpener {

    constructor(private router: Router,
                private dao: PostOpenerDao) {}

    postOpen(postName: string) {
        let self = this;
        this.dao.post(postName)
            .subscribe(post => {
                switch (post.type) {
                    case PostType.APP:
                        window.open(post.url, '_blank');
                        break;
                    case PostType.ARTICLE:
                        window.localStorage.setItem('article', postName);
                        let navigate = self.router.navigate(['/article']);
                        break;
                    default:break;
                }
            });
    }

}