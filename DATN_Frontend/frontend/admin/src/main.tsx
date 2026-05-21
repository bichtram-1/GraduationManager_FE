import { App as AntdApp } from 'antd';
import ReactDOM from 'react-dom/client';
import App from './App';
import LocaleProvider from '@shared/components/provider/LocaleProvider';
import { GlobalVariableProvider } from './hooks/GlobalVariableProvider';
import AppQueryProvider from '@shared/lib/react-query/queryClientProvider';
import '@shared/translation/i18-config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
    <GlobalVariableProvider>
      <LocaleProvider>
        <AntdApp 
          notification={{ 
            maxCount: 1, 
            duration: 3, 
            showProgress: true,
          }}
        >
          <AppQueryProvider>
            <App />
          </AppQueryProvider>
        </AntdApp>
      </LocaleProvider>
    </GlobalVariableProvider>
);
