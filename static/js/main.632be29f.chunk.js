(this["webpackJsonpmy-app"]=this["webpackJsonpmy-app"]||[]).push([[0],{13:function(t,i,e){},14:function(t,i,e){},16:function(t,i,e){"use strict";e.r(i);var s=e(4),a=e(3),n=e.n(a),o=e(6),h=e.n(o),r=(e(13),e(14),e(0)),c=e(1),l={framerate:60,G:250,startSpeed:30,moverCount:40,trailsDisplay:!0,trailsLength:100,minMass:400,maxMass:3e3,density:.15},v=.01,d=e(2),m=e(7);var u=function(t,i,e){var s=(new d.l).subVectors(t.location,i.location),a=Math.sqrt(Math.pow(s.length(),2));s=s.normalize();var n=-e*t.mass*i.mass/Math.pow(a,2);return s.multiplyScalar(n)},p=function(){function t(i,e,s,a,n){Object(r.a)(this,t),this.uid=void 0,this.location=void 0,this.velocity=void 0,this.acceleration=void 0,this.mass=void 0,this.alive=void 0,this.geometry=void 0,this.vertices=void 0,this.line=void 0,this.color=void 0,this.basicMaterial=void 0,this.selectionLight=void 0,this.mesh=void 0,this.position=void 0,this.parentScene=void 0,this.uid="mover-".concat(a),this.location=s,this.velocity=e,this.acceleration=new d.l(0,0,0),this.mass=i,this.alive=!0,this.geometry=new d.k(100,20,20),this.vertices=[],this.line=new d.e,this.color=new d.b(16777215*Math.random()),this.basicMaterial=new d.g({color:this.color,specular:this.color,shininess:10}),this.selectionLight=new d.i(this.color,.1),this.selectionLight.position.copy(this.location),this.mesh=new d.f(this.geometry,this.basicMaterial),this.mesh.castShadow=!1,this.mesh.receiveShadow=!0,this.position=this.location,this.parentScene=n}return Object(c.a)(t,[{key:"addMover",value:function(){this.parentScene.add(this.mesh),this.parentScene.add(this.selectionLight),this.parentScene.add(this.line)}},{key:"applyForce",value:function(t){this.mass||(this.mass=1);var i=t.divideScalar(this.mass);this.acceleration.add(i)}},{key:"update",value:function(){this.velocity.add(this.acceleration),this.location.add(this.velocity),this.acceleration.multiplyScalar(0),this.selectionLight.position.copy(this.location),this.mesh.position.copy(this.location),this.vertices.length>1e4&&this.vertices.splice(0,1),this.vertices.push(this.location.clone())}},{key:"eat",value:function(t){var i=this.mass+t.mass,e=new d.l((this.location.x*this.mass+t.location.x*t.mass)/i,(this.location.y*this.mass+t.location.y*t.mass)/i,(this.location.z*this.mass+t.location.z*t.mass)/i),s=new d.l((this.velocity.x*this.mass+t.velocity.x*t.mass)/i,(this.velocity.y*this.mass+t.velocity.y*t.mass)/i,(this.velocity.z*this.mass+t.velocity.z*t.mass)/i);this.location=e,this.velocity=s,this.mass=i,t.kill()}},{key:"attract",value:function(t,i){var e=u(this,t,i);this.applyForce(e)}},{key:"kill",value:function(){this.alive=!1,this.selectionLight.intensity=0,this.parentScene.remove(this.mesh)}},{key:"display",value:function(t){if(this.alive){var i=Math.pow(this.mass*v/(4*Math.PI),1/3);this.mesh.scale.x=i,this.mesh.scale.y=i,this.mesh.scale.z=i,this.selectionLight.intensity=2*this.mass/t;var e=this.color.getHex().toString(16);e=function(t,i){var e=parseInt(t.slice(1),16),s=i<0?0:255,a=i<0?i-1:i,n=e>>16,o=e>>8&255,h=255&e;return(16777216+65536*(Math.round((s-n)*a)+n)+256*(Math.round((s-o)*a)+o)+(Math.round((s-h)*a)+h)).toString(16).slice(1)}(e,this.mass/t-1),this.basicMaterial.emissive.setHex(parseInt(e,16))}else this.selectionLight.intensity=0}},{key:"showTrace",value:function(t){this.parentScene.remove(this.line);var i=new d.d;for(i.vertices=this.vertices.slice(),i.verticesNeedUpdate=!0,this.alive||this.vertices.shift();i.vertices.length>t;)i.vertices.shift();this.line=new d.e(i,this.line.material),this.parentScene.add(this.line)}}]),t}(),f=function(){function t(i){var e=this;Object(r.a)(this,t),this.rootElement=void 0,this.size=void 0,this.camSettings=void 0,this.currentRadius=void 0,this.options=void 0,this.startTime=void 0,this.renderInterval=void 0,this.now=0,this.deltaT=0,this.scene=void 0,this.camera=void 0,this.renderer=void 0,this.controls=void 0,this.totalMass=void 0,this.movers=void 0,this.rootElement=i,this.size={w:window.innerWidth,h:window.innerHeight},this.camSettings={fov:40,aspect:this.size.w/this.size.h,near:.001,far:1e9},this.currentRadius=12e3,this.options=l,this.options.reset=function(){e.reset()},this.startTime=this.now=Date.now(),this.renderInterval=1e3/this.options.framerate,this.scene=new d.j,this.camera=new d.h(this.camSettings.fov,this.camSettings.aspect,this.camSettings.near,this.camSettings.far),this.renderer=new d.m({preserveDrawingBuffer:!0,antialias:!0}),this.renderer.setSize(this.size.w,this.size.h),this.renderer.setClearColor(0),this.controls=new m.OrbitControls(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.rotateSpeed=.3,this.rootElement.append(this.renderer.domElement),this.totalMass=0,this.movers=[];var s=new d.c(6710886);s.position.set(1e3,1e3,1e3),s.castShadow=!0;var a=new d.a(1e4);this.scene.add(a),this.setCamera(),this.draw(),this.reset()}return Object(c.a)(t,[{key:"reset",value:function(){var t=this,i=this.movers;i&&i.forEach((function(i){t.scene.remove(i.mesh),t.scene.remove(i.selectionLight),t.scene.remove(i.line)})),i=[];for(var e=0;e<this.options.moverCount;e++){var s=this.getRandomize(this.options.minMass,this.options.maxMass),a=1e3/this.options.density,n=this.options.startSpeed,o=new d.l(this.getRandomize(-n,n),this.getRandomize(-n,n),this.getRandomize(-n,n)),h=new d.l(this.getRandomize(-a,a),this.getRandomize(-a,a),this.getRandomize(-a,a));i.push(new p(s,o,h,"mover-".concat(e),this.scene))}i.forEach((function(t){t.addMover()})),this.movers=i}},{key:"draw",value:function(){var t=this;window.requestAnimationFrame((function(){t.draw()})),this.now=Date.now(),this.deltaT=this.now-this.startTime,this.deltaT>this.renderInterval&&(this.startTime=this.now-this.deltaT%this.renderInterval,this.render())}},{key:"render",value:function(){this.totalMass=0,this.movers.length>0&&this.calcMovers(),this.controls.update(),this.renderer.render(this.scene,this.camera)}},{key:"setCamera",value:function(){var t=this;this.movers.forEach((function(i){t.updateTrace(i)})),this.camera.position.set(this.currentRadius,this.currentRadius,this.currentRadius),this.camera.lookAt(new d.l),this.camera.updateMatrix()}},{key:"updateTrace",value:function(t){this.options.trailsDisplay&&t.showTrace(this.options.trailsLength)}},{key:"calcMovers",value:function(){var t=this,i=this.movers;i.forEach((function(e,s){if(!e.alive)return!1;e.alive&&(t.totalMass+=e.mass,i.forEach((function(i,a){e.alive&&i.alive&&s!==a&&(e.location.distanceTo(i.location)<=Math.pow(e.mass/v/v/(4*Math.PI),1/3)+Math.pow(i.mass/v/v/(4*Math.PI),1/3)?i.eat(e):i.attract(e,t.options.G))})))})),this.updateMovers()}},{key:"updateMovers",value:function(){for(var t=this.movers,i=t.length-1;i>=0;i--){var e=t[i];e.alive&&(e.update(),e.display(this.totalMass)),this.updateTrace(e)}}},{key:"getRandomize",value:function(t,i){return Math.random()*(i-t)+t}}]),t}();var w=function(){var t=Object(a.useRef)(null);return Object(a.useEffect)((function(){if(null!=t.current){var i=t.current;new f(i)}}),[]),Object(s.jsx)("div",{ref:t})},y=function(t){t&&t instanceof Function&&e.e(3).then(e.bind(null,17)).then((function(i){var e=i.getCLS,s=i.getFID,a=i.getFCP,n=i.getLCP,o=i.getTTFB;e(t),s(t),a(t),n(t),o(t)}))};h.a.render(Object(s.jsx)(n.a.StrictMode,{children:Object(s.jsx)(w,{})}),document.getElementById("root")),y()}},[[16,1,2]]]);
//# sourceMappingURL=main.632be29f.chunk.js.map