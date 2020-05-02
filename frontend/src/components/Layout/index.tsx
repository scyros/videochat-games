import React from 'react';

import './styles.scss';

export const Layout: React.FunctionComponent = props => (
  <div className="main-layout">
    {props.children}
    <footer>
      <div className="container is-fluid">
        <a href="/about" className="has-text-light is-size-7">
          ¿Cómo funciona esto?
        </a>
      </div>
    </footer>
  </div>
)
