

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

var options = {
    framerate:60,
    G:250,
    START_SPEED:50,
    MOVER_COUNT:32,
    TRAILS_DISPLAY:true,
    TRAILS_LENGTH:200,
    MIN_MASS:1000,
    MAX_MASS:5000,
    DENSITY:0.25,

};

if (localStorage && localStorage.getItem("options")) options = JSON.parse(localStorage.getItem("options"));


options.RESET = function() {
    reset();
}

// dat GUI
var gui = new dat.GUI();
var f = gui.addFolder('Environment');
f.open();
//f.add(options, 'framerate', 1, 120);
f.add(options, 'G', 1, 1000);
var fMoverCountE = f.add(options, 'MOVER_COUNT', 1, 128);
fMoverCountE.onFinishChange(function(value) {
    // Fires when a controller loses focus.
    reset();
});

f = gui.addFolder('Trails');
f.open();
f.add(options, 'TRAILS_DISPLAY');
f.add(options, 'TRAILS_LENGTH', 0, 10000);

f = gui.addFolder('Masses');
f.open();
var fMinMassChangeE = f.add(options, 'MIN_MASS', .00001,10000.0);

fMinMassChangeE.onFinishChange(function(value) {
   reset();
});

var fMaxMassChangeE = f.add(options, 'MAX_MASS', .00001,10000.0);
fMaxMassChangeE.onFinishChange(function(value) {
    reset();
});

f = gui.addFolder('Start');
f.open();

var fDensityE = f.add(options, 'DENSITY', 1e-100,1.0);
fDensityE.onFinishChange(function(value) {
    reset();
});

var fSpeedE = f.add(options, 'START_SPEED', 1e-100,100.0);
fSpeedE.onFinishChange(function(value) {
    reset();
});

f.add(options, 'RESET');

console.log(gui);

//var HTTP_GET_VARS=new Array();
//var strGET=document.location.search.substr(1,document.location.search.length);
//if(strGET!='')
//{
//    gArr=strGET.split('&');
//    for(i=0;i<gArr.length;++i)
//    {
//        v='';vArr=gArr[i].split('=');
//        if(vArr.length>1){v=vArr[1];}
//        HTTP_GET_VARS[unescape(vArr[0])]=unescape(v);
//    }
//}
//
//function GET(v)
//{
//    if(!HTTP_GET_VARS[v]){return 'undefined';}
//    return HTTP_GET_VARS[v];
//}
//





//var G = 100;

//var MOVER_COUNT = 32;

//var MOVER_MASS_MIN = .0000001;
//var MOVER_MASS_MAX = 100;

///* GET parameters for configuration: */
//var GET_G = parseFloat(GET("G"));
//if (GET_G > 0) {
//    G = GET_G;
//}
//var GET_mover_count = parseInt(GET("count"));
//if (GET_mover_count) {
//    MOVER_COUNT = GET_mover_count;
//}
//var GET_min=parseFloat(GET("min"));
//if (GET_min > 0) {
//    MOVER_MASS_MIN = GET_min;
//}
//var GET_max=parseFloat(GET("max"));
//if (GET_max > 0) {
//    MOVER_MASS_MAX = GET_max;
//}

//var FPS = 60;
var MASS_FACTOR = .01; // for display of size

var SPHERE_SIDES = 12;
//var TRAILS_LENGTH = 100;

var zoom = 1.0;
var translate = new THREE.Vector3();

var movers = [];
var now;
var then = Date.now();
var renderInterval = 1000/parseInt(options.framerate);
var renderDelta;

var scene = new THREE.Scene({castShadow:true});
var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight,0.1,100000000.0);
var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
//var projector = new THREE.Projector();

var isMoverSelected = false;

var controls = new THREE.OrbitControls( camera, renderer.domElement );

//
//f = gui.addFolder('Blobs');
//f.open();

// END dat GUI


var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
});

scene.castShadow=true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClearColor = true;
//renderer.shadowMapEnabled=true;
document.body.appendChild(renderer.domElement);
//var geometry = new THREE.SphereGeometry(1.0,8,8);
//cube = new THREE.Mesh(geometry, material);
//scene.add(cube);
var cube;


var basicMaterial =  new THREE.MeshLambertMaterial({
    ambient: 0x111111, diffuse: 0x555555, specular: 0xffffff, shininess: 50
});

var selectedMaterial =  new THREE.MeshLambertMaterial({
    ambient: 0xaaaaaa, diffuse: 0xdddddd, specular: 0xffffff, shininess: 50,emissive:0x000000
});
// add subtle ambient lighting
// directional lighting
var directionalLight = new THREE.DirectionalLight(0x666666);
directionalLight.position.set(1000, 1000, 1000);
directionalLight.castShadow = true;
//scene.add(directionalLight);

