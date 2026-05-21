export class Range extends BaseComponent<any> {
    constructor();
    init$: {
        cssLeft: string;
        barActive: boolean;
        value: number;
        onChange: (e: any) => void;
    };
    /** @type {HTMLInputElement} */
    _range: HTMLInputElement | undefined;
}
export namespace Range {
    let template: string;
}
import { BaseComponent } from '@symbiotejs/symbiote';
//# sourceMappingURL=Range.d.ts.map