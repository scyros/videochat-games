import React from 'react';

import { Player } from '../../pages/WhatAmI/store';
import { Video } from '../Video';

interface PlayerDisplayProps {
  player?: Player;
}

export const PlayerDisplay: React.SFC<PlayerDisplayProps> = ({ player }) => {
  if (!player) return null;

  return (
    <div className="playerContainer">
      <Video stream={player.stream} />
    </div>
  );
};

