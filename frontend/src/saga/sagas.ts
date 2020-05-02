import { saga as whatAmISaga } from '../pages/WhatAmI/saga';
import { Api } from '../services';

export default [
  whatAmISaga,
  Api.getInstance().saga,
];
