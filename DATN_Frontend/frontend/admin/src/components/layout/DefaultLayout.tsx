import { useState, Suspense, useRef, useEffect } from 'react';
import { App, Layout } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '../../constants/queryKey';

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

const RealtimeListener = () => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  // Use refs to keep stable references to notification and queryClient,
  // preventing the SSE connection from resetting/recreating on every layout re-render.
  const notificationRef = useRef(notification);
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const lastEventId = '';
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      const url = `${backendUrl}/v1/realtime/stream` + (lastEventId ? `?last_event_id=${lastEventId}` : '');
      eventSource = new EventSource(url);

      eventSource.addEventListener('connected', (e: MessageEvent) => {
        try {
          const res = JSON.parse(e.data);
          console.log('Realtime SSE connected:', res);
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('notification', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          notificationRef.current.info({
            message: data.title || 'Thông báo mới',
            description: data.message || '',
            placement: 'topRight',
            duration: 6,
          });

          // Invalidate lists in query client
          if (data.type === 'topic_proposed') {
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.topics.list] });
          } else if (data.type === 'group_status_updated' || data.type === 'student_registered_topic') {
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.groups.list] });
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.topics.list] });
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
          } else if (data.type === 'internship_declared' || data.type === 'internship_updated') {
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.internships.confirmations.list] });
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.internships.declarations.list] });
            queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.companies.list] });
          } else if (data.type === 'score_updated' || data.type === 'tttn_score_updated') {
            queryClientRef.current.invalidateQueries({ queryKey: ['scores'] });
          }
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('score_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          console.log('Realtime score updated:', data);
          queryClientRef.current.invalidateQueries({ queryKey: ['scores'] });
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('slot_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          console.log('Realtime slot/group updated:', data);
          queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.topics.list] });
          queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.groups.list] });
          queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.classes.list] });
          queryClientRef.current.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.onerror = () => {
        // Silently let EventSource handle native reconnects without logging errors
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return null;
};

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
                <RealtimeListener />
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
