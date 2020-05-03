import React from 'react';

import './styles.scss';

interface LayoutProps {
  fullHeight?: boolean;
}

export const Layout: React.SFC<LayoutProps> = ({ fullHeight, children }) => (
  <div className={`main-layout${fullHeight ? ' full-height' : ''}`}>
    {children}
    <footer>
      <div className="container is-fluid">
        <a href="/about" className="has-text-light is-size-7">
          ¿Cómo funciona esto?
        </a>
      </div>
    </footer>
  </div>
)
