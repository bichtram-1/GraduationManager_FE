import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';
import { cn } from '../../constants/commonConst';

const AuthLayout = () => {
  return (
    <div className={cn('flex h-screen w-screen')}> 
      {/* Left promo panel */}
      <div
        className={cn(
          'hidden md:flex w-1/2 items-center justify-center',
          'bg-[linear-gradient(90deg,var(--color-blue-light)_0%,var(--color-indigo-light)_100%)]',
          'p-12'
        )}
      >
        <div className={cn('max-w-[520px] text-white')}> 
          <div className={cn('flex flex-col items-center gap-6')}> 
            <div className={cn('w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center')}> 
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" fill="rgba(255,255,255,0.18)" />
              </svg>
            </div>

            <h1 className={cn('text-3xl font-semibold text-white text-center')}>Hệ thống quản lý</h1>
            <h2 className={cn('text-2xl font-semibold text-white/90 text-center')}>TTTN & ĐATN</h2>

            <p className={cn('text-sm leading-relaxed text-white/80 text-center')}>Nền tảng quản lý toàn diện quá trình Thực tập tốt nghiệp và Đồ án tốt nghiệp dành cho Quản trị viên, Giảng viên và Sinh viên.</p>

            <div className={cn('mt-8 flex gap-4 justify-center')}> 
              <div className={cn('bg-white/10 rounded-lg p-6 text-center min-w-[120px]')}> 
                <div className={cn('text-2xl font-semibold')}>524</div>
                <div className={cn('text-sm text-white/80')}>Sinh viên</div>
              </div>
              <div className={cn('bg-white/10 rounded-lg p-6 text-center min-w-[120px]')}> 
                <div className={cn('text-2xl font-semibold')}>48</div>
                <div className={cn('text-sm text-white/80')}>Giảng viên</div>
              </div>
              <div className={cn('bg-white/10 rounded-lg p-6 text-center min-w-[120px]')}> 
                <div className={cn('text-2xl font-semibold')}>76</div>
                <div className={cn('text-sm text-white/80')}>Đề tài</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right card with form */}
      <Flex
        className={cn('w-full md:w-1/2 items-center justify-center bg-[#f3f4f6]')}
        vertical
        align="center"
        justify="center"
      >
        <div
          className={cn(
            'w-full max-w-[460px] rounded-2xl bg-white p-8',
            'shadow-[0_20px_40px_rgba(2,6,23,0.12)]'
          )}
        >
          <Outlet />
        </div>
      </Flex>
    </div>
  );
};

export default AuthLayout;
