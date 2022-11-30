function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } class Example {


    static generateParameters() {
        const N = 600;
        const radius = 30;
        const positions = [];
        const rotations = [];
        const scales = [];
        const connections = [];

        for (let i = 0; i < N; i++) {
            const a = 2 * Math.PI * Math.random();
            const b = 2 * Math.PI * Math.random();
            const c = 2 * Math.PI * Math.random();
            const euler = new THREE.Euler(a, b, c, 'XYZ');
            const r = radius - Math.random() * radius / 3;
            const position = new THREE.Vector3(r, 0, 0);
            position.applyEuler(euler);

            positions.push(position);
            rotations.push(euler);
            scales.push(1);
        }

        for (let i = 0; i < N; i++) {
            for (let j = i; j < N; j++) {
                const a = positions[i];
                const b = positions[j];
                const distance = a.distanceTo(b);

                if (distance < radius / 6) {
                    connections.push([i, j]);
                }
            }
        }

        const parameters = {
            N,
            radius,
            positions,
            rotations,
            scales,
            connections
        };


        return parameters;
    }


    constructor(root) {
        this.root = root;

        this.ctx = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;

        this.initScene();
        this.initObjects();
        this.initCamera();
        this.initRenderer();
        this.initComposer();
        this.initEventListeners();

        this.onWindowResize();

        this.root.classList.add('-loaded');

        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initObjects() {
        const parameters = Example.generateParameters();

        this.initPlanet(parameters);
        this.initSatellites(parameters);
        this.initLines(parameters);
        this.initStars(parameters);
    }

    initPlanet(parameters) {
        const radius = parameters.radius;
        const geometry = new THREE.SphereGeometry(0.4 * radius, 32, 32);
        const color = Example.COLOR_SCHEME.planet;
        const material = new THREE.MeshBasicMaterial({ color });
        const planet = new THREE.Mesh(geometry, material);

        //this.scene.add(planet);
    }

    initSatellites(parameters) {
        const radius = parameters.radius;
        const geometry = new THREE.SphereGeometry(radius / 10, 32, 32);
        const color = Example.COLOR_SCHEME.satellite;
        const material = new THREE.MeshBasicMaterial({ color });

        const satellite1 = new THREE.Mesh(geometry, material);
        satellite1.position.x = radius * 1.2;

        const satellite2 = new THREE.Mesh(geometry, material);
        satellite2.position.x = -radius * 1.2;

        //this.scene.add(satellite1);
        //this.scene.add(satellite2);
    }

    initStars(parameters) {
        const N = parameters.N;
        const positions = parameters.positions;
        const rotations = parameters.rotations;
        const scales = parameters.scales;

        const color = Example.COLOR_SCHEME.stars;
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color });
        const stars = new THREE.Group();

        for (let i = 0; i < N; i++) {
            const star = new THREE.Mesh(geometry, material);

            star.rotation.copy(rotations[i]);
            star.position.copy(positions[i]);
            star.scale.multiplyScalar(scales[i]);
            stars.add(star);
        }

        this.scene.add(stars);
    }

    initLines(parameters) {
        const N = parameters.N;
        const radius = parameters.radius;
        const positions = parameters.positions;
        const connections = parameters.connections;

        const color = Example.COLOR_SCHEME.lines;
        const material = new THREE.LineBasicMaterial({ color });
        const lines = new THREE.Group();

        connections.forEach(connection => {
            const a = positions[connection[0]];
            const b = positions[connection[1]];
            const points = [a, b];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);

            lines.add(line);
        });

        this.scene.add(lines);
    }

    initCamera() {
        const fov = 45;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    initRenderer() {
        const alpha = true;
        const clearColor = Example.COLOR_SCHEME.background;
        const clearColorAlpha = 1;

        this.renderer = new THREE.WebGLRenderer({ alpha });
        this.renderer.setClearColor(clearColor, clearColorAlpha);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.root.appendChild(this.renderer.domElement);
    }

    initComposer() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.setSize(width, height);

        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const resolution = new THREE.Vector2(width, height);
        const strength = 0.29;
        const radius = 1;
        const threshold = 0.1;
        const bloomPass = new THREE.UnrealBloomPass(
            resolution, strength, radius, threshold);
        bloomPass.renderToScreen = true;
        this.composer.addPass(bloomPass);
    }

    initEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    render() {
        const t = performance.now() / 15000;
        const x = (Math.sin(t) + Math.sin(2 * t + 1) + Math.sin(3 * t)) / 20;
        const y = t / 2;
        const z = 0;
        const euler = new THREE.Euler(x, y, z, 'XYZ');
        const position = new THREE.Vector3(0, 0, 40);

        position.applyEuler(euler);

        this.camera.position.copy(position);
        this.camera.lookAt(new THREE.Vector3());
        this.camera.rotation.x += x;

        this.composer.render(this.scene, this.camera);
    }

    animate() {
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }
} _defineProperty(Example, "COLOR_SCHEME", { background: 0x41294e, planet: 0xbc6c25, satellite: 0x282728, stars: 0xfefae0, lines: 0xffffff });



const root = document.getElementById('root');
const example = new Example(root);