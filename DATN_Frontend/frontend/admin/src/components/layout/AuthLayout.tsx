import { Outlet } from 'react-router-dom';
import { cn } from '../../constants/commonConst';

const AuthLayout = () => {
  return (
    <div className={cn('flex h-screen w-screen overflow-hidden bg-slate-100')}> 
      <div
        className={cn(
          'relative hidden lg:flex flex-1 items-center justify-center overflow-hidden',
          'bg-[linear-gradient(135deg,#0d47a1_0%,#1976d2_52%,#42a5f5_100%)]',
          'px-10 py-12 text-white'
        )}
      >
        <div className={cn('absolute inset-0 opacity-25')}>
          <div className={cn('absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white blur-3xl')} />
          <div className={cn('absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-cyan-300 blur-3xl')} />
        </div>

        <div className={cn('relative z-10 max-w-[520px] text-center')}> 
          <div className={cn('mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur')}> 
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          <h1 className={cn('text-4xl font-semibold leading-tight text-white')}>Hệ thống quản lý</h1>
          <h2 className={cn('mt-2 text-3xl font-semibold text-cyan-100')}>TTTN & ĐATN</h2>

          <p className={cn('mx-auto mt-5 max-w-[480px] text-sm leading-7 text-white/80')}>
            Nền tảng quản lý toàn diện quá trình Thực tập tốt nghiệp và Đồ án tốt nghiệp dành cho Quản trị viên, Giảng viên và Sinh viên.
          </p>

          <div className={cn('mt-10 grid grid-cols-3 gap-3')}> 
            <div className={cn('rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_16px_30px_rgba(2,6,23,0.12)] backdrop-blur')}>
              <div className={cn('text-2xl font-semibold')}>524</div>
              <div className={cn('mt-1 text-xs text-white/80')}>Sinh viên</div>
            </div>
            <div className={cn('rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_16px_30px_rgba(2,6,23,0.12)] backdrop-blur')}>
              <div className={cn('text-2xl font-semibold')}>48</div>
              <div className={cn('mt-1 text-xs text-white/80')}>Giảng viên</div>
            </div>
            <div className={cn('rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_16px_30px_rgba(2,6,23,0.12)] backdrop-blur')}>
              <div className={cn('text-2xl font-semibold')}>76</div>
              <div className={cn('mt-1 text-xs text-white/80')}>Đề tài</div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn('flex w-full flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-10')}> 
        <div
          className={cn(
            'w-full max-w-[480px] rounded-[28px] border border-slate-100 bg-white p-8 sm:p-10',
            'shadow-[0_28px_70px_rgba(15,23,42,0.12)]'
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
