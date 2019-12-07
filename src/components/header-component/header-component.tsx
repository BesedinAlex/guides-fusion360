import React, {Component} from "react";
import {Link} from "react-router-dom";
import './header-component.sass';

export default class HeaderComponent extends Component {

    render() {
        return (
            <header className="navbar navbar-expand-lg py-2 navbar-dark fixed-top">
                <Link to="/" className="navbar-brand">FUSION360GUIDE</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        {/*<li className="nav-item">*/}
                        {/*    <Link to="/" className="nav-link">Создать</Link>*/}
                        {/*</li>*/}
                    </ul>
                    <Link to="/signup">
                        <button className="btn btn-primary margin-right">Регистрация</button>
                    </Link>
                    <Link to="/login">
                        <button className="btn btn-light">Войти</button>
                    </Link>
                </div>
            </header>

        );
    }
}
