import React from 'react';

import { Player } from '../../pages/WhatAmI/store';
import { Video } from '../Video';

interface CurrentPlayerProps {
  player?: Player;
}

export const CurrentPlayer: React.SFC<CurrentPlayerProps> = ({ player }) => {
  if (!player) return null;

  return (
    <div className="currentPlayerContainer">
      <Video stream={player.stream} />
    </div>
  );
};

