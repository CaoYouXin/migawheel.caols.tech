import { Component, Input, OnChanges, HostListener } from "@angular/core";
import { API } from "../../http";

@Component({
  selector: 'content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent {

  prefix: string = API.getAPI("server/origin") + '/serve';
  height: number = 0;
  loading: boolean = true;

  @Input()
  url: string;

  @HostListener("window:message", ['$event'])
  receiveMessage(e) {
    if (e.origin !== API.getAPI("server/origin")) {
      return;
    }

    let data = JSON.parse(e.data);

    if (data.path && data.height) {
      this.loadMsg(data);
    } else if (data.url && data.target) {
      this.openMsg(data);
    }
  }

  private openMsg(data) {
    window.open(data.url, data.target);
  }

  private loadMsg(data) {
    if (this.url !== data.path) {
      return;
    }

    this.height = data.height;
    this.loading = false;
  }

  ngOnChanges(sc) {
    if (sc.url) {
      this.loading = true;
      this.height = 0;

      setTimeout((self) => {
        if (!self.loading) {
          return;
        }

        self.loading = false;
        self.height = 500;
      }, 3000, this);
    }
  }

}