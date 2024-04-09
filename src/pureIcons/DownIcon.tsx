import React from 'react';

export interface DownIconProps {
  disabled: boolean;
}

export class DownIcon extends React.PureComponent<DownIconProps> {
  render() {
    return (
      <svg
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask id="mask0_4498_1599" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="21">
          <rect y="0.5" width="20" height="20" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_4498_1599)">
          <path
            d="M9.99593 13.0098C9.90661 13.0098 9.82355 12.9938 9.74674 12.9617C9.66992 12.9297 9.59946 12.8816 9.53537 12.8175L5.67222 8.95433C5.55214 8.83426 5.49423 8.70425 5.49851 8.56429C5.50278 8.42433 5.56528 8.29399 5.68601 8.17327C5.80673 8.05255 5.93573 7.99219 6.07301 7.99219C6.21029 7.99219 6.33929 8.05255 6.46001 8.17327L10.0001 11.7342L13.561 8.17327C13.6764 8.05789 13.8041 8.00234 13.944 8.0066C14.084 8.01088 14.2143 8.07338 14.335 8.1941C14.4557 8.31483 14.5161 8.44383 14.5161 8.58112C14.5161 8.7184 14.4534 8.84936 14.328 8.974L10.4648 12.8175C10.3952 12.8816 10.3219 12.9297 10.2451 12.9617C10.1683 12.9938 10.0852 13.0098 9.99593 13.0098Z"
            fill={this.props.disabled ? '#D0D3D9' : '#1C1B1F'}
          />
        </g>
      </svg>
    );
  }
}
