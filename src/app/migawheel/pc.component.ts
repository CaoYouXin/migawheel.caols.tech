import {Component} from "@angular/core";
import {MigaWheelCore, Elem, Configs, RenderedText} from "./migawheel.core";
import {MigaWheelSearch} from "./migawheel.search";
import {MigaWheelDao} from "./migawheel.dao";
import {DaoUtil} from "../dao/dao.util";
import {Router} from "@angular/router";

@Component({
    selector: 'migawheel',
    templateUrl: './pc.component.html',
    styleUrls: ['./pc.component.css'],
    providers: [MigaWheelCore, MigaWheelSearch, MigaWheelDao, DaoUtil]
})
export class MigaWheelPcComponent {
    constructor(private core: MigaWheelCore,
                private search: MigaWheelSearch,
                private dao: MigaWheelDao,
                private router: Router) {
    }

    // private core: MigaWheelCore;
    // private search: MigaWheelSearch;

    private categorySelected: boolean;
    private renderedCategory: RenderedText[];

    private transform: string;
    private elems: Elem[];

    private data: string;
    private previousData: string;

    private searchFocused: boolean;
    private searchHintsShow: boolean;
    private hints: string[];
    private selectedHint: number;
    private searchErrorMsg: string;

    private flag: boolean;
    private clickFlag: boolean;
    private lastAngle: number;
    private daCount: number;

    private originX: number;
    private originY: number;

    private firstKeyUp: boolean;

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

        this.transform = 'translate(250,250) rotate(0 0 0)';
        this.elems = this.core.render(parsedData[1].split('[.]'));
    }

    private searchHintsReset(show: boolean) {
        this.selectedHint = -1;
        this.hints = [];
        this.searchErrorMsg = this.search.errorMsg;
        this.searchHintsShow = show;
    }

    private searchHintsUpdate(searchStr: string) {
        this.searchHintsReset(true);
        let analysisResults = this.search.analysis(searchStr);

        if (null === analysisResults) {
            this.searchErrorMsg = this.search.errorMsg;
            return;
        }

        this.hints = ['你我他', '我是谁', '孙行者', '行者孙', '者行孙'];
    }

    private searchHintsSelect(cmd: string) {
        let newIndex = this.selectedHint + (cmd === 'ArrowUp' ? -1 : 1);

        if (newIndex > -1 && newIndex < this.hints.length) {
            this.selectedHint = newIndex;
        }
    }

    private searchInputKeyEnterUp(elem: any) {
        console.log('Search String: [' + elem.value + ']');

        this.searchHintsReset(false);
        let analysisResults = this.search.analysis(elem.value);

        console.log(analysisResults);

        if (null === analysisResults) {
            this.searchHintsReset(true);
            return;
        }

        this.render(Configs.CategoryMode + '[:]' + ['你我他', '我是谁', '孙行者', '行者孙', '者行孙'].join('[.]'));
    }

    private searchInputKeyBackspaceUp(elem: any) {
        if (elem.value === '') {
            this.firstKeyUp = true;
            this.searchHintsReset(false);
        }
    }

    private searchInputKeyColonUp(elem: any) {
        console.log('Search String: [' + elem.value + ']');

        let colon = ':', firstTime = true;
        elem.value = elem.value.split('').reduce(function (p, v) {
            if (v !== colon || firstTime) {
                p.push(v);
                if (v === colon) firstTime = false;
            }
            return p;
        }, []).join('');
    }

    // angular2 event handlers
    ngOnInit() {
        this.categorySelected = false;
        this.transform = 'translate(250,250) rotate(0 0 0)';
        this.renderedCategory = [];
        this.elems = [];
        this.hints = [];
        this.selectedHint = -1;
        this.searchErrorMsg = this.search.errorMsg;
        this.daCount = 0;
        this.originX = this.originY = 250;
        this.firstKeyUp = true;

        this.dao.categories().subscribe(categories => {
            this.render(Configs.CategoryMode + '[:]' + categories.join('[.]'));
        });
    }

    // dom event handlers
    private leftClicked() {
        if (!this.clickFlag) {
            return;
        }

        alert('left clicked.');

        window.open('https://github.com/CaoYouXin', '_blank');
    }

    private rightClicked() {
        if (!this.clickFlag) {
            return;
        }

        alert('right clicked.');
    }

    private elemClicked(e) {
        if (!this.clickFlag) {
            return;
        }

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
                this.renderedCategory = this.core.renderCategory(content);
                this.categorySelected = true;

                this.render(Configs.PostMode + '[:]我是谁[]2017-01-01||2017-02-02');
                break;
            case Configs.PostMode:
                window.localStorage.setItem('article', content);
                this.router.navigate(['/article']);
                break;
            default:
                break;
        }

    }

    private svgMouseDown(e) {
        this.flag = true;
        this.clickFlag = true;
        this.lastAngle = this.calcAngle(e);
    }

    private svgMouseUp(e) {
        this.flag = false;
    }

    private svgMouseMove(e) {
        if (!this.flag) {
            return;
        }
        this.clickFlag = false;

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

    private cateBackClicked() {
        if (!this.clickFlag) {
            return;
        }

        alert('category back clicked');

        this.categorySelected = false;
        this.render(Configs.CategoryMode + '[:]' + this.core.previousCategories.join('[.]'));
    }

    // search extension
    private searchFocus(e) {
        this.searchFocused = true;
        if (e.target.value.length > 0) {
            this.searchHintsUpdate(e.target.value);
        }
    }

    private searchKeyUp(e) {
        if (this.firstKeyUp) {
            this.searchHintsReset(true);
            this.firstKeyUp = false;
        }

        switch (e.key) {
            case 'ArrowDown': case 'ArrowUp':
                this.searchHintsSelect(e.key);
                break;
            case 'Enter':
                this.searchInputKeyEnterUp(e.target);
                break;
            case 'Backspace':
                this.searchInputKeyBackspaceUp(e.target);
                break;
            case ':':
                this.searchInputKeyColonUp(e.target);
                break;
            default:
                this.searchHintsUpdate(e.target.value);
                return;
        }
    }
}
