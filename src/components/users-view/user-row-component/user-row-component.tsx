import React, {Component} from "react";
import User from '../../../interfaces/user';
import Glyphicon from '@strongdm/glyphicon';
import {deleteUser, updateUserAccess} from "../../../api/user-data";

export default class UserRowComponent extends Component<User, any> {

    handleAccessChange = access => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Вы уверены, что хотите изменить уровень доступа пользователя '${this.props.firstName} ${this.props.lastName}'?`)) {
            updateUserAccess(this.props.email, access)
                .then(() => window.location.reload())
                .catch(message => alert(message));
        }
    }

    handleUserDelete = () => {
        const message =
            `Вы уверены, что хотите удалить пользователя '${this.props.firstName} ${this.props.lastName}'? ` +
            'После удаления все гайды пользователя будут отмечены как ваши.';
        // eslint-disable-next-line no-restricted-globals
        if (confirm(message)) {
            deleteUser(this.props.email)
                .then(() => window.location.reload())
                .catch(message => alert(message));
        }
    }

    render() {
        let color = '';
        let access = '';
        let title = '';
        let glyph = '';
        let newAccess = '';
        let isAdmin = false;
        switch (this.props.access) {
            case 'admin':
                color = 'table-success';
                access = 'Администратор';
                isAdmin = true;
                break;
            case 'editor':
                color = 'table-primary';
                access = 'Редактор';
                title = 'Сделать пользователем';
                glyph = 'user';
                newAccess = 'unknown';
                break;
            default:
                color = 'table-warning'
                access = 'Пользователь';
                title = 'Сделать редактором';
                glyph = 'pencil';
                newAccess = 'editor';
        }
        return (
            <tr className={color}>
                <th>{this.props.firstName} {this.props.lastName}</th>
                <td>{this.props.email}</td>
                <td>{access}</td>
                <td>
                    <button className="btn btn-sm m-0 p-0" hidden={isAdmin} title={title}
                            onClick={() => this.handleAccessChange(newAccess)}>
                        <Glyphicon glyph={glyph} />
                    </button>
                    <button className="btn btn-sm m-0 mx-2 p-0" hidden={isAdmin} title="Удалить пользователя"
                            onClick={this.handleUserDelete}>
                        <Glyphicon glyph="remove" />
                    </button>
                </td>
            </tr>
        );
    }
}