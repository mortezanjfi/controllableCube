class ThreeJS {
    constructor(id) {
      this.perspective = true;
      this.camera, this.renderer, this.scene;
      this.el = document.getElementById(id);
      // initialize
      this.init();
    }
  
    init() {
      let aspect = window.innerWidth / window.innerHeight;
      if (this.perspective) {
        let near = 0.1, far  = 1000, fov = 50;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      } else  {
        let near = 0.1, far = 1000, d = 5;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, near, far);
      }
      this.camera.position.setY(1);
      this.camera.position.setZ(5);
      this.camera.lookAt(new THREE.Vector3(0,-1,0));
  
      this.renderer = new THREE.WebGLRenderer({antialias:1, alpha: 1});
      this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
      this.renderer.setSize(window.innerWidth/2, window.innerHeight/2);
      this.renderer.domElement.classList.add('vignette');
      this.el.appendChild(this.renderer.domElement);
  
      this.scene = new THREE.Scene();
      
      // Scene lighting
      this.scene.add(new THREE.AmbientLight(0xBBBBBB));
      let light = new THREE.PointLight(0xffffff, 0.8);
      light.position.set(0, 50, 50);
      this.scene.add(light);
  
      this.render();
      window.addEventListener('resize', () => this.onResize(), false);
    }
  
    // functions
    render() { this.renderer.render(this.scene, this.camera); }
    add(obj) { this.scene.add(obj); }
    remove(obj) { this.scene.remove(obj); }
  
    onResize() {
      let aspect = window.innerWidth / window.innerHeight;
      let d = 5;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    }
  }
  
  class GamePad {
    constructor() {
      this.supported = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
        !!navigator.webkitGamepads || !!navigator.mozGamepads ||
        !!navigator.msGamepads || !!navigator.gamepads ||
        (navigator.getGamepads && navigator.getGamepads());
  
      this.ticking = false;
  
      this.pan = new THREE.Vector3(0,0,0);
      this.roll = new THREE.Vector3(0,0,0);
  
      this.RIGHT_AXIS_THRESHOLD   = 7849 / 32767.0;
      this.LEFT_AXIS_THRESHOLD    = 8689 / 32767.0;
      this.TRIGGER_AXIS_THRESHOLD = 30   / 32767.0;
      
      this.SPACEMOUSE_THRESHOLD = 5 / 32767.0;
  
      this.gamepads = [];
      this.prevRawGamepadTypes = [];
      this.prevTimestamps = [];
  
      this.init();
    }
  
    init() {
      if (this.supported) {
        // Older Firefox 
        window.addEventListener('MozGamepadConnected', (e) => this.onGamepadConnect(e), false);
        window.addEventListener('MozGamepadDisconnected', (e) => this.onGamepadDisconnect(e), false);

        // Chrome
        if (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) {
          this.startPolling();
        }
  
        //CocoonJS
        if(navigator.getGamepads && navigator.getGamepads()) {
          this.startPolling();
        }
      } else {
        console.log('Gamepad not supported');
      }
    }
    
    startPolling() {
      if (!this.ticking) {
        console.log('Controller Disconnected!');
        this.ticking = true;
        this.update();
      }
    }
    
    stopPolling() {
      console.log('Controller Disconnected!');
      this.ticking = false;
    }
    
    update() {
      this.pollStatus();
      if (this.ticking) {
        this.pollJoysticks();
        //requestAnimationFrame(() => this.tick());
      }
    }
    
    pollStatus() {
      this.pollGamepads();
      for (let i in this.gamepads) {
        let gamepad = this.gamepads[i];
        if (gamepad.timestamp && (gamepad.timestamp === this.prevTimestamps[i])) {
          continue;
        }
        this.prevTimestamps[i] = gamepad.timestamp;
      }
    }
    
    pollGamepads() {
      let rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
          navigator.webkitGamepads || navigator.mozGamepads ||
          navigator.msGamepads || navigator.gamepads || 
          (navigator.getGamepads && navigator.getGamepads());
      if (rawGamepads) {
        this.gamepads = [];
        for (let i = 0, max = rawGamepads.length; i < max; i++) {
          if (typeof rawGamepads[i] !== this.prevRawGamepadTypes[i]) {
            this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
          }
          if (rawGamepads[i]) {
            this.gamepads.push(rawGamepads[i]);
          }
        }
      }
    }
    
    pollJoysticks() {
      let pad = 0;
      
      // Reset all input to 0
      this.pan = new THREE.Vector3(0,0,0);
      this.roll = new THREE.Vector3(0,0,0);
      
      if (this.gamepads[pad]) {
        let panX  = this.gamepads[pad].axes[0]; // Pan  X || Left X
        let panY  = this.gamepads[pad].axes[1]; // Pan  Y || Left Y
        let panZ  = this.gamepads[pad].axes[2]; // Pan  Z || Right X
        
        let rollX = this.gamepads[pad].axes[3]; // Roll X || Right Y
        let rollY = this.gamepads[pad].axes[4]; // Roll Y || Trigger Left
        let rollZ = this.gamepads[pad].axes[5]; // Roll Z || Trigger Right
        
        if (panX < -this.SPACEMOUSE_THRESHOLD ||
            panX > this.SPACEMOUSE_THRESHOLD) {
          this.pan.x = panX;
        }
        
        if (panY < -this.SPACEMOUSE_THRESHOLD ||
            panY > this.SPACEMOUSE_THRESHOLD) {
          this.pan.y = panY;
        }
  
        if (panZ < -this.SPACEMOUSE_THRESHOLD ||
            panZ > this.SPACEMOUSE_THRESHOLD) {
          this.pan.z = panZ;
        }
  
        if (rollX < -this.SPACEMOUSE_THRESHOLD ||
            rollX > this.SPACEMOUSE_THRESHOLD) {
          this.roll.x = rollX;
        }
  
        if (rollY < -this.SPACEMOUSE_THRESHOLD ||
            rollY > this.SPACEMOUSE_THRESHOLD) {
          this.roll.y = rollY;
        }
  
        if (rollZ < -this.SPACEMOUSE_THRESHOLD ||
            rollZ > this.SPACEMOUSE_THRESHOLD) {
          this.roll.z = rollZ;
        }
      }
    }
    
    onGamepadConnect(event) {
      let gamepad = event.gamepad;
      this.gamepads[event.gamepad.id] = gamepad;
      this.startPolling();
    }
    
    onGamepadDisconnect(event) {
      this.gamepads[event.gamepad.id] = null;
      if (this.gamepads.length === 0) {
        this.stopPolling();
      }
    }
  }
  
  class SimpleShape {
    static cube(size, material) {
      let geometry = new THREE.BoxGeometry(size, size, size);
      return new THREE.Mesh(geometry, material);
    }
    static box(sizeX, sizeY, sizeZ, material) {
      let geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
      return new THREE.Mesh(geometry, material);
    }
  }
  
  let materials = {
    wire: new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true }),
    basic: new THREE.MeshBasicMaterial({ color: 0x2196f3, wireframe: false }),
  }
  
  // Pass the div id
  var core = new ThreeJS('app');
  
  // Create controller with Gamepad API
  let controller = new GamePad();
  
  // Sample
  let base = SimpleShape.box(1, 1, 1, materials.wire);
  base.rotation.y = 30 * Math.PI / 180;
  base.position.y -= 1;
  core.add(base);

  var autoRotate1 = 1;

  document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.getElementById('joystickRotation');
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            autoRotate1 = 1;
        } else {
            autoRotate1 = 0;
        }
    });
  });
  
  function update() {
    // Update Joysticks
    controller.update();

    if (autoRotate1 == 1) {
      base.rotation.x += 0.01;
      base.rotation.y += 0.01;
    }
    
    base.rotation.x += 10 * Math.PI / 360 * controller.roll.x;
    base.rotation.z += 10 * Math.PI / 360 * controller.roll.y;
    base.rotation.y -= 10 * Math.PI / 360 * controller.roll.z;
    
    base.position.x += 0.15 * controller.pan.x;
    base.position.z += 0.15 * controller.pan.y;
    base.position.y -= 0.15 * controller.pan.z;
  }
  
  // Render loop
  (function render() {
    update();
    core.render();
    requestAnimationFrame(() => render());
  }());
