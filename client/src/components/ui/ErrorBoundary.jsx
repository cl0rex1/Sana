import React from 'react';
import { withTranslation } from 'react-i18next';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg text-center w-full border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t('errorBoundary.title')}</h1>
            <p className="text-gray-500 mb-6">{t('errorBoundary.description')}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left overflow-auto max-h-40 border border-gray-100">
              <p className="text-xs font-mono text-red-500 whitespace-pre-wrap">{this.state.error?.toString()}</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-full font-medium hover:bg-gray-800 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              {t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
