import * as React from 'react';
import ReactModal from 'react-modal';

import styles from './Modal.module.scss';

interface CustomStyles {
  content: { [cssProperty: string]: string | number };
}

export interface ModalProps {
  show: boolean;
  onClose?(): void;

  onModalOpen?: any;
  width?: string;
}

// A base modal for displaying messages or performing single button actions
export default class Modal extends React.Component<ModalProps> {
  public render(): JSX.Element {
    const customStyles: CustomStyles = {
      content: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '40px',
        bottom: 'initial',
        padding: 'none',
        borderRadius: 'none',
        outline: 'none',
        width: this.props.width ? this.props.width : '700px',
        border: 'none',
      },
    };
    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={this.props.show}
        onAfterOpen={this.props.onModalOpen}
        onRequestClose={this.props.onClose}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        contentLabel="Modal"
        overlayClassName={styles.overlay}
      >
        {this.props.children}
      </ReactModal>
    );
  }
}
