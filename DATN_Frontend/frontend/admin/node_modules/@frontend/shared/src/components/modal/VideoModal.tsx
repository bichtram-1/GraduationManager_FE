import React, { useState } from 'react';
import { Modal } from 'antd';

interface VideoModalProps {
    isOpen: boolean; // Trạng thái mở modal
    videoUrl: string | null; // URL của video cần xem
    onClose: () => void; // Hàm đóng modal
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoUrl, onClose }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [videoKey, setVideoKey] = useState(0)

    React.useEffect(() => {
        if (isOpen) {
            setVideoKey((prev) => prev + 1); // Tăng key để re-render video
        }
    }, [isOpen])
    return (
        <Modal
            title="Video"
            open={isOpen}
            onCancel={
                () => {
                    onClose()
                    if (videoRef.current) {
                        videoRef.current?.pause()
                        videoRef.current.currentTime = 0
                    }
                }
            }
            footer={null}
            width={800}
        >
            {videoUrl ? (
                <video
                    ref={videoRef}
                    key={videoKey}
                    controls
                    style={{ width: '100%' }}
                    src={videoUrl}
                    autoPlay
                />
            ) : (
                <p>No video available</p>
            )}
        </Modal>
    );
};

export default VideoModal;
