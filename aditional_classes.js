
class Event {
	constructor(type, position, caller, vertex) {
		this.type = type;
		this.caller = caller;
		this.position = position;
		this.vertex = vertex;
		this.active = true;
	}
}

class SortedQueue {
	constructor(events) {
		this.list = [];
		if (events) this.list = events;
		this.sort();
	}

	get length() {
		return this.list.length;
	}

	extract_first() {
		if (this.list.length > 0) {
			let elm = this.list[0];
			this.list.splice(0, 1);
			return elm;
		}
		return null;
	}

	insert(event) {
		this.list.push(event);
		this.sort();
	}

	set points(events) {
		this.list = events;
		this.sort();
	}

	sort() {
		this.list.sort(function (a, b) {
			let diff = a.position.y - b.position.y;
			if (diff == 0) return a.position.x - b.position.x;  
			return diff;
		});
	}
}