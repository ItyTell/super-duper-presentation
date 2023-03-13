
class Canvas {
    constructor(id){
        this.cnv = document.getElementById(id);
        this.ctx  = this.cnv.getContext("2d");
        this.rad = document.getElementById(id + "_rad").valueAsNumber;
        this.points = [];
        this.zoom_scale_x = 1; this.zoom_scale_y = 1; 
        this.now = 0; this.then = 0;
    }

    clear(){this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);}

    drew_points(color="red"){this.points.forEach(point=>{drew_point(this.ctx, point, this.rad, color);})}

    check_cords(cords){
        let flag = true;
        if ((cords.x - this.rad < 0) || (cords.y - this.rad < 0)){return false;}
        if ((cords.x + this.rad > this.cnv.width) || (cords.y + this.rad > this.cnv.height)){return false;}
        this.points.forEach(point=> {if (point.distance(cords) < 2 * this.rad){flag = false}})
        return flag;
};


}

var canvas_width_old, canvas_height_old;
var zoom_scale_x, zoom_scale_y;

var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    render, engine;

var speed, voronoi_on, delone_on;
var points_bodies_canvas_1 = [];
var walls = [];

var vor_anim;
var tri, cash;
var anim_length;

var r = 0;
var incr = 0.5;
var cells;
var edges;
const tau = 2 * Math.PI;


var canvas_basic = new Canvas("canvas_basic"),
    canvas_anim = new Canvas("canvas_anim"), 
    canvas_demo_2 = new Canvas("canvas_demo_2"),
    canvas_demo_1 = new Canvas("canvas_demo_1"),
    canvas_demo_3 = new Canvas("canvas_demo_3");
var canvases = [canvas_basic, canvas_anim, canvas_demo_1, canvas_demo_2, canvas_demo_3];
var anim_cooldown_1, anime_on = false, anim_cooldown_2;


window.onload = function()
{
    canvas_width_old = 1000;
    canvas_height_old = 600;
    speed = 10; render = 1;
    anim_cooldown_2 = document.getElementById("canvas_4_anim_speed").valueAsNumber;
    voronoi_on = true; delone_on = false;
    canvases.forEach(canvas=> {resizeCanvas(canvas);})
    recordinate_points();

    canvas_demo_2.points.push(new Point(100000, 10000));
    canvas_demo_2.points.push(new Point(100200, 10000));
    canvas_demo_2.points.push(new Point(100400, 10400));
}


function resizeCanvas(canvas)
{
    canvas_width_old = canvas.cnv.width; canvas_height_old = canvas.cnv.height;
    canvas.cnv.width  = window.innerWidth * 0.45 + 150; canvas.cnv.height = window.innerHeight * 0.85;
    this.zoom_scale_x = canvas.width / canvas_width_old; this.zoom_scale_y = canvas.height  / canvas_height_old; 
}

window.addEventListener('resize', function(){canvases.forEach(canvas=> {resizeCanvas(canvas);});recordinate_points();});

function recordinate_points()
{
    canvases.forEach(canvas=>{
        canvas.points.forEach(point=>{
            point.x = point.x * canvas.zoom_scale_x;
            point.y = point.y * canvas.zoom_scale_y;
        })
        canvas.clear();
        canvas.drew_points();
    })
}


function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {x: event.clientX - rect.left, y: event.clientY - rect.top};
};

function new_point_canvas_static(event, canvas) {mouse = getMousePos(canvas.cnv, event); new_point(mouse, canvas);};
function new_point(mouse, canvas){if (canvas.check_cords(mouse)){canvas.points.push(new Point(mouse.x, mouse.y)); drew_point(canvas.ctx, mouse, canvas.rad);};}

function redrew_points(canvas){canvas.clear(); canvas.drew_points();}

function clear_points(canvas){canvas.clear();canvas.points = [];}

function clear_edges(canvas){canvas.clear(); canvas.drew_points();}

function voronoi(canvas){
    if (canvas.points.length < 2){return;}
    let vor = new VoronoiDiagram(canvas.points, canvas.cnv.width, canvas.cnv.height); 
    vor.update(); let segments = vor.edges;
    segments.forEach(segm=>{if (segm != null){drew_segments(canvas.ctx, segm);}}) 
}

function delone(canvas){
    tri = new Triangulation(canvas.cnv.width, canvas.cnv.height); canvas.points.forEach(point =>{tri.add_point(point);})
    tri.chop(canvas.cnv.width, canvas.cnv.height);
    tri.triangles.forEach(triangle=> {drew_triangle(canvas.ctx, triangle, "red");})
}


function start_voronoi(){
    then = Date.now();
    vor_anim = new VoronoiDiagram_anim(canvas_anim.points, canvas_anim.cnv.width, canvas_anim.cnv.height, canvas_anim.ctx);
    vor_anim.update_start();
    anime_on = true; voronoi_anim();
}

