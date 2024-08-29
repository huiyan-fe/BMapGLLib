/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
let BMapGLLib = window.BMapGLLib || {};

const prefix = 'BMapGLLib';
class Swipe {
    constructor(a, b, container, options = {}) {
        this._container = container;
        this._mapA = a;
        this._mapB = b;
        // swipe中线位置
        this._centerX = 0;

        this._mapA.disableTilt();
        this._mapB.disableTilt();
        this._mapA.disableRotate();
        this._mapB.disableRotate();

        this._initDom();

        this._syncMapA = this._syncMapA.bind(this);
        this._syncMapB = this._syncMapB.bind(this);

        this._onSync();
    }

    _initDom() {
        this._swipeControlDiv = document.createElement('div');
        this._swipeControlDiv.className = `${prefix}-swipe`;
        console.log(this._container);

        this._swipeBtn = document.createElement('div');
        this._swipeBtn.className = `${prefix}-swipe-btn`;
        this._swipeControlDiv.appendChild(this._swipeBtn);

        this._onSwipeStart = this._onSwipeStart.bind(this);
        this._onSwipeMove = this._onSwipeMove.bind(this);
        this._onSwipeEnd = this._onSwipeEnd.bind(this);
        this._swipeBtn.addEventListener('mousedown', this._onSwipeStart);

        this._container.appendChild(this._swipeControlDiv);

        this._centerX = parseInt(getComputedStyle(this._swipeControlDiv).left);
        this._containerWidth = parseInt(getComputedStyle(this._container).width);
        const halfWidth = this._containerWidth / 2;
        this._updateSwipe(halfWidth);
    }

    _onSwipeStart() {
        document.addEventListener('mousemove', this._onSwipeMove);
        document.addEventListener('mouseup', this._onSwipeEnd);
    }

    _onSwipeMove(e) {
        let x = e.clientX - this._centerX;
        this._swipeControlDiv.style.transform = `translateX(${x}px)`;

        this._updateSwipe(e.clientX);
    }

    _onSwipeEnd() {
        document.removeEventListener('mousemove', this._onSwipeMove);
        document.removeEventListener('mouseup', this._onSwipeEnd);
    }

    _updateSwipe(x) {
        const clipA = `polygon(0 0, ${x}px 0, ${x}px 100%, 0 100%)`;
        const clipB = `polygon(${x}px 0, 100% 0, 100% 100%, ${x}px 100%)`;
        
        this._mapA.getContainer().style.clipPath = clipA;
        this._mapB.getContainer().style.clipPath = clipB;
    }

    _onSync() {
        this._mapA.addEventListener('moving', this._syncMapA);
        this._mapA.addEventListener('zooming', this._syncMapA);
        this._mapB.addEventListener('moving', this._syncMapB);
        this._mapB.addEventListener('zooming', this._syncMapB);
    }

    _offSync() {
        this._mapA.removeEventListener('moving', this._syncMapA);
        this._mapA.removeEventListener('zooming', this._syncMapA);
        this._mapB.removeEventListener('moving', this._syncMapB);
        this._mapB.removeEventListener('zooming', this._syncMapB);
    }

    _syncMapA() {
        this._offSync();
        const zoom = this._mapA.getZoom();
        const center = this._mapA.getCenter();

        const that = this;
        this._mapB.centerAndZoom(center, zoom, {
            noAnimation: true,
            callback() {
                that._onSync();
            },
        });
    }

    _syncMapB() {
        this._offSync();
        const zoom = this._mapB.getZoom();
        const center = this._mapB.getCenter();

        const that = this;
        this._mapA.centerAndZoom(center, zoom, {
            noAnimation: true,
            callback() {
                that._onSync();
            },
        });
    }

}

BMapGLLib.Swipe = Swipe;
