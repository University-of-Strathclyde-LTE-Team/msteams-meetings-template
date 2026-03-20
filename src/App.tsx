import React from 'react';
import { applyMiddleware, createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import SigninPage from './SigninPage';
import { createAuthMiddleware } from './auth/middleware';
import MeetingPage from './MeetingPage';
import { createRootReducer } from './RootReducer';
import { createMeetingMiddleware } from './meeting-creator/middleware';
import CopyMeetingPage from './CopyMeetingPage';
import CreateLandingPage from './CreateLandingPage';
import ErrorPage from './ErrorPage';
import moment from 'moment';
import 'moment/min/locales.min';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { getUserLocale } from './localization/translate';

moment.locale(getUserLocale());
initializeIcons();

// Mutable ref so middleware can call navigate without being inside a component.
const navigateRef = { current: null as NavigateFunction | null };
const getNavigate = () => navigateRef.current!;

const store = createStore(
  createRootReducer(),
  compose(
    applyMiddleware(
      createAuthMiddleware(getNavigate),
      createMeetingMiddleware(getNavigate)
    )
  )
);

// Sets the navigate ref as soon as we are inside the HashRouter tree.
function NavigateSetter() {
  navigateRef.current = useNavigate();
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <NavigateSetter />
        <Routes>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/createMeeting" element={<MeetingPage />} />
          <Route path="/copyMeeting" element={<CopyMeetingPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<CreateLandingPage />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

export default App;
