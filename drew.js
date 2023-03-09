

function drew_point(ctx, point, rad, color = "red"){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, rad, 0, Math.PI * 2)
    ctx.stroke();
    ctx.fill();
}


function drew_points(ctx, points, rad){
    for (let i = 0; i < points.length; i++){
        drew_point(ctx, points[i], rad);
    };
};

function drew_line(ctx, segm, color ="#0bceaf" ){
    ctx.beginPath();
    ctx.moveTo(segm[0].x, segm[0].y);
    ctx.lineTo(segm[1].x, segm[1].y);
    ctx.strokeStyle = color; 
    ctx.stroke();
}


function drew_segments(ctx, segm, color ="#0bceaf" ){
    ctx.beginPath();
    ctx.moveTo(segm.start.x, segm.start.y);
    ctx.lineTo(segm.end.x, segm.end.y);
    ctx.strokeStyle = color; 
    ctx.stroke();
}

function drew_arc(ctx, y, arc, color = "red"){
    let k = 10000;    
    let d = (y - arc.focus.y) / 2;    
    let x1; let x2; let y1; let y2;
    x1 = -k;
    if (arc.left != null){x1 = parab_intersect(y, arc.left.focus, arc.focus) - arc.focus.x;
        drew_line(ctx, [arc.edge.left.start, new Point(arc.focus.x + x1, y - d - (x1 * x1) / (4 * d))], "black");}
    
    y1 = (x1 * x1) / (4 * d);
    ctx.beginPath();
    ctx.moveTo(arc.focus.x + x1, y - d - y1);
    x2 = k;
    if (arc.right != null){
        x2 = parab_intersect(y, arc.focus, arc.right.focus) - arc.focus.x;
    }
    y2 = (x2 * x2) / (4 * d);
    ctx.quadraticCurveTo(arc.focus.x + x1 / 2 + x2 / 2, y - d + Math.sign(-x1 * x2) * (y1 * y2) ** 0.5, arc.focus.x + x2, y - d - y2);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drew_triangle(ctx, triangle, color = "#0bceaf"){
    ctx.beginPath();
    ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
    ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
    ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
    ctx.lineTo(triangle.points[0].x, triangle.points[0].y);
    ctx.strokeStyle = color; 
    ctx.stroke();
}

function drew_circle(ctx, circle, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.rad, 0, Math.PI * 2)
    ctx.stroke();
}
