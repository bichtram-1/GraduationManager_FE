import * as react from 'react';
import { JSX } from 'react';
import Cropper, { CropperProps } from 'react-easy-crop';
import { UploadProps, ModalProps } from 'antd';

type BeforeUpload = Exclude<UploadProps['beforeUpload'], undefined>;
type BeforeUploadReturnType = ReturnType<BeforeUpload>;
type ImgCropProps = {
    quality?: number;
    fillColor?: string;
    zoomSlider?: boolean;
    rotationSlider?: boolean;
    aspectSlider?: boolean;
    showReset?: boolean;
    resetText?: string;
    aspect?: number;
    minZoom?: number;
    maxZoom?: number;
    minAspect?: number;
    maxAspect?: number;
    cropShape?: 'rect' | 'round';
    showGrid?: boolean;
    cropperProps?: Omit<CropperProps, 'image' | 'crop' | 'zoom' | 'rotation' | 'aspect' | 'minZoom' | 'maxZoom' | 'minAspect' | 'maxAspect' | 'zoomWithScroll' | 'cropShape' | 'showGrid' | 'onCropChange' | 'onZoomChange' | 'onRotationChange' | 'onCropComplete' | 'classes' | 'keyboardStep'> & Partial<Pick<CropperProps, 'keyboardStep'>>;
    modalClassName?: string;
    modalTitle?: string;
    modalWidth?: number | string;
    modalOk?: string;
    modalCancel?: string;
    onModalOk?: (value: BeforeUploadReturnType) => void;
    onModalCancel?: (resolve: (value: BeforeUploadReturnType) => void) => void;
    modalProps?: Omit<ModalProps, 'className' | 'title' | 'width' | 'okText' | 'cancelText' | 'onOk' | 'onCancel' | 'open' | 'visible' | 'wrapClassName' | 'maskClosable' | 'destroyOnHidden'>;
    beforeCrop?: BeforeUpload;
    children: JSX.Element;
};

declare const ImgCrop: react.ForwardRefExoticComponent<ImgCropProps & react.RefAttributes<Cropper>>;

export { ImgCrop as default };
export type { ImgCropProps };
