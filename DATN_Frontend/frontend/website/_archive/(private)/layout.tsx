import HeaderWithSideBar from '@/features/private/components/HeaderWithSideBar';
import React from 'react';

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col min-h-screen w-full'>
        <HeaderWithSideBar />
        {children}
    </div>
  )
}

export default PrivateLayout
