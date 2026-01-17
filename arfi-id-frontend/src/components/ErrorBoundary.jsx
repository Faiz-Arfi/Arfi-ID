import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-red-50">
          <div className="max-w-2xl rounded-lg bg-white p-8 shadow-lg">
            <h1 className="mb-4 text-3xl font-bold text-red-600">
              Something went wrong
            </h1>
            <p className="mb-4 text-gray-700">
              An error occurred in the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4 rounded bg-gray-100 p-4">
                <summary className="cursor-pointer font-semibold text-gray-800">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-sm text-red-700">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 overflow-auto text-xs text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
