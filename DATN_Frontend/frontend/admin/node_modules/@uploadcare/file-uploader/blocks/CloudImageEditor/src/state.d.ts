/** @param {import('./CloudImageEditorBlock.js').CloudImageEditorBlock} fnCtx */
export function initState(fnCtx: import('./CloudImageEditorBlock.js').CloudImageEditorBlock): {
    '*originalUrl': null;
    '*faderEl': null;
    '*cropperEl': null;
    '*imgEl': null;
    '*imgContainerEl': null;
    '*networkProblems': boolean;
    '*imageSize': null;
    /** @type {import('./types.js').Transformations} */
    '*editorTransformations': import('./types.js').Transformations;
    /** @type {import('./types.js').CropPresetList} */
    '*cropPresetList': import('./types.js').CropPresetList;
    '*tabList': ("crop" | "tuning" | "filters")[];
    '*tabId': "crop";
    entry: null;
    extension: null;
    editorMode: boolean;
    modalCaption: string;
    isImage: boolean;
    msg: string;
    src: string;
    fileType: string;
    showLoader: boolean;
    uuid: null;
    cdnUrl: null;
    cropPreset: string;
    tabs: string;
    'presence.networkProblems': boolean;
    'presence.modalCaption': boolean;
    'presence.editorToolbar': boolean;
    'presence.viewerToolbar': boolean;
    '*on.retryNetwork': () => void;
    /** @param {import('./types.js').Transformations} transformations */
    '*on.apply': (transformations: import('./types.js').Transformations) => void;
    '*on.cancel': () => void;
};
//# sourceMappingURL=state.d.ts.map