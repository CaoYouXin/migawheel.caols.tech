import {Component, ElementRef, ViewChild} from "@angular/core";
import {MigaWheelCore, Elem, Configs, RenderedText} from "./migawheel.core";
import {MigaWheelSearch} from "./migawheel.search";
import {MigaWheelDao} from "./migawheel.dao";
import {DaoUtil} from "../dao/dao.util";
import {Router} from "@angular/router";
import {PostType} from "../const/post.type.const";
import {PostOpener} from "../common/post.opener";
import {PostOpenerDao} from "../common/post.opener.dao";

@Component({
    selector: 'migawheel',
    templateUrl: './pc.component.html',
    styleUrls: ['./pc.component.css'],
    providers: [MigaWheelCore, MigaWheelSearch, MigaWheelDao, DaoUtil, PostOpener, PostOpenerDao]
})
export class MigaWheelPcComponent {
    constructor(private core: MigaWheelCore,
                private search: MigaWheelSearch,
                private dao: MigaWheelDao,
                private router: Router,
                private postOpener: PostOpener) {
    }

    @ViewChild('taiqi')
    private taiqiElem: ElementRef;

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

    private firstKeyUp: boolean;

    private calcAngle(e) {
        let dx = e.pageX - window.innerWidth / 2;
        let dy = e.pageY - window.innerHeight / 2;

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

        this.dao.search(analysisResults)
            .subscribe(ret => this.hints = ret.slice(0, 5).map(hint => {
                let indexOf = hint.indexOf('[]');
                if (-1 === indexOf) {
                    return '[分类]' + hint;
                } else {
                    return '[发布]' + hint.substr(0, indexOf);
                }
            }));
    }

    private searchHintsSelect(cmd: string) {
        let newIndex = this.selectedHint + (cmd === 'ArrowUp' ? -1 : 1);

        if (newIndex > -1 && newIndex < this.hints.length) {
            this.selectedHint = newIndex;
        }
    }

    private searchHintClicked(hint: string) {
        let indexOf = hint.indexOf('[发布]');
        if (-1 === indexOf) {
            this.core.mode = Configs.CategoryMode;
            this.processClick(hint.substr('[分类]'.length));
        } else {
            this.core.mode = Configs.PostMode;
            this.processClick(hint.substr('[发布]'.length))
        }
        this.searchHintsReset(false);
    }

    private searchInputKeyEnterUp(elem: any) {

        if (-1 !== this.selectedHint) {
            let hint = this.hints[this.selectedHint];
            this.searchHintClicked(hint);
            return;
        }

        this.searchHintsReset(false);
        let analysisResults = this.search.analysis(elem.value);

        if (null === analysisResults) {
            this.searchHintsReset(true);
            return;
        }

        let mode: string = Configs.CategoryMode;
        for (let i = 0; i < analysisResults.length; i++) {
            if (analysisResults[i].mode === Configs.PostMode) {
                mode = Configs.PostMode;
            }
        }
        this.dao.search(analysisResults)
            .subscribe(ret => this.render(mode + '[:]' + ret.join('[.]')));
    }

    private searchInputKeyBackspaceUp(elem: any) {
        if (elem.value === '') {
            this.firstKeyUp = true;
            this.searchHintsReset(false);
        }
    }

    private searchInputKeyColonUp(elem: any) {
        let colon = ':', firstTime = true;
        elem.value = elem.value.split('').reduce(function (p, v) {
            if (v !== colon || firstTime) {
                p.push(v);
                if (v === colon) firstTime = false;
            }
            return p;
        }, []).join('');
    }

    private processClick(content: string) {
        let self = this;
        switch (this.core.mode) {
            case Configs.CategoryMode:
                this.renderedCategory = this.core.renderCategory(content);
                this.categorySelected = true;
                this.dao.posts(content)
                    .subscribe(ret => self.render(Configs.PostMode + '[:]' + ret.join('[.]')),
                        error => DaoUtil.logError(error));
                break;
            case Configs.PostMode:
                this.postOpener.postOpen(content);
                break;
            default:
                break;
        }
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

        this.firstKeyUp = true;

        this.dao.categories().subscribe(categories => {
                this.render(Configs.CategoryMode + '[:]' + categories.join('[.]'));
            },
            error => DaoUtil.logError(error));
    }

    // dom event handlers
    private leftClicked() {
        if (!this.clickFlag) {
            return;
        }

        window.open('https://github.com/CaoYouXin', '_blank');
    }

    private rightClicked() {
        if (!this.clickFlag) {
            return;
        }

        window.open('http://demo.caols.tech/profile/index.html', '_blank');
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

        this.processClick(content);

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
            case 'ArrowDown':
            case 'ArrowUp':
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

    private searchClicked(e) {
        this.searchHintClicked(e.target.innerHTML);
    }
}
