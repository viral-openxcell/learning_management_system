import { Component, type ReactNode } from 'react'
import { ErrorState } from './ErrorState'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6">
          <ErrorState
            title="This page crashed"
            description={this.state.error.message}
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      )
    }
    return this.props.children
  }
}
