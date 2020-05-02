import {combineReducers} from 'redux';

import { reducer as gameRoomReducer } from '../pages/WhatAmI/store';

export const rootReducer = combineReducers({
    gameRoom: gameRoomReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
