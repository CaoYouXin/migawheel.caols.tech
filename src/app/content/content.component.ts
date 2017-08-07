import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";

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
    ngOnChanges(changeRecords) {
        if (changeRecords.innerHTML && changeRecords.innerHTML.currentValue) {
            this.contentContainer.nativeElement.innerHTML = changeRecords.innerHTML.currentValue;
        }

        if (changeRecords.scriptSrc && changeRecords.scriptSrc.currentValue) {
            let self = this;
            let scriptElem = document.createElement('script');
            scriptElem.src = changeRecords.scriptSrc.currentValue;
            scriptElem.onload = function () {
                self.onload.emit();
            };
            this.contentContainer.nativeElement.appendChild(scriptElem);
        }
    }

}
