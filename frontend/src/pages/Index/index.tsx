import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { Layout } from '../../components';
import './styles.scss';

const Index: React.SFC<RouteComponentProps> = ({ history }) => {
  const onCreate = () => {
    const namespace = uuidv4();
    history.push(`/what-am-i/${namespace}`);
  };

  return (
    <Layout>
      <div className="hero is-dark is-medium index-container">
        <div className="hero-body">
          <div className="container is-fluid">
            <div className="columns is-vcentered">
              <div className="column">
                <div className="content">
                  <h1 className="title is-size-1">¿Qué / Quién Soy?</h1>
                  <h2 className="subtitle">
                    <p>Pregunta hasta que adivines qué o quién eres</p>
                    <p>Pierde el último que adivine</p>
                  </h2>
                </div>
              </div>
            
              <div className="column">
                <div className="content">
                  <h1 className="title is-spaced">
                    Crear una nueva sala de juego
                  </h1>
                  <button
                    className="button is-light is-large"
                    onClick={onCreate}
                  >
                    Crear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withRouter(Index);