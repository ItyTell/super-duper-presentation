
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	distance(point){
		return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
	}
}


class Triangle{
    constructor(a, b, c){
        this.points = [a, b, c];
        let d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
        let x = (culc_x(a, b, c) + culc_x(b, c, a) + culc_x(c, a, b)) / d;
        let y = (culc_y(a, b, c) + culc_y(b, c, a) + culc_y(c, a, b)) / d;
        let rad = Math.sqrt((x - a.x) ** 2 + (y - a.y) ** 2);
        this.circle = new Circle(new Point(x, y), rad);
        this.edges = [[a, b], [b, c], [c, a]];
    }
}

class Circle{
    constructor(center, rad){
        this.center = center;
        this.rad = rad;
    }

    is_inside(point){return (this.center.distance(point) < this.rad);}
}

// for voronoi expecially
class Arc {
	constructor(l, r, f, el, er) {
		this.left = l;
		this.right = r;
		this.focus = f; // Point
		this.edge = { left: el, right: er }; // Edge
		this.event = null;
	}
}


class Edge {
	constructor(p1, p2, startx) {
		this.m = -(p1.x - p2.x) / (p1.y - p2.y);
		this.q =
			(0.5 * (p1.x ** 2 - p2.x ** 2 + p1.y ** 2 - p2.y ** 2)) /
			(p1.y - p2.y);
		this.arc = { left: p1, right: p2 };
		this.end = null;
		this.start = null;
		if (startx)
			this.start = new Point(
				startx,
				this.m != Infinity ? this.getY(startx) : null
			);
	}
	getY(x) {
		if (this.m == Infinity) return null;
		return x * this.m + this.q;
	}
	getX(y) {
		if (this.m == Infinity) return this.start.x;
		return (y - this.q) / this.m;
	}
}