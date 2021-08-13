import React from 'react'
import elementResizeDetectorMaker from 'element-resize-detector'
import styles from './enhanceWithAvailableHeight.css'

export interface WithAvailHeightProps {
  height?: number
}

export default function enhanceWithAvailHeight<ComponentProps extends WithAvailHeightProps>(
  WrappedComponent: React.ComponentType<ComponentProps>
) {
  return class EnhancedWithAvailHeight extends React.PureComponent<Omit<ComponentProps, 'height'>> {
    static displayName = `enhanceWithAvailHeight(${
      WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent'
    })`

    // state = {}
    erd: elementResizeDetectorMaker.Erd
    _element: HTMLDivElement | null = null

    constructor(props: Omit<ComponentProps, 'height'>) {
      super(props)

      this.erd = elementResizeDetectorMaker({strategy: 'scroll'})
      this.state = {}
    }

    componentWillUnmount() {
      if (this._element) {
        this.teardown(this._element)
      }
    }

    setup(el: HTMLDivElement) {
      if (this._element) {
        this.teardown(this._element)
      }
      this.erd.listenTo(el, this.handleResize)
      this._element = el
    }

    teardown(el: HTMLDivElement) {
      this.erd.removeAllListeners(el)
      this.erd.uninstall(el)
      this._element = null
    }

    setContainer = (el: HTMLDivElement) => {
      if (el) {
        this.setup(el)
      }
    }

    handleResize = () => {
      this.setState({height: this._element?.offsetHeight})
    }

    render() {
      const wrappedProps = {
        ...(this.props as ComponentProps),
        ...this.state,
      }

      return (
        <div className={styles.root} ref={this.setContainer}>
          <WrappedComponent {...wrappedProps} />
        </div>
      )
    }
  }
}
