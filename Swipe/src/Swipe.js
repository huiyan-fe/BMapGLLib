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
        this._initDom();
    }

    _initDom() {
        this._swipeControlDiv = document.createElement('div');
        this._swipeControlDiv.className = `${prefix}-swipe`;

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

}

BMapGLLib.Swipe = Swipe;
