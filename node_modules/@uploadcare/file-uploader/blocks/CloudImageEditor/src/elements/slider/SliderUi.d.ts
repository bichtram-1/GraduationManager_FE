export class SliderUi extends Block {
    init$: any;
    _zero: any;
    _observer: ResizeObserver | undefined;
    _thumbSize: number | undefined;
    _updateValue(value: any): void;
    _updateZeroDot(value: any): void;
    _updateSteps(): void;
    _zeroDotEl: HTMLDivElement | undefined;
    _stepsCount: any;
}
export namespace SliderUi {
    let template: string;
}
import { Block } from '../../../../../abstract/Block.js';
//# sourceMappingURL=SliderUi.d.ts.map