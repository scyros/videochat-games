import { saga as whatAmISaga } from '../pages/WhatAmI/saga';
import { Api, PeerConnection } from '../services';

export default [
  Api.getInstance().saga,
  PeerConnection.saga,

  whatAmISaga,
];
