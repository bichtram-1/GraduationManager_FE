// src/hooks/useOtpCooldown.ts
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getCookie, clearCookie, setCookie } from '@shared/utils/cookie';

type CookieShape = { until: number; email?: string };

export function useOtpCooldown(cookieKey: string, cooldownSec = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Đọc cookie và cập nhật secondsLeft — toàn bộ logic nằm ở đây
  const tick = useCallback(() => {
    // đọc cookie mỗi nhịp để survive F5 & đa tab
    const data = getCookie(cookieKey) as CookieShape | null;
    if (!data) return setSecondsLeft(0);

    const remain = Math.ceil((data.until - dayjs().valueOf()) / 1000);
    if (remain > 0) setSecondsLeft(remain);
    else {
      setSecondsLeft(0);
    }
  }, [cookieKey]);

  // Bắt đầu cooldown và ghi cookie
  const start = useCallback((email: string, cooldown?: number) => {
    const until = dayjs().add(cooldown || cooldownSec, 'second').valueOf();
    setCookie(cookieKey, { until, email });
    tick();
  }, [cookieKey, cooldownSec]);

  // Dừng cooldown và xóa cookie
  const stop = useCallback(() => {
    clearCookie(cookieKey);
    tick();
  }, [cookieKey]);

  useEffect(() => {
    // chạy 1 nhịp khi mount
    tick();
    // set interval
    const intervalId = window.setInterval(tick, 1000);
    // cleanup
    return () => window.clearInterval(intervalId);
  }, [tick]);
  return { 
    secondsLeft, 
    startCooldown: start, 
    stopCooldown: stop,
  };
}
