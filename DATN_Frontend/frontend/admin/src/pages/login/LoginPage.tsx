import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '../../hooks/useAuth';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '../../constants/commonConst';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const LoginPage = () => {
  const { t } = useTranslation();
  const googleLoginMutation = useGoogleLogin();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => googleLoginMutation.mutate(res.credential),
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 336,
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const scriptEl = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      scriptEl?.addEventListener('load', renderGoogleButton, { once: true });
    }
  }, [googleLoginMutation]);

  return (
    <div>
      <div className={cn('mb-6 flex flex-col items-center text-center')}>
        <img
          src="/images/image-3.png"
          alt="Trường Cao đẳng Kỹ thuật Cao Thắng"
          className={cn('mb-4 h-20 w-20 object-contain')}
        />
        <h2 className={cn('m-0 text-3xl font-semibold text-slate-900')}>{t(getKey('login'))}</h2>
        <p className={cn('m-0 mt-2 text-sm leading-6 text-slate-500')}>
          {t(getKey('title_login'))}
        </p>
      </div>

      <div className={cn('flex justify-center')}>
        <div ref={googleButtonRef} />
      </div>

      <div className={cn('mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500')}>
        © 2026 Trường Cao đẳng Kỹ thuật Cao Thắng
      </div>
    </div>
  );
};

export default LoginPage;
