import axios from 'axios';
import {serverURL} from "./server-address";
import Guide from "../interfaces/guide";
import PartGuide from "../interfaces/part-guide";
import {signOut} from "./user-data";

export function getAllGuides(): Promise<Guide[]> {
    return new Promise((resolve, reject) => {
        axios.get(`${serverURL}/guides/all`)
            .then(res => resolve(res.data.data))
            .catch(err => reject(err.response.data.message));
    });
}

export function getAllHiddenGuides(): Promise<Guide[]> {
    return new Promise((resolve, reject) => {
        axios.get(`${serverURL}/guides/all-hidden`)
            .then(res => resolve(res.data.data))
            .catch(err => {
                if (err.response.status === 401 && err.response.data === '') {
                    signOut();
                } else {
                    reject(err.response.data.message);
                }
            });
    });
}

export function getGuidePreview(guideId: number): Promise<string> {
    return new Promise((resolve, reject) => {
        axios.get(`${serverURL}/guides/preview/${guideId}`, {responseType: 'arraybuffer'})
            .then(res => {
                const base64 = btoa(new Uint8Array(res.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '',)
                );
                resolve('data:;base64,' + base64);
            })
            .catch(err => {
                if (err.response.status === 400 || err.response.status === 401) {
                    signOut();
                } else {
                    reject(err.response.data.message);
                }
            });
    });
}

export function getPartGuides(guideId: number): Promise<PartGuide[]> {
    return new Promise((resolve, reject) => {
        axios.get(`${serverURL}/guides/parts/${guideId}`)
            .then(res => resolve(res.data.data))
            .catch(err => reject(err.response.data.message));
    });
}

export function postNewGuide(name: string, description: string, image: File) {
    return new Promise((resolve, reject) => {
        const bodyFormData = new FormData();
        bodyFormData.append('name', name);
        bodyFormData.append('description', description);
        bodyFormData.append('image', image);

        axios.post(`${serverURL}/guides/guide`, bodyFormData)
            .then(resolve)
            .catch(err => reject(err.response.data.message));
    });
}

export function postNewPartGuide(guideId: number, name: string, data: File | string, sortKey: number) {
    return new Promise((resolve, reject) => {
        const bodyFormData = new FormData();
        bodyFormData.append('guideId', String(guideId));
        bodyFormData.append('name', name);
        bodyFormData.append('sortKey', String(sortKey));
        if (typeof data === "string") {
            bodyFormData.append('content', data);
        } else {
            bodyFormData.append('file', data);
        }

        axios.post(`${serverURL}/guides/part-guide`, bodyFormData)
            .then(resolve)
            .catch(err => reject(err.response.data.message));
    });
}

export function postModel(guideId: number, file: File) {
    return new Promise((resolve, reject) => {
        const bodyFormData = new FormData();
        bodyFormData.append('guideId', String(guideId));
        bodyFormData.append('file', file)

        axios.post(`${serverURL}/guides/model`, bodyFormData)
            .then(resolve)
            .catch(err => reject(err.response.data.message));
    });
}

export function putPartGuide(id: number, name: string, content: string | File) {
    return new Promise((resolve, reject) => {
        const bodyFormData = new FormData();
        bodyFormData.append('name', name);
        if (typeof content === "string") {
            bodyFormData.append('content', content);
        } else {
            bodyFormData.append('file', content);
        }

        axios.put(`${serverURL}/guides/part-guide/${id}`, bodyFormData)
            .then(resolve)
            .catch(err => reject(err.response.data.message));
    });
}

export function putPartGuidesSortKey(id1: number, id2: number) {
    return new Promise((resolve, reject) => {
        axios.put(`${serverURL}/guides/switch`, null , {params: {partGuideId1: id1, partGuideId2: id2}})
            .then(resolve)
            .catch(err => reject(err.response.data.message));
    });
}
