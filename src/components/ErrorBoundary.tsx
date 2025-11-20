import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-red-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
                        <p className="text-slate-300 mb-4">
                            The application encountered an error and could not render.
                        </p>
                        <pre className="bg-slate-950 p-3 rounded text-xs text-red-300 overflow-auto max-h-40">
                            {this.state.error?.message}
                        </pre>
                        <button
                            onClick={() => {
                                localStorage.removeItem("stocks");
                                window.location.reload();
                            }}
                            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                            Clear Data & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
