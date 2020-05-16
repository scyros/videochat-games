import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  faArrowAltCircleRight,
  faDice,
  faHeartBroken,
  faHome,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import React from 'react';

config.autoAddCss = false
library.add(faArrowAltCircleRight, faDice, faHeartBroken, faHome, faVideoSlash);

export type ICONS = 'arrow-alt-circle-right' | 'dice' | 'heart-broken' | 'home' | 'video-slash';

interface IconProps extends FontAwesomeIconProps {
  icon: ICONS;
}

export const Icon: React.SFC<IconProps> = props => (
  <FontAwesomeIcon {...props} />
);
