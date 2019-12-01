import React, {Component} from "react";
import './footer.sass';

export default class Footer extends Component {
    render() {
        return(
            <footer className="bg-dark py-2">
                <div className="container">
                    <span>Гайды разработаны студентами <a className="text-warning" href="https://mospolytech.ru">Московского Политеха</a>.</span><br />
                    <span>Узнать больше про Fusion 360 можно на сайте <a className="text-warning" href="https://autodesk.com/products/fusion-360/overview">Autodesk</a>.</span>
                </div>
            </footer>
        );
    }
}
