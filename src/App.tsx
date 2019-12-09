import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import GuidesContainerView from "./components/home-page-view/guides-container-view/guides-container-view";
import ViewGuideView from "./components/guide-view/view-guide-view/view-guide-view";
import ModelViewerView from "./components/model-viewer-view/model-viewer-view";
import SignInAuthView from "./components/auth-view/sign-in-auth-view/sign-in-auth-view";
import Page404View from "./components/page-404-view/page-404-view";
import SignUpAuthView from "./components/auth-view/sign-up-auth-view/sign-up-auth-view";
import CreateGuideView from "./components/guide-view/create-guide-view/create-guide-view";
import EditGuideView from "./components/guide-view/edit-guide-view/edit-guide-view";
import PrivateRouteComponent from "./components/route-component/private-route-component/private-route-component";
import PublicOnlyRouteComponent from './components/route-component/public-only-route-component/public-only-route-component';
import './App.sass';
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

export default class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/" component={GuidesContainerView} />
                        <Route path="/guide/:id" component={ViewGuideView} />
                        <Route path="/model/:id" component={ModelViewerView} />
                        <PrivateRouteComponent path="/edit/:id" component={EditGuideView} />
                        <PrivateRouteComponent path="/create" component={CreateGuideView} />
                        <PublicOnlyRouteComponent path="/login" component={SignInAuthView} />
                        <PublicOnlyRouteComponent path="/signup" component={SignUpAuthView} />
                        <Route component={Page404View} />
                    </Switch>
                </div>
            </Router>
        );
    }
}
