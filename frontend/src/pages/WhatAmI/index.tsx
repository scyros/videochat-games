import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { Api } from '../../services';
import { CurrentPlayer, Layout, PlayerDisplay as Player } from '../../components';
import { RootState } from '../../store';

import {
  currentPlayer,
  imHostPlayer,
  localPlayer,
  namespace,
  myId,
  players,
} from './store';

import './styles.scss';

interface Params {
  namespace: string;
}
type GameRoomProps = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  RouteComponentProps<Params>;
interface GameRoomState {
  id: string;
}

class GameRoom extends React.PureComponent<GameRoomProps, GameRoomState> {
  constructor(props: GameRoomProps) {
    super(props);
    this.state = { id: uuidv4() };
  }

  async componentDidMount() {
    const { connect, match: { params: { namespace } } } = this.props;
    const { id } = this.state;
    connect(id, namespace);
  }

  render() {
    const { currentPlayer, players } = this.props;

    return (
      <Layout fullHeight>
        <div className="room">
          <div className="game">
            <div className="mainPlayersContainer">
              <CurrentPlayer player={currentPlayer} />
              <div className="players">
                {players.slice(0, 2).map(p => <Player key={p.id} player={p} />)}
              </div>
            </div>
            <div className="secondaryPlayersContainer">
              {players.slice(2).map(p => <Player key={p.id} player={p} />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  currentPlayer: currentPlayer(state),
  imHostPlayer: imHostPlayer(state),
  localPlayer: localPlayer(state),
  myId: myId(state),
  namespace: namespace(state),
  players: players(state),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators({
    connect: Api.getInstance().connect,
  }, dispatch),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(GameRoom));