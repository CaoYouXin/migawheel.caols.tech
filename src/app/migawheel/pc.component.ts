/**
 * Created by cls on 2017/3/4.
 */
import {Component, Input} from "@angular/core";
import {MigaWheelCore, Elem, Configs} from "./migawheel.core";

@Component({
    selector: 'migawheel',
    templateUrl: './pc.component.html',
    styleUrls: ['./pc.component.css']
})
export class MigaWheelPcComponent {
    private categorySelected: boolean = false;
    private renderedCategory: RenderedText[] = [];

    private transform: string = 'translate(250,250) rotate(0 0 0)';
    private elems: Elem[] = [];

    @Input('data')
    private data: string;
    private previousData: string;

    private core: MigaWheelCore = new MigaWheelCore();

    private flag: boolean;
    private lastAngle: number;
    private daCount: number = 0;

    private originX: number = 250;
    private originY: number = 250;

    private calcAngle(e) {
        let dx = e.offsetX - this.originX;
        let dy = e.offsetY - this.originY;

        let angle = Math.acos(dx / Math.sqrt(dx * dx + dy * dy));
        if (dy > 0) {
            angle = 2 * Math.PI - angle;
        }

        return angle;
    }

    private render(data: string) {
        let parsedData = data.split('[:]');

        if (2 !== parsedData.length) {
            console.log('error, data format error, lack of "[:]" delimiter.');
            return;
        }

        this.core.config.apply(this.core,
            parsedData[0] === Configs.PostMode ?
                Configs.postConfig() :
                Configs.categoryConfig());

        this.elems = this.core.render(parsedData[1].split('[.]'));
    }

    // angular2 event handlers
    // ngOnInit() {
    //     console.log(this.data);
    // }

    // render function
    ngOnChanges() {
        if (this.previousData === this.data) {
            console.log('same data, emit');
            return;
        }
        this.previousData = this.data;

        this.render(this.data);
    }

    // dom event handlers
    private leftClicked(e) {
        alert('left clicked.');
    }

    private rightClicked(e) {
        alert('right clicked.');
    }

    private elemClicked(e) {

        let pElem = e.target.parentElement, content = '';
        for (let i = 1, lineNum = 0, previousRadius, array = []; i < pElem.childElementCount; i++) {
            let radius = pElem.children[i].getAttribute('y');
            if (previousRadius !== radius) {
                previousRadius = radius;
                lineNum++;

                content += array.join('').trim();
                array = [];

                if (lineNum > 3) {
                    break;
                }
            }

            array.push(pElem.children[i].innerHTML);

            if (i === pElem.childElementCount - 1) {
                content += array.join('').trim();
            }
        }

        alert('elem [' + content + '] clicked');

        switch (this.core.mode) {
            case Configs.CategoryMode:
                this.render(Configs.PostMode + '[:]我是谁[]2017-01-01||2017-02-02');
                break;
            case Configs.PostMode:

                break;
            default:
                break;
        }

    }

    private svgMouseDown(e) {
        this.flag = true;
        this.lastAngle = this.calcAngle(e);
    }

    private svgMouseUp(e) {
        this.flag = false;
    }

    private svgMouseMove(e) {
        if (!this.flag) {
            return;
        }

        let angle = this.calcAngle(e);
        let da = angle - this.lastAngle;
        if (da < -Math.PI) {
            da += 2 * Math.PI;
        } else if (da > Math.PI) {
            da -= 2 * Math.PI;
        }

        this.transform = this.transform.replace(/rotate\((\S+) /, function ($0, $1) {
            return 'rotate(' + (parseFloat($1) - da / Math.PI * 180) + ' ';
        });

        this.daCount -= da;
        if (Math.abs(this.daCount) / Math.PI >= .25 && this.core.hasEllipsis()) {

            console.log((this.daCount < 0 ? 'left' : 'right') + ' shift');

            if (this.daCount < 0) {

                this.elems = this.core.shiftLeft();
            } else {

                this.elems = this.core.shiftRight();
            }

            this.daCount = 0;
        }

        this.lastAngle = angle;
    }
}

class RenderedText {
    x: string;
    y: string;
    content: string;

    constructor(x: number, y: number, content: string) {
        this.x = '' + x;
        this.y = '' + y;
        this.content = content;
    }
}
