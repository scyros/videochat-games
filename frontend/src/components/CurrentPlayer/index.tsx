import React from 'react';

import { Player } from '../../pages/WhatAmI/store';
import { Icon } from '../Icon';
import { PlayerDisplay } from '../Player';

import styles from './styles.module.scss';

interface CurrentPlayerProps {
  imHost: boolean;
  nextPlayer: () => void;
  player?: Player;
}

const Controls: React.SFC<any> = ({ nextPlayer }) => {
  return (
    <div className={styles.controls}>
      <Icon
        icon="arrow-alt-circle-right"
        inverse
        onClick={() => nextPlayer()}
        size="3x"
      />
    </div>
  );
};

export const CurrentPlayer: React.SFC<CurrentPlayerProps> = ({
  imHost,
  nextPlayer,
  player
}) => {
  if (!player) return null;

  return (
    <PlayerDisplay
      className="currentPlayerContainer"
      player={player}
      showQuest
    >
      {imHost && <Controls nextPlayer={nextPlayer} />}
    </PlayerDisplay>
  );
};

