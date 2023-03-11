
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

    drew_points(){this.points.forEach(point=>{drew_point(this.ctx, point, this.rad);})}

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

var canvas_basic = new Canvas("canvas_basic"),
    canvas_anim = new Canvas("canvas_anim"), 
    canvas_demo_2 = new Canvas("canvas_demo_2");
var canvases = [canvas_basic, canvas_anim, canvas_demo_2];
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

function rand_points(canvas){for (let i = 0; i < 10; i++){new_point({x: Math.random() * canvas.cnv.width, y: Math.random() * canvas.cnv.height}, canvas)}}

document.getElementById("canvas_basic_clear").onclick = function(){clear_points(canvas_basic);}
document.getElementById("canvas_basic_rand").onclick = function(){rand_points(canvas_basic)}
document.getElementById("canvas_basic_voronoi").onclick = function(){clear_edges(canvas_basic); voronoi(canvas_basic)}
document.getElementById("canvas_basic_delone").onclick = function(){clear_edges(canvas_basic); delone(canvas_basic)}
document.getElementById("canvas_basic").onclick = function(){new_point_canvas_static(event, canvas_basic);}

document.getElementById("canvas_anim_rad").oninput = function(){canvas_2.rad = this.valueAsNumber; redrew_points(canvas_2);}

document.getElementById("canvas_anim_clear").onclick = function(){clear_points(canvas_anim);}
document.getElementById("canvas_anim_rand").onclick = function(){rand_points(canvas_anim)}
document.getElementById("canvas_anim_voronoi").onclick = function(){start_voronoi();}
document.getElementById("canvas_anim").onclick = function(){new_point_canvas_static(event, canvas_anim);}

document.getElementById("canvas_anim_rad").oninput = function(){canvas_4.rad = this.valueAsNumber; redrew_points(canvas_4);}
document.getElementById("canvas_4_anim_speed").oninput = function(){anim_cooldown_2 = (15 - this.valueAsNumber) / 100;}

canvas_demo_2.cnv.addEventListener('mousemove', (event) => {arcs_move(event);});
document.getElementById("canvas_demo_2").onclick = function(){new_point_canvas_static(event, canvas_demo_2)}
document.getElementById("canvas_demo_2_rad").oninput = function(){canvas_5.rad = this.valueAsNumber; redrew_points(canvas_demo_2);}

