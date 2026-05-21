import { PlayCircleFilled } from '@ant-design/icons';
import { Image, Modal } from 'antd';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '../../constants/commonConst';
import LogoImg from '/images/logo.png';

const VideoPreview = ({
  srcVideo,
  srcThumbnails,
}: {
  srcVideo: string | undefined;
  srcThumbnails: string | undefined;
}) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsModalVisible(true);
  };

  const handleCancel = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsModalVisible(false);
  };

  return (
    <>
      <div className={cn('relative w-full')} onClick={showModal}>
        {/* Hình ảnh đại diện cho video */}
        <Image
          src={srcThumbnails || LogoImg}
          alt={t(getKey('video_thumbnail'))}
          preview={false} // Vô hiệu hóa preview mặc định của hình ảnh
          className={cn('h-[90px] max-w-40 cursor-pointer object-contain')}
        />

        <div className={cn('absolute left-2/4 top-2/4', 'translate-x-[-50%] translate-y-[-50%] transform cursor-pointer text-2xl')}>
          <PlayCircleFilled />
        </div>
      </div>

      {/* Modal chứa video */}
      <Modal
        title={t(getKey('video_preview'))}
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
        centered
        destroyOnClose
      >
        <video controls className={cn('w-full')} src={srcVideo}>
          {t(getKey('video_not_supported'))}
        </video>
      </Modal>
    </>
  );
};

export default VideoPreview;
