import React from 'react';

interface VideoProps
  extends React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
    stream?: MediaStream;
  }
export const Video: React.SFC<VideoProps> = ({ stream }) => {
  if (!stream) return null;
  
  return (
    <video ref={(video) => {
      if (video) {
        video.srcObject = stream;
        video.oncanplay = () => video.play();
      }
    }} />
  );
};
