import { FlowStoreProps } from 'components/flow/Flow';
import { DebugState } from 'store/editor';

import mutate from 'immutability-helper';

/* istanbul ignore next -- @preserve */
export default class Debug {
  private props: FlowStoreProps;
  private state: DebugState;

  constructor(props: FlowStoreProps, initial: DebugState) {
    this.props = props;
    this.state = initial || { showUUIDs: false };
  }

  public showUUIDs(): DebugState {
    const updated = mutate(this.state, { $merge: { showUUIDs: true } });
    this.props.mergeEditorState({ debug: updated });
    return updated;
  }
}
