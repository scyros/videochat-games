import React from 'react';
import { Link } from 'react-router-dom';

import { Icon, Layout } from '../../components';
import './styles.scss';

const NotFound: React.SFC = () => (
  <Layout>
    <div className="not-found">
      <div className="hero is-dark">
        <div className="hero-body">
          <div className="container">
            <Icon icon="heart-broken" size="5x" />
          </div>
          <div className="container">
            <h1 className="title">404</h1>
            <h2 className="subtitle">Not Found</h2>
          </div>
          <div className="container go-home">
            <Link to="/">
              <Icon icon="home" size="lg" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default NotFound;
