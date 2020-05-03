import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { CurrentPlayer, Layout } from '../../components';
import { RootState } from '../../store';

import {
  currentPlayer,
  imHostPlayer,
  joinMe,
  localPlayer,
  namespace,
  myId,
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
    const { joinMe, match: { params: { namespace } } } = this.props;
    const { id } = this.state;
    joinMe(id, namespace);
  }

  render() {
    const { currentPlayer } = this.props;

    return (
      <Layout fullHeight>
        <div className="room">
          <div className="game">
            {currentPlayer ? <CurrentPlayer player={currentPlayer} /> : <div />}
            <div className="players"></div>
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
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators({
    joinMe,
  }, dispatch),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(GameRoom));