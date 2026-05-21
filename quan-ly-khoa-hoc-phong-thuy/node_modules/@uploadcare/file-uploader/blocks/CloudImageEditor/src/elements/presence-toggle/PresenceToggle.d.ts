export class PresenceToggle extends Block {
    _visible: boolean;
    _visibleStyle: string | undefined;
    _hiddenStyle: string | undefined;
    _externalTransitions: boolean;
    _handleVisible(): void;
}
export namespace PresenceToggle {
    let template: string;
}
export type Style = {
    transition?: string | undefined;
    visible?: string | undefined;
    hidden?: string | undefined;
};
import { Block } from '../../../../../abstract/Block.js';
//# sourceMappingURL=PresenceToggle.d.ts.map