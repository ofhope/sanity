import * as React from 'react'
import * as PropTypes from 'prop-types'

export default class Delay extends React.Component<{ms: number}> {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    ms: PropTypes.number.isRequired,
  }

  state = {done: false}
  timer: NodeJS.Timeout | null = null

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({done: true})
    }, this.props.ms)
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer)
  }

  render() {
    const {children} = this.props

    if (!this.state.done) {
      return null
    }

    return typeof children === 'function' ? children() : children
  }
}
