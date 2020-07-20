let voronoi =  new Voronoi();
let sites = generateBeeHivePoints(view.size / 200, true);
let bbox, diagram;
let oldSize = view.size;
let spotColor = new Color('rgba(240, 84, 76, 1)');
let mousePos = view.center;
let selected = false;

onResize();

function onMouseDown(event) {
    sites.push(event.point);
    renderDiagram();
}

function onMouseMove(event) {
    mousePos = event.point;
    if (event.count == 0)
        sites.push(event.point);
    sites[sites.length - 1] = event.point;
    renderDiagram();
}

function renderDiagram() {
    project.activeLayer.children = [];
    let diagram = voronoi.compute(sites, bbox);
    if (diagram) {
        for (let i = 0, l = sites.length; i < l; i++) {
            let cell = diagram.cells[sites[i].voronoiId];
            if (cell) {
                let halfedges = cell.halfedges,
                    length = halfedges.length;
                if (length > 2) {
                    let points = [];
                    for (let j = 0; j < length; j++) {
                        v = halfedges[j].getEndpoint();
                        points.push(new Point(v));
                    }
                    createPath(points, sites[i]);
                }
            }
        }
    }
}

function removeSmallBits(path) {
    let averageLength = path.length / path.segments.length;
    let min = path.length / 50;
    for(let i = path.segments.length - 1; i >= 0; i--) {
        let segment = path.segments[i];
        let cur = segment.point;
        let nextSegment = segment.next;
        let next = nextSegment.point + nextSegment.handleIn;
        if (cur.getDistance(next) < min) {
            segment.remove();
        }
    }
}

function generateBeeHivePoints(size, loose) {
    let points = [];
    let col = view.size / size;
    for(let i = -1; i < size.width + 1; i++) {
        for(let j = -1; j < size.height + 1; j++) {
            let point = new Point(i, j) / new Point(size) * view.size + col / 2;
            if(j % 2)
                point += new Point(col.width / 2, 0);
            if(loose)
                point += (col / 4) * Point.random() - col / 4;
            points.push(point);
        }
    }
    return points;
}
function createPath(points, center) {
    let path = new Path();
    if (!selected) { 
        path.fillColor = spotColor;
    } else {
        path.fullySelected = selected;
    }
    path.closed = true;

    for (let i = 0, l = points.length; i < l; i++) {
        let point = points[i];
        let next = points[(i + 1) == points.length ? 0 : i + 1];
        let vector = (next - point) / 2;
        path.add({
            point: point + vector,
            handleIn: -vector,
            handleOut: vector
        });
    }
    path.scale(0.95);
    removeSmallBits(path);
    return path;
}

function onResize() {
    let margin = 20;
    bbox = {
        xl: margin,
        xr: view.bounds.width - margin,
        yt: margin,
        yb: view.bounds.height - margin
    };
    for (let i = 0, l = sites.length; i < l; i++) {
        sites[i] = sites[i] * view.size / oldSize;
    }
    oldSize = view.size;
    renderDiagram();
}

function onKeyDown(event) {
    if (event.key == 'space') {
        selected = !selected;
        renderDiagram();
    }
}