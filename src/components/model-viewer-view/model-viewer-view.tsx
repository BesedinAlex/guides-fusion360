import React, {Component} from 'react';
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";
import * as THREE from 'three';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import './model-viewer-view.sass';
import {serverURL} from "../../services/server-address";
import ModelAnnotation from "../../interfaces/model-annotation";
import {getModelAnnotations} from "../../services/model-annotations";
import annotations from "../../../../guides-fusion360-server/src/requests/http/model-annotations";

interface State {
    modelId: number;
    annotations: Array<ModelAnnotation>;
}

export default class ModelViewerView extends Component<RouteComponentProps, State> {

    private host: HTMLElement;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private controls: TrackballControls;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private animationStopped: boolean;

    constructor(props: RouteComponentProps) {
        super(props);

        this.state = {
            // @ts-ignore
            modelId: this.props.match.params.id,
            annotations: []
        };
    }

    componentDidMount() {
        this.animationStopped = false;

        this.scene = new THREE.Scene();

        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
        keyLight.position.set(-100, 0, 100);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
        fillLight.position.set(100, 0, 100);
        this.scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
        backLight.position.set(100, 0, -100).normalize();
        this.scene.add(backLight);

        new MTLLoader().load(`${serverURL}/models/${this.state.modelId}/model.mtl`, (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(`${serverURL}/models/${this.state.modelId}/model.obj`, (mesh) => {
                this.scene.add(mesh);
            });
        });

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(0xaaaaaa));
        this.host.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100000);
        this.camera.position.set(225, 150, 375);

        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 2;
        this.controls.zoomSpeed = 2;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('resize', this.onWindowResize);

        getModelAnnotations(this.state.modelId)
            .then(annotations => {
                annotations.map((annotation, i) => annotation.index = i + 1);
                this.setState({annotations: annotations});
            });

        this.animate();
    }

    componentWillUnmount() {
        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
        this.controls = undefined;
        this.mouse = undefined;
        this.animationStopped = true;
        this.host.removeEventListener('click', this.getCoordinatesOfClick);
        window.removeEventListener('resize', this.onWindowResize);
    }

    animate = () => {
        if (this.animationStopped) {
            return;
        }
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        const width = this.renderer.domElement.width / 2 / window.devicePixelRatio;
        const height = this.renderer.domElement.height / 2 / window.devicePixelRatio;
        for (const obj of this.state.annotations as Array<ModelAnnotation>) {
            const p2 = new THREE.Vector3(obj.x, obj.y, obj.z);
            const annotation = document.querySelector('#annotation-' + obj.index) as HTMLFormElement;
            const annotationIndex = document.querySelector('#annotation-index-' + obj.index) as HTMLFormElement;
            p2.project(this.camera);
            p2.x = Math.round((p2.x + 1) * width);
            p2.y = Math.round((-p2.y + 1) * height);
            annotation.style.left = p2.x + 'px';
            annotation.style.top = p2.y + 'px';
            annotationIndex.style.left = p2.x - 15 + 'px';
            annotationIndex.style.top = p2.y - 15 + 'px';
        }
        this.changeVisibilityByDistanceOfAnnotations();
    };

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    getCoordinatesOfClick = (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length !== 0) {
            const currentPoint = intersects[0].point;
            console.log(currentPoint);
        }
    };

    hideAnnotation(index: number) {
        const annotation = document.querySelector('#annotation-' + index);
        const annotationText = document.querySelector('#annotation-text-' + index);
        const hidden: boolean = annotation.classList.contains('hidden');
        const text = this.state.annotations.find(obj => obj.index === index).text;
        annotationText.innerHTML = hidden ? text : '';
        if (hidden) {
            annotation.classList.remove('hidden');
        } else {
            annotation.classList.add('hidden');
        }
    }

    getClosestAnnotation() {
        let indexOfClosest;
        let distToClosest = Number.MAX_VALUE;
        for (const obj of this.state.annotations) {
            const camPos = this.camera.position;
            const dist = Math.sqrt(Math.pow((camPos.x - obj.x), 2) + Math.pow((camPos.y - obj.y), 2) + Math.pow((camPos.z - obj.z), 2));
            if (distToClosest > dist) {
                distToClosest = dist;
                indexOfClosest = obj.index;
            }
        }
        return indexOfClosest;
    }

    changeVisibilityByDistanceOfAnnotations() {
        for (const obj of this.state.annotations) {
            const annotation = document.querySelector('#annotation-' + obj.index) as HTMLFormElement;
            const annotationNumber = document.querySelector('#annotation-index-' + obj.index) as HTMLFormElement;
            annotation.style.zIndex = this.getClosestAnnotation() === obj.index ? '1' : '0';
            annotationNumber.style.zIndex = this.getClosestAnnotation() === obj.index ? '1' : '0';
        }
    }

    render() {
        return (
            <div ref={(host) => this.host = host} onClick={this.getCoordinatesOfClick}>
                <Link to="/" className="viewer-btn home">
                    <img className="viewer-btn-img" src={require('../../assets/home.png')} alt="Return home" />
                </Link>
                <Link to={`/guide/${this.state.modelId}`} className="viewer-btn return">
                    <img className="viewer-btn-img" src={require('../../assets/return.png')} alt="Return to guide" />
                </Link>

                {this.state.annotations.map(annotation => {
                    const i = annotation.index;
                    return (
                        <div id={`annotation-${i}`} className="annotation hidden" key={i}>
                            <span id={`annotation-text-${i}`} />
                        </div>
                    );
                })}
                {this.state.annotations.map(annotation => {
                    const i = annotation.index;
                    return (
                        <div id={`annotation-index-${i}`} className="annotation-number" onClick={() => this.hideAnnotation(i)} key={i}>
                            {i}
                        </div>
                    );
                })}
            </div>
        );
    }
}
