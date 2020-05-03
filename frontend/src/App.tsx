import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import WhatAmI from './pages/WhatAmI';
import About from './pages/About';

import './scss/app.scss';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Index />
        </Route>
        <Route exact path="/about">
          <About />
        </Route>
        <Route path="/what-am-i/:namespace" children={<WhatAmI />} />
        <Route path="*" children={<NotFound />} />
      </Switch>
    </Router>
  );
}

export default App;
