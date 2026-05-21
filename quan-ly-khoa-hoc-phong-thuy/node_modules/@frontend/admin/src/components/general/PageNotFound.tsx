import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { getKey } from '@shared/types/I18nKeyType';
import { useTranslation } from 'react-i18next';

export default function PageNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="h-screen w-screen relative flex justify-center items-center">
        <div style={{ zIndex: 1, position: 'relative' }}>
          <div className="max-w-[800px] mx-auto flex justify-center items-center">
            {/* <img
              className="object-cover"
              src="/images/404.png"
              alt="Banner IMG"
              width={500}
            /> */}
            <DotLottieReact src="/animations/404_fixed.json" loop autoplay />
          </div>
          <div className="text-black font-bold text-[36px] text-center">
            {/* <div className="text-[100px]">404</div> */}
            <div>{t(getKey("page_not_found"))}</div>
            <Button
              onClick={handleBack}
              className="mt-[30px]"
              size="large"
              type="primary"
            >
              {t(getKey("back_to_homepage"))}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
