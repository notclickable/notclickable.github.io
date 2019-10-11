var renderer = webglAvailable() ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var onRenderFcts = [];
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
var winResize = new THREEx.WindowResize(renderer, camera);
var controls = new THREE.OrbitControls(camera);
controls.autoRotate = true;
camera.position.z = 100;
//////////////////////////////////////////////////////////////////////////////////
//		make boxes 				//
//////////////////////////////////////////////////////////////////////////////////	
function makeBox() {
    this.geometry = new THREE.BoxGeometry(10, 10, 10);
    this.material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, wireframe: false });
    this.box = new THREE.Mesh(this.geometry, this.material);
}
var posWidth = 50;
var pos = - posWidth;
var boxes = {};
var maxBoxes = 3;

for (var i = 0; i < maxBoxes; i++) {
    boxes[i] = new makeBox();
    scene.add(boxes[i].box);
    boxes[i].box.position.x = pos;
    pos += posWidth;
}
///
// Add some lghts
///
var pointLight = new THREE.PointLight(0xCCFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
scene.add(pointLight);

onRenderFcts.push(function (delta, now) {
    var inc = 0.01;
    for (var i = 0; i < maxBoxes; i++) {
        boxes[i].box.rotation.x += 0.0001 + inc;
        boxes[i].box.rotation.y += 0.0002 + inc;
        inc += 0.001;
    }
});


//////////////////////////////////////////////////////////////////////////////////
//		badTVPasses							//
//////////////////////////////////////////////////////////////////////////////////

// create a bad tv
var badTVPasses = new THREEx.BadTVPasses();
onRenderFcts.push(function (delta, now) {
    badTVPasses.update(delta, now);
});
// add a dat.gui to help you find the tunning which fit your needs
//THREEx.addBadTVPasses2DatGui(badTVPasses);

//////////////////////////////////////////////////////////////////////////////////
//		composer 							//
//////////////////////////////////////////////////////////////////////////////////
var composer = new THREE.EffectComposer(renderer);
var renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);
// add badTVPasses to composer	
badTVPasses.addPassesTo(composer);
composer.passes[composer.passes.length - 1].renderToScreen = true;
// init params
badTVPasses.params.badTV.distortion = 1;
badTVPasses.params.badTV.distortion2 = 0.5;
badTVPasses.params.badTV.speed = 2;
badTVPasses.params.badTV.rollSpeed = 0;
badTVPasses.params.staticNoise.amount = 0.2;
badTVPasses.params.staticNoise.size2 = 0.02;
badTVPasses.params.rgb.amount = 0.003;
badTVPasses.params.film.nIntensity = 0.005;
badTVPasses.tweenDelay = 0.5;
badTVPasses.onParamsChange();

onRenderFcts.push(function (delta, now) {
    // render thru composer
    composer.render(delta);
});

function randomise() {
    if (Math.random() > 0.99) {
        badTVPasses.params.badTV.distortion = 10 + Math.random() * 10;
    } else {
        badTVPasses.params.badTV.distortion = 0;
    }
    badTVPasses.params.staticNoise.size2 = Math.random() * 3;
    badTVPasses.params.staticNoise.amount = 0.05 + (Math.random() * 0.3);

    if (Math.random() > 0.99) {
        badTVPasses.params.rgb.amount = 0.2 + (Math.random() * 0.2);
    } else {
        badTVPasses.params.rgb.amount = 0.003;
    }
    badTVPasses.onParamsChange();
}


//////////////////////////////////////////////////////////////////////////////////
//		loop runner							//
//////////////////////////////////////////////////////////////////////////////////
var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    if (Math.random() > 0.5) {
        randomise();
    }
    controls.update();
    // call each update function
    onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000);
    });
});
function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"));
    } catch (e) {
        return false;
    }
}