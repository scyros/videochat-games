import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faHeartBroken, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import React from 'react';

config.autoAddCss = false
library.add(faHeartBroken, faHome);

export type ICONS = 'heart-broken' | 'home';

interface IconProps extends FontAwesomeIconProps {
  icon: ICONS;
}

export const Icon: React.SFC<IconProps> = props => (
  <FontAwesomeIcon {...props} />
);