function voronoi_anim(){
    now = Date.now();
    let elapsed = now - then;
    if (elapsed > anim_cooldown_2){
        canvas_anim.clear();
        anime_on = vor_anim.update();
        canvas_anim.drew_points();
        then = now;
    }
    if (anime_on){requestAnimationFrame(voronoi_anim);}
    else{canvas_anim.clear();canvas_anim.drew_points(); 
		vor_anim.edges.forEach(edge=> {if (edge != null){drew_segments(canvas_anim.ctx, edge, "green");}})}	
}


function arcs_move(event){
    canvas_demo_2.clear();
    mouse = getMousePos(canvas_demo_2.cnv, event);
    let vor_dem = new VoronoiDiagram_demo(canvas_demo_2.points, canvas_demo_2.cnv.width, canvas_demo_2.cnv.height, canvas_demo_2.ctx);
    let y = mouse.y;
    vor_dem.update_start();
    vor_dem.update(y);
    canvas_demo_2.clear();
    vor_dem.end(y);
    canvas_demo_2.drew_points();
}

function new_cell(event){
    let canvas = canvas_demo_3;
    canvas.clear();
    mouse = getMousePos(canvas_demo_3.cnv, event)
    if (canvas.points.length < 1){return;}
    let vr = new Voronoi();
    let points = [...canvas.points];
    points.push(mouse);
    let diagram = vr.compute(points, {xl: 0, xr:canvas.cnv.width, yt: 0, yb: canvas.cnv.height})
    diagram.edges.forEach(vertice=>{drew_segments(canvas.ctx, {start: vertice.va, end: vertice.vb});})
    drew_point(canvas.ctx, mouse, canvas.rad);
    canvas.drew_points();
    if (true){
        let a = new Point(1, 2);
        a.ctx = canvas.ctx;
        a.points = points;
        a.rad = canvas.rad;
        a.cnv = canvas.cnv;
        a.drew_points = canvas.drew_points;
        drew_static(a)}
}

function start_drew(canvas){
    canvas.clear();
    r = 0;
    incr = 0.5;

	let vrn = new Voronoi();
    let diagram = vrn.compute(canvas.points, {xl: 0, xr:canvas.cnv.width, yt: 0, yb: canvas.cnv.height});
    cells = diagram.cells;
    edges = diagram.edges;
	for (let i=0; i<cells.length; i++) {
		let cell = cells[i];
		if (cell) {
			let halfedges = cell.halfedges;
			let nHalfedges = halfedges.length;
			let rMax = 0;
			for (let j=0; j<nHalfedges; j++) {
				let vertex = halfedges[j].getEndpoint();
				let dx = vertex.x - cell.site.x,
					dy = vertex.y - cell.site.y,
					dv = Math.sqrt(dx*dx + dy*dy);
				if (dv > rMax) {rMax = dv;}						
			}
			cell.rMax = rMax;
		}
    }
	requestAnimationFrame(draw);
}

function draw() {
    canvas = canvas_demo_1;
	r += incr;
	let finished = true;
    let ctx = canvas.ctx;
	for (let i=0; i < cells.length; i++) {				
		let cell = cells[i];
		if (cell && r <= cell.rMax) { 
			finished = false;
			let halfedges = cell.halfedges;
			let nHalfedges = halfedges.length;					
			if (nHalfedges > 2) {
				ctx.beginPath(); // draw a cell:
				let vertex = halfedges[0].getStartpoint();
				ctx.moveTo(vertex.x, vertex.y);
				for (let j=0; j<nHalfedges; j++) {					
					vertex = halfedges[j].getEndpoint();
				    ctx.lineTo(vertex.x,vertex.y);	
					//ctx.moveTo(vertex.x,vertex.y);	
				}
                ctx.lineWidth = 1 / 1000;
				//ctx.stroke();					
				ctx.save();
				ctx.clip();
				ctx.fillStyle = "hsl(" + (Math.floor(i*100))%360 + ", 80%, 50%)"; //color
				// draw a growing circle around the site (that is clipped by the previous drawn cell):
				drawCircle(ctx, cell.site.x,cell.site.y,r);
				ctx.restore();
			}
		}								
	}
    canvas.drew_points(color="black");
	ctx.beginPath();
	let	iEdge = edges.length,
		edge, v;
	while (iEdge--) {
		edge = edges[iEdge];
		v = edge.va;
		ctx.moveTo(v.x,v.y);
		v = edge.vb;
		ctx.lineTo(v.x,v.y);
		}
	ctx.stroke();
	if (finished) {} 
	else { requestFrame = requestAnimationFrame(draw); }
};