var selectionLight = new THREE.PointLight(0xff0000,0);
selectionLight.castShadow = true;
//scene.add(selectionLight);

/*var redLight = new THREE.DirectionalLight(0xaa0000);
redLight.position.set(1, 0, 1);
scene.add(redLight);

var blueLight = new THREE.DirectionalLight(0x0000aa);
blueLight.position.set(1,1, 0);
scene.add(blueLight);

var greenLight = new THREE.DirectionalLight(0x00aa00);
greenLight.position.set(0, 1, 1);
scene.add(greenLight);*/

var $real_framerate = $("#real_framerate");
var $framerate = $("#framerate");
$framerate.bind("change keyup mouseup",function() {
    var v = parseInt(this.value);
    if (v > 0) {
        //options.framerate = v;
        renderInterval = 1000/parseInt(options.framerate);
    }
}).change();
//
//var $trails_length = $("#trails_length");
////TRAILS_LENGTH = parseInt($trails_length.val());
//$trails_length.bind("change",function(e) {
//   //TRAILS_LENGTH = parseInt(this.value);
//   $(this).parent().find("span").html(TRAILS_LENGTH);
//   render();
//   return false;
//}).change();

//var $activate_trails = $("#activate_trails");
//$activate_trails.bind("change",function() {
//   displayTrails = $(this).is(":checked");
//    return false;
//});
//
var $movers_alive_count = $("#movers_alive_count");
var $total_mass = $("#total_mass");
var $maximum_mass = $("#maximum_mass");
var displayMass = false;
//var displayTrails = $activate_trails.is(":checked");;
reset();

var pause = false;

function draw() {
    requestAnimationFrame(draw);
    now = Date.now();
    renderDelta = now - then;
    if (renderDelta > renderInterval) {
        then = now - (renderDelta % renderInterval);
        render();
    }
}
draw();

var lastTimeCalled = new Date();
var countFramesPerSecond=0;
var total_mass = 0;

function render() {
    var timeNow = new Date();
    if(lastTimeCalled && timeNow.getMilliseconds() < lastTimeCalled.getMilliseconds()){
        $real_framerate.html(countFramesPerSecond);
        countFramesPerSecond=1;
    } else {
        countFramesPerSecond += 1;
    }

    var movers_alive_count = 0;
    total_mass = 0;
    var maximum_mass = 0.00;

    if (movers && movers.length) {
        if (!pause) {


            for (var i = movers.length-1; i >= 0; i--) {
                var m = movers[i];

                if (m.alive) {
                    movers_alive_count ++;
                    total_mass += m.mass;
                    if (m.mass > maximum_mass) maximum_mass = m.mass;

                    for (var j =  movers.length-1; j >= 0; j--) {
                        var a = movers[j];
                        if (movers[i].alive && movers[j].alive && i != j) {
                            var distance = m.location.distanceTo(a.location);

                            var radiusM = Math.pow((m.mass / MASS_FACTOR/MASS_FACTOR / 4* Math.PI), 1/3)/3;
                            var radiusA = Math.pow((a.mass / MASS_FACTOR/MASS_FACTOR / 4* Math.PI), 1/3)/3;

                            if (distance < radiusM + radiusA) {
                                // merge objects
                                a.eat(m);
                            }
                            else
                            {
                               a.attract(m);
                            }
                        }
                    }
                }
            }
        }


        for (var i = movers.length-1; i >= 0; i--) {

            var m = movers[i];
            if (m.alive) {
                if (!pause) { m.update(); }
                m.display(displayMass);

            }

            updateTrails(m);
        }

        $movers_alive_count.html(movers_alive_count);
        $total_mass.html(total_mass.toFixed(2));
        $maximum_mass.html(maximum_mass.toFixed(2));

    }

    controls.update();
    renderer.render(scene, camera);

    lastTimeCalled = new Date();

}

function updateTrails(m) {
    if (isMoverSelected) {
        if (m.selected) {
            if (options.TRAILS_DISPLAY) {
                m.showTrails();
            } else {
                //m.showTrails();
                m.hideTrails();
            }
            this.selectionLight.intensity = 2;
            //this.directionalLight.intensity = 0.5;
            selectionLight.position = m.location;

            selectedMaterial.emissive = m.line.material.color;
            selectionLight.color = m.line.material.color;
            m.mesh.material = selectedMaterial;

        } else {
            m.mesh.material = m.basicMaterial;
            m.hideTrails();
//            if (displayTrails)
//                m.showTrails();
//            elsebasicm
//                m.hideTrails();
        }
    } else {
        m.mesh.material = m.basicMaterial;
        if (options.TRAILS_DISPLAY) {
            m.showTrails();
        } else {
            m.hideTrails();
        }
    }
}

