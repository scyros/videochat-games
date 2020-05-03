import React from 'react';

import styles from './styles.module.scss';
import { Player } from '../../pages/WhatAmI/store';
import { Video } from '../Video';

interface CurrentPlayerProps {
  player: Player;
}

export const CurrentPlayer: React.SFC<CurrentPlayerProps> = ({ player }) => {
  return (
    <div className={styles.playerContainer}>
      <div className={styles.player}>
        <Video stream={player.stream} />
      </div>
    </div>
  );
};

