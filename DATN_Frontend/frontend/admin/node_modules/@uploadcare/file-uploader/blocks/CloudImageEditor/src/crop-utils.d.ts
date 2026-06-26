/**
 * @param {SVGElement} node
 * @param {{ [key: String]: String | Number }} attrs
 */
export function setSvgNodeAttrs(node: SVGElement, attrs: {
    [key: string]: string | number;
}): void;
/**
 * @param {String} name
 * @param {{ [key: String]: String | Number }} attrs
 * @returns {SVGElement}
 */
export function createSvgNode(name: string, attrs?: {
    [key: string]: string | number;
}): SVGElement;
/**
 * @param {import('./types.js').Rectangle} rect
 * @param {import('./types.js').Direction} direction
 * @param {number} sizeMultiplier
 */
export function cornerPath(rect: import('./types.js').Rectangle, direction: import('./types.js').Direction, sizeMultiplier: number): {
    d: string;
    center: number[];
};
/**
 * @param {import('./types.js').Rectangle} rect
 * @param {Extract<import('./types.js').Direction, 'n' | 's' | 'w' | 'e'>} direction
 * @param {number} sizeMultiplier
 */
export function sidePath(rect: import('./types.js').Rectangle, direction: Extract<import('./types.js').Direction, 'n' | 's' | 'w' | 'e'>, sizeMultiplier: number): {
    d: string;
    center: number[];
};
/** @param {import('./types.js').Direction} direction */
export function thumbCursor(direction: import('./types.js').Direction): "move" | "ew-resize" | "ns-resize" | "nwse-resize" | "nesw-resize";
/**
 * @param {{
 *   rect: import('./types.js').Rectangle;
 *   delta: [Number, Number];
 *   imageBox: import('./types.js').Rectangle;
 * }} options
 */
export function moveRect({ rect, delta: [dx, dy], imageBox }: {
    rect: import('./types.js').Rectangle;
    delta: [number, number];
    imageBox: import('./types.js').Rectangle;
}): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * @param {import('./types.js').Rectangle} rect1
 * @param {import('./types.js').Rectangle} rect2
 */
export function constraintRect(rect1: import('./types.js').Rectangle, rect2: import('./types.js').Rectangle): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * @param {{
 *   rect: import('./types.js').Rectangle;
 *   delta: [Number, Number];
 *   direction: import('./types.js').Direction;
 *   aspectRatio?: number;
 *   imageBox: import('./types.js').Rectangle;
 * }} options
 */
export function resizeRect({ direction, ...rest }: {
    rect: import('./types.js').Rectangle;
    delta: [number, number];
    direction: import('./types.js').Direction;
    aspectRatio?: number;
    imageBox: import('./types.js').Rectangle;
}): import("./types.js").Rectangle;
/**
 * @param {import('./types.js').Rectangle} rect
 * @param {[Number, Number]} point
 */
export function rectContainsPoint(rect: import('./types.js').Rectangle, [x, y]: [number, number]): boolean;
/**
 * @param {import('./types.js').Rectangle} rect1
 * @param {import('./types.js').Rectangle} rect2
 */
export function isRectInsideRect(rect1: import('./types.js').Rectangle, rect2: import('./types.js').Rectangle): boolean;
/**
 * @param {import('./types.js').Rectangle} rect
 * @param {number} aspectRatio
 */
export function isRectMatchesAspectRatio(rect: import('./types.js').Rectangle, aspectRatio: number): boolean;
/**
 * @param {import('./types.js').ImageSize} imageSize
 * @param {Number} angle
 * @returns {import('./types.js').ImageSize}
 */
export function rotateSize({ width, height }: import('./types.js').ImageSize, angle: number): import('./types.js').ImageSize;
/**
 * @param {number} width
 * @param {number} height
 * @param {number} aspectRatio
 */
export function calculateMaxCenteredCropFrame(width: number, height: number, aspectRatio: number): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * @param {import('./types.js').Rectangle} rect
 * @returns {import('./types.js').Rectangle}
 */
export function roundRect(rect: import('./types.js').Rectangle): import('./types.js').Rectangle;
/**
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function clamp(value: number, min: number, max: number): number;
//# sourceMappingURL=crop-utils.d.ts.map