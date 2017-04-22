import {Component, ViewChild, ElementRef, Output, EventEmitter, Input} from "@angular/core";

@Component({
    selector: 'content',
    templateUrl: 'content.component.html'
})
export class ContentComponent {
    @ViewChild('contentContainer')
    private contentContainer: ElementRef;

    @Input('innerHTML')
    private innerHTML: string;

    @Input('scriptSrc')
    private scriptSrc: string;

    @Output('onload')
    private onload: EventEmitter<any> = new EventEmitter();

    // ng event handler
    ngOnChanges() {
        this.contentContainer.nativeElement.innerHTML = this.innerHTML;

        let self = this;
        let scriptElem = document.createElement('script');
        scriptElem.src = this.scriptSrc;
        scriptElem.onload = function() {
            self.onload.emit();
        };
        this.contentContainer.nativeElement.appendChild(scriptElem);
    }

}
