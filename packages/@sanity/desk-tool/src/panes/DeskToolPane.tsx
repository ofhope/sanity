import React from 'react'
import {noop} from 'lodash'
import {DocumentsListPane} from './documentsListPane'
import {UserComponentPane} from './userComponentPane'
import {UnknownPane} from './unknownPane'
import {DocumentPaneProvider} from './documentPane'
import {ListPane} from './listPane'

interface DeskToolPaneProps {
  index: number
  title?: string
  type: string
  onCollapse: (index: number) => void
  onExpand: (index: number) => void
}

const paneMap = {
  list: ListPane,
  documentList: DocumentsListPane,
  document: DocumentPaneProvider,
  component: UserComponentPane,
}

export default class DeskToolPane extends React.PureComponent<DeskToolPaneProps> {
  static defaultProps = {
    title: '',
    index: 0,
    onCollapse: noop,
    onExpand: noop,
  }

  handlePaneCollapse = () => this.props.onCollapse(this.props.index)
  handlePaneExpand = () => this.props.onExpand(this.props.index)

  render() {
    const {type} = this.props
    const PaneComponent = paneMap[type] || UnknownPane
    return (
      <PaneComponent
        {...this.props}
        onExpand={this.handlePaneExpand}
        onCollapse={this.handlePaneCollapse}
      />
    )
  }
}
