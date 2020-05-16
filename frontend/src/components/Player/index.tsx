import React from 'react';

import { Icon } from '../Icon';
import { Player } from '../../pages/WhatAmI/store';
import { Video } from '../Video';

import styles from './styles.module.scss';

interface PlayerDisplayProps {
  className?: string;
  player?: Player;
  showQuest?: boolean;
}

const Quest: React.SFC<any> = ({ children }) => (
  <span className={styles.quest}>{children}</span>
);

const YourPlayer: React.SFC<any> = () => (
  <div className={styles.yourPlayer}>
    <Icon icon="dice" size="3x" />
  </div>
);

export const PlayerDisplay: React.SFC<PlayerDisplayProps> = ({
  children,
  className,
  player,
  showQuest,
}) => {
  if (!player) return null;

  const { isLocal } = player;

  return (
    <div className={`${className} ${styles.playerContainer}`}>
      {isLocal && <YourPlayer />}
      {!isLocal && showQuest && <Quest>{player.quest}</Quest>}
      <Video stream={player.stream} />
      {children}
    </div>
  );
};