window.onmousemove = function(e) {


    if (onMouseDown) onMouseDown.moved=true;

    var vector = new THREE.Vector3( ( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    //projector.unprojectVector( vector, camera );

    vector.unproject(camera);

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
        $("body").css("cursor","pointer");
    } else {
        $("body").css("cursor","default");
    }

}

var onMouseDown = false;
var theta= 0,phi=0;
var currentRadius = 2000.0;
setCamera();
window.onmousedown = function(e) {
    if (e.target.tagName === "CANVAS") {
        onMouseDown = {moved:false};
    }
}
window.onmouseup = function(e) {
    if (e.target.tagName === "CANVAS") {
        if (!onMouseDown.moved) {
            var vector = new THREE.Vector3( ( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1, 0.5 );


            vector.unproject(camera);

            var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

            var intersects = raycaster.intersectObjects( scene.children );

            if ( intersects.length > 0 ) {

                var clickedObj = (intersects[0].object);

                isMoverSelected = false;

                for  (var i = 0; i<movers.length; i=i+1) {
                    if (movers[i].mesh == clickedObj) {
                        movers[i].selected = !movers[i].selected;

                        isMoverSelected = movers[i].selected;

                        console.log("SELECTED p#"+i);
                    } else {
                        movers[i].selected = false;
                    }
                }

            }else {
                isMoverSelected = false;
            }
        }
    }
    onMouseDown = false;
}

window.onresize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
var holdLeft = false,holdRight = false,holdUp = false,holdDown = false;

window.onkeydown = function(e) {
           if (e.which == 37) {
        holdLeft = true;
    } else if (e.which == 38) {
        holdUp = true;
    } else if (e.which == 39) {
        holdRight = true;
    } else if (e.which == 40) {
        holdDown = true;
//    } else if (e.which === 82) {
//        reset();
    } else if (e.which === 84) {        // [T]rails
        $activate_trails.prop("checked", !$activate_trails.prop("checked")).change();

    } else if (e.which === 32) {
        pause = !pause;
        e.preventDefault();
        return false;
    } else {
       console.log(e.which);
    }
}
window.onkeyup = function(e) {
    if (e.which == 37) {
        holdLeft = false;
    } else if (e.which == 38) {
        holdUp = false;
    } else if (e.which == 39) {
        holdRight = false;
    } else if (e.which == 40) {
        holdDown = false;
    }
}
/* UNIVERSE */
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
function reset() {
    if (movers) {
        for (var i=0;i<movers.length;i=i+1) {
            scene.remove(movers[i].mesh);
            scene.remove(movers[i].selectionLight);
            scene.remove(movers[i].line);
        }
    }

    movers = [];
    translate.x = 0.0;
    translate.y = 0.0;
    translate.z = 0.0;

    // generate N movers with random mass (N = MOVER_COUNT)
    for (var i=0;i<parseInt(options.MOVER_COUNT);i=i+1) {
        var mass = random(options.MIN_MASS,options.MAX_MASS);

        var max_distance = parseFloat(1000 / options.DENSITY);
        var max_speed = parseFloat(options.START_SPEED);


        var vel = new THREE.Vector3(random(-max_speed,max_speed),random(-max_speed,max_speed),random(-max_speed,max_speed));
        //var vel = new THREE.Vector3();
        var loc = new THREE.Vector3(random(-max_distance,max_distance),random(-max_distance,max_distance),random(-max_distance,max_distance));

        movers.push(new Mover(mass,vel,loc));
    }


    localStorage.setItem("options",JSON.stringify(options));
}
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
/* MOVER CLASS */
function Mover(m,vel,loc) {
    this.location = loc,
    this.velocity = vel,
    this.acceleration = new THREE.Vector3(0.0,0.0,0.0),
    this.mass = m,
    this.c = 0xffffff,
    this.alive = true;
    this.geometry = new THREE.SphereGeometry(100.0,SPHERE_SIDES,SPHERE_SIDES);

    this.vertices = [];     // PATH OF MOVEMENT

    this.line = new THREE.Line();       // line to display movement

    this.color = this.line.material.color;
    //this.line = THREE.Line(this.lineGeometry, lineMaterial);

    this.basicMaterial =  new THREE.MeshPhongMaterial({
        ambient: 0x111111, color: this.color, specular: this.color, shininess: 10
    });

    this.selectionLight = new THREE.PointLight(this.color,.1);
    this.selectionLight.position.copy(this.location);
    this.mesh = new THREE.Mesh(this.geometry,this.basicMaterial);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;


    this.position = this.location;

    this.index = movers.length;
    this.selected = false;

    scene.add(this.mesh);
    scene.add(this.selectionLight);
    //scene.add(this.line);
    //c = color( constrain(vel.mag()*100,0,255),
    //    constrain(255-vel.mag()*20,0,255),
    //    constrain(255-vel.mag()*50,0,255));

    this.applyForce = function(force) {
        if (!this.mass) this.mass = 1.0;
        var f = force.divideScalar(this.mass);
        this.acceleration.add(f);
    };
    this.update = function() {

        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.acceleration.multiplyScalar(0);

        this.selectionLight.position.copy(this.location);
        this.mesh.position.copy(this.location);
        //this.lineGeometry.

        if (this.vertices.length > 10000) this.vertices.splice(0,1);

        this.vertices.push(this.location.clone());
        //this.lineGeometry.verticesNeedUpdate = true;




    };
    this.eat = function(m) { // m => other Mover object
        var newMass = this.mass + m.mass;

        var newLocation = new THREE.Vector3(
            (this.location.x * this.mass + m.location.x * m.mass)/newMass,
            (this.location.y * this.mass + m.location.y * m.mass)/newMass,
            (this.location.z * this.mass + m.location.z * m.mass)/newMass);
        var newVelocity = new THREE.Vector3(
            (this.velocity.x *this.mass + m.velocity.x * m.mass) / newMass,
            (this.velocity.y *this.mass + m.velocity.y * m.mass) / newMass,
            (this.velocity.z *this.mass + m.velocity.z * m.mass) / newMass);

        this.location=newLocation;
        this.velocity=newVelocity;
        this.mass = newMass;

        if (m.selected) this.selected = true;

        m.kill();
    };
    this.kill = function () {
        this.alive=false;
        this.selectionLight.intensity = 0;
        scene.remove(this.mesh);
    };
    this.attract = function(m) {   // m => other Mover object
        var force = new THREE.Vector3().subVectors(this.location,m.location);         // Calculate direction of force
        var d = force.length();                              // Distance between objects
        if (d<0) d*=-1;
        //d = constrain(d,5.0,25.0);                        // Limiting the distance to eliminate "extreme" results for very close or very far objects
        force = force.normalize();                                  // Normalize vector (distance doesn't matter here, we just want this vector for direction)
        var strength = - (options.G * this.mass * m.mass) / (d * d);      // Calculate gravitional force magnitude
        force = force.multiplyScalar(strength);                             // Get force vector --> magnitude * direction
        //console.log("distance", d, "strength", strength);
        //console.log("force",force);
        //console.log(force.x);
        this.applyForce(force);
        //return m;
    };
    this.display = function() {
        if (this.alive) {
            var scale = Math.pow((this.mass*MASS_FACTOR/(4*Math.PI)), 1/3);
            this.mesh.scale.x = scale;
            this.mesh.scale.y = scale;
            this.mesh.scale.z = scale;

           //this.line = new THREE.Line(this.lineGeometry,lineMaterial);

            if (isMoverSelected) {
                if (this.selected) {
                    this.selectionLight.intensity = 1;
                } else {
                    this.selectionLight.intensity = 0;
                }
            } else {
                this.selectionLight.intensity = 2* this.mass / total_mass;
                var emissiveColor = this.color.getHex().toString(16);
                emissiveColor = darkenColor(emissiveColor,-1+this.mass/total_mass);
                //emissiveColor = emissiveColor;
                this.basicMaterial.emissive.setHex(parseInt(emissiveColor,16));


                //console.log(emissiveColor, this.basicMaterial.emissive.getHex().toString(16));

            }

        } else {
            this.selectionLight.intensity = 0;
        }

    };

    this.showTrails = function() {
        if (!this.lineDrawn) {
            this.lineDrawn = true;
            scene.add(this.line);
        } else if (this.lineDrawn === true) {
            scene.remove(this.line);
            var newLineGeometry = new THREE.Geometry();
            newLineGeometry.vertices = this.vertices.slice();

            newLineGeometry.verticesNeedUpdate = true;
            if (!pause && !this.alive) {
                this.vertices.shift();
            }
            while (newLineGeometry.vertices.length > parseInt(options.TRAILS_LENGTH)) {
                newLineGeometry.vertices.shift();
            }
            this.line = new THREE.Line(newLineGeometry, this.line.material);
            scene.add(this.line);
        }
    }
    this.hideTrails = function() {
        if (this.lineDrawn) {
            scene.remove(this.line);
            this.lineDrawn = false;
        }
    }


}

function constrain(value,min,max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function setCamera() {
    for (var i = 0; i < movers.length; i=i+1 ) {
        updateTrails(movers[i]);
    }
    camera.position.x = currentRadius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.position.y = currentRadius * Math.sin( phi * Math.PI / 360 );
    camera.position.z = currentRadius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.updateMatrix();
}

function darkenColor(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
