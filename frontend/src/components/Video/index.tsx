import React from 'react';

import { Icon } from '../Icon'

import styles from './styles.module.scss';

interface VideoProps
  extends React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
    stream?: MediaStream;
  }
export const Video: React.SFC<VideoProps> = ({ stream }) => {
  if (!stream) {
    return (
      <div className={styles.videoContainer}>
        <Icon icon="video-slash" size="3x" inverse />
      </div>
    );
  }
  
  return (
    <div className={styles.videoContainer}>
      <video className={`video ${styles.video}`} ref={(video) => {
        if (video) {
          video.srcObject = stream;
          video.oncanplay = () => video.play();
          video.onerror = (e) => console.error(e);
        }
      }} />
    </div>
  );
};
