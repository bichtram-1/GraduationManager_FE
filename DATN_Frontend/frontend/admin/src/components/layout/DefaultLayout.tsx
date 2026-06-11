import { useState, Suspense, useRef, useEffect } from 'react';
import { App, Layout } from 'antd';

import { Outlet } from 'react-router-dom';
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { cn } from '../../constants/commonConst';
import DefaultNavigate from '../general/DefaultNavigate';
import DefaultHeader from '../general/DefaultHeader';
import Loading from '../shared/general/Loading';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [siderWidth, setSiderWidth] = useState<number>(256);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const toggle = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const delta = e.clientX - dragState.current.startX;
      const newWidth = Math.min(Math.max(dragState.current.startWidth + delta, 160), 520);
      setSiderWidth(newWidth);
    };

    const onMouseUp = () => {
      dragState.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragState.current = { startX: e.clientX, startWidth: siderWidth };
    document.body.style.cursor = 'col-resize';
    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const delta = ev.clientX - dragState.current.startX;
      const newWidth = Math.min(Math.max(dragState.current.startWidth + delta, 160), 520);
      setSiderWidth(newWidth);
    };
    const onMouseUp = () => {
      dragState.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
      <Layout className={cn('h-full')}>
        <Sider
          trigger={null}
          width={collapsed ? 80 : siderWidth}
          collapsedWidth={80}
          collapsed={collapsed}
          theme="light"
          collapsible
          className={cn('!bg-white border-r border-blackLight relative')}
        >
          <DefaultNavigate collapsed={collapsed} onToggle={toggle} />
          <div
            ref={resizerRef}
            onMouseDown={handleMouseDown}
            className="sider-resizer"
            style={{ position: 'absolute', top: 0, right: -4, width: 8, height: '100%', cursor: 'col-resize' }}
          />
        </Sider>
        <Layout>
          <Header
            className={cn(
              'h-[88px] sticky top-0 z-50 content-center bg-white px-6 shadow-md'
            )}
          >
            <DefaultHeader />
          </Header>
          <Content
            className={cn(
              'h-[calc(100vh-90px)] min-h-[calc(100vh-90px)] overflow-auto bg-bgAdvanceSection p-8'
            )}
          >
            <Suspense fallback={<Loading />}>
              <App>
                <Outlet />
              </App>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </StyleProvider>
  );
};

export default AppLayout;
