import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '../../store';

import { joinMe, selectNamespace } from './store';

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
    return (
      <div className="gameroom">
        <h1>Hola</h1>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  namespace: selectNamespace(state),
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators({
    joinMe,
  }, dispatch),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(GameRoom)));