function drew_static(canvas){
    let cells_static;
    let edges_static;
	let vrn = new Voronoi();
    let diagram = vrn.compute(canvas.points, {xl: 0, xr:canvas.cnv.width, yt: 0, yb: canvas.cnv.height});
    cells_static = diagram.cells;
    edges_static = diagram.edges;
	for (let i=0; i<cells_static.length; i++) {
		let cell = cells_static[i];
		if (cell) {
			let halfedges = cell.halfedges;
			let nHalfedges = halfedges.length;
			let rMax = 0;
			for (let j=0; j<nHalfedges; j++) {
				let vertex = halfedges[j].getEndpoint();
				let dx = vertex.x - cell.site.x,
					dy = vertex.y - cell.site.y,
					dv = Math.sqrt(dx*dx + dy*dy);
				if (dv > rMax) {rMax = dv;}						
			}
			cell.rMax = rMax;
		}
    }
    let ctx = canvas.ctx;
	for (let i=0; i < cells_static.length; i++) {				
		let cell = cells_static[i];
		if (cell){ 
			let halfedges = cell.halfedges;
			let nHalfedges = halfedges.length;					
			if (nHalfedges > 2) {
				ctx.beginPath(); // draw a cell:
				let vertex = halfedges[0].getStartpoint();
				ctx.moveTo(vertex.x, vertex.y);
				for (let j=0; j<nHalfedges; j++) {					
					vertex = halfedges[j].getEndpoint();
				    ctx.lineTo(vertex.x,vertex.y);	
					//ctx.moveTo(vertex.x,vertex.y);	
				}
                ctx.lineWidth = 1 / 1000;
				ctx.save();
				ctx.clip();
				ctx.fillStyle = "hsl(" + (Math.floor(i*100))%360 + ", 80%, 50%)"; //color
				drawCircle(ctx, cell.site.x,cell.site.y,cell.rMax);
				ctx.restore();
			}
		}								
	}
    canvas.drew_points(color="black");
	ctx.beginPath();
	let	iEdge = edges_static.length,
		edge, v;
	while (iEdge--) {
		edge = edges_static[iEdge];
		v = edge.va;
		ctx.moveTo(v.x,v.y);
		v = edge.vb;
		ctx.lineTo(v.x,v.y);
		}
	ctx.stroke();

}




function rand_points(canvas){for (let i = 0; i < 10; i++){new_point({x: Math.random() * canvas.cnv.width, y: Math.random() * canvas.cnv.height}, canvas)}}

document.getElementById("canvas_demo_1_clear").onclick = function(){clear_points(canvas_demo_1);}
document.getElementById("canvas_demo_1_rand").onclick = function(){rand_points(canvas_demo_1)}
document.getElementById("canvas_demo_1_drew").onclick = function(){start_drew(canvas_demo_1)}
document.getElementById("canvas_demo_1").onclick = function(){new_point_canvas_static(event, canvas_demo_1);}

document.getElementById("canvas_demo_1_rad").oninput = function(){canvas_demo_1.rad = this.valueAsNumber; redrew_points(canvas_demo_1);}


document.getElementById("canvas_basic_clear").onclick = function(){clear_points(canvas_basic);}
document.getElementById("canvas_basic_rand").onclick = function(){rand_points(canvas_basic)}
document.getElementById("canvas_basic_voronoi").onclick = function(){voronoi(canvas_basic)}
document.getElementById("canvas_basic_delone").onclick = function(){delone(canvas_basic)}
document.getElementById("canvas_basic_drew").onclick = function(){drew_static(canvas_basic)}
document.getElementById("canvas_basic").onclick = function(){new_point_canvas_static(event, canvas_basic);}

document.getElementById("canvas_basic_rad").oninput = function(){canvas_basic.rad = this.valueAsNumber; redrew_points(canvas_basic);}

document.getElementById("canvas_anim_clear").onclick = function(){clear_points(canvas_anim);}
document.getElementById("canvas_anim_rand").onclick = function(){rand_points(canvas_anim)}
document.getElementById("canvas_anim_voronoi").onclick = function(){start_voronoi();}
document.getElementById("canvas_anim").onclick = function(){new_point_canvas_static(event, canvas_anim);}

document.getElementById("canvas_anim_rad").oninput = function(){canvas_anim.rad = this.valueAsNumber; redrew_points(canvas_anim);}
document.getElementById("canvas_4_anim_speed").oninput = function(){anim_cooldown_2 = (15 - this.valueAsNumber) / 100;}

canvas_demo_2.cnv.addEventListener('mousemove', (event) => {arcs_move(event);});
document.getElementById("canvas_demo_2").onclick = function(){new_point_canvas_static(event, canvas_demo_2)}
document.getElementById("canvas_demo_2_rad").oninput = function(){canvas_demo_2.rad = this.valueAsNumber; redrew_points(canvas_demo_2);}


canvas_demo_3.cnv.addEventListener('mousemove', (event) => {new_cell(event);});
document.getElementById("canvas_demo_3").onclick = function(){new_point_canvas_static(event, canvas_demo_3)}
document.getElementById("canvas_demo_3_rad").oninput = function(){canvas_demo_3.rad = this.valueAsNumber; redrew_points(canvas_demo_3);}

