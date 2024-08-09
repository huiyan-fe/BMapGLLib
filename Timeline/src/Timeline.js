/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
let BMapGLLib = window.BMapGLLib || {};

const prefix = 'BMapGLLib';
class Timeline {
    /**
     * @param {TimelineOptions} options 
     */
    constructor(options) {
        /**
         * @type {TimelineOptions}
         */
        this.options = options;
        this.listeners = {};
        this._interval = options.interval || 1000;
        this._playTimeId = null;
        this._playStatus = 'pause';
        this._startX; // 初始进度按钮距离视口左边距离
        this._progressMax = 0; // 进度条总长度
        this._playIndex = 0;
        this._progress = 0;
        /**
         * @type {Step[]}
         */
        this._steps = [];
        this._times = options.times || [];
        this._ctx = document.createElement('canvas').getContext('2d');
        this._startScrollIndex = -1;
        this._scrollIndex = 1;
        this._container = null; 

        this._playButton = options.playButton ? options.playButton : document.createTextNode('播放');
        this._pauseButton = options.pauseButton ? options.pauseButton : document.createTextNode('暂停');

        this._initDom(options);

        this._drawTime();
    }

    /**
     * @param {TimelineOptions} options 
     */
    _initDom() {
        this.element = document.createElement('div');
        this.element.className = `${prefix}-timeline`;
        if (this.options.className) {
            this.element.className += ` ${this.options.className}`;
        }

        this._startButton = document.createElement('div');
        this._startButton.className = `${prefix}-timeline-play`;
        this._startButton.innerHTML = '';
        this._startButton.appendChild(this._playButton);
        this.element.appendChild(this._startButton);

        this._scrollDiv = document.createElement('div');
        this._scrollDiv.className = `${prefix}-timeline-main`;
        this.element.appendChild(this._scrollDiv);

        this._ul = document.createElement('ul');
        this._scrollDiv.appendChild(this._ul);

        this._progressDiv = document.createElement('div');
        this._progressDiv.className = `${prefix}-timeline-progress`;
        if (this.options.progressButtonStyle) {
            this._applyStyle(this._progressDiv, this.options.progressButtonStyle);
        }
        this._scrollDiv.appendChild(this._progressDiv);

        this._onPlayChange = this._onPlayChange.bind(this);
        this._onProgressDragStart = this._onProgressDragStart.bind(this);
        this._onProgressDrag = this._onProgressDrag.bind(this);
        this._onProgressDragEnd = this._onProgressDragEnd.bind(this);
        this._startButton.addEventListener('click', this._onPlayChange);
        this._progressDiv.addEventListener('mousedown', this._onProgressDragStart);

        if (this.options.customContainer) {
            this._container = this.options.customContainer;
            this.options.customContainer.appendChild(this.element);
        }
        else if (this.options.map) {
            this._container = this.options.map.getContainer();
            this.options.map.getContainer().appendChild(this.element);
        }
        else {
            throw new Error('options.map or options.customContainer is required');
        }
        this._startX = this._scrollDiv.getBoundingClientRect().left;
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    un(eventName, callback) {
        if (this.listeners[eventName]) {
            let index = this.listeners[eventName].indexOf(callback);
            if (index > -1) {
                this.listeners[eventName].splice(index, 1);
            }
        }
    }

    dispatchEvent(event) {
        if (this.listeners[event.type]) {
            for (let i = 0; i < this.listeners[event.type].length; i++) {
                this.listeners[event.type][i](event);
            }
        }
    }

    pause() {
        if (this._playStatus === 'pause') {
            return;
        }
        this._onPlayChange();
    }

    play() {
        if (this._playStatus === 'play') {
            return;
        }
        this._onPlayChange();
    }

    /**
     * @private
     */
    _drawTime() {
        let start = 0;
        let px = 0;
        for (let i = 0; i < this._times.length; i++) {
            const time = this._times[i];
            const li = document.createElement('li');
            const timeItem = document.createElement('div');
            const span = document.createElement('span');
            span.innerText = time;
            if (this.options.timeStyle) {
                this._applyStyle(span, this.options.timeStyle);
            }
            li.appendChild(timeItem);
            li.appendChild(span);
            

            timeItem.className = `${prefix}-time-item`;
            if (i === 0) {
                timeItem.className = `${prefix}-time-item ${prefix}-time-start`;
            }
            if (i === this._times.length - 1) {
                timeItem.className = `${prefix}-time-item ${prefix}-time-end`;
            }
            if (this.options.scrollStyle) {
                this._applyStyle(timeItem, this.options.scrollStyle);
            }

            const divider = document.createElement('div');
            divider.className = `${prefix}-time-divider`;
            if (this.options.dividerStyle) {
                this._applyStyle(divider, this.options.dividerStyle);
            }
            li.appendChild(divider);

            this._ul.appendChild(li);
            this._ctx.font = getComputedStyle(span).font;
            const textWidth = this._ctx.measureText(time).width;

            const stepWidth = textWidth + 16;
            timeItem.style.width = stepWidth + 'px';

            let halfWidth = stepWidth / 2;
            px += stepWidth;
            const timeInfo = {
                time,
                start,
                end: px - halfWidth,
                index: i,
            };
            start = px - halfWidth + 1;
            this._steps.push(timeInfo);
            
        }
        this._progressMax = px;
        this._calcStartScrollIndex();
    }

    /**
     * @private
     */
    _calcStartScrollIndex() {
        const scrollWidth = this._scrollDiv.clientWidth;
        let startScrollIndex = 0;
        for (let i = 0; i < this._steps.length - 1; i++) {
            if (this._steps[i].end > scrollWidth) {
                startScrollIndex = i;
                break;
            }
        }
        this._startScrollIndex = startScrollIndex;
        // console.log(startScrollIndex, this._steps);
    }

    /**
     * @private
     * @param {MouseEvent} e 
     * @returns 
     */
    _onProgressDrag(e) {
        const x = e.clientX - this._startX + this._scrollDiv.scrollLeft;

        if (x >= 0 && x <= this._progressMax) {
            this._updateProgress(x);
        }
    }

    // 进度拖拽结束
    _onProgressDragEnd(e) {
        const x = e.clientX - this._startX;
        const step = this._getStepByProgress(x);
        if (step) {
            this.dispatchEvent({
                type: 'change',
                time: step.time,
            });
            this._playIndex = step.index;
        } else {
            this._playIndex = this._steps.length;
        }
        document.removeEventListener('mousemove', this._onProgressDrag);
        document.removeEventListener('mouseup', this._onProgressDragEnd);
    }

    // 点击进度按钮
    _onProgressDragStart(e) {
        clearTimeout(this._playTimeId);
        this._playStatus = 'pause';
        this._startButton.innerHTML = '';
        this._startButton.appendChild(this._playButton);
        document.addEventListener('mousemove', this._onProgressDrag);
        document.addEventListener('mouseup', this._onProgressDragEnd);
    }

    // 点击播放按钮
    _onPlayChange() {
        if (this._playTimeId) {
            clearTimeout(this._playTimeId);
        }

        // 播放到结尾了，重置
        if (this._playIndex >= this._steps.length) {
            this._playIndex = 0;
            this._scrollIndex = 1;
            this._scrollDiv.scrollLeft = 0;
            this._progressDiv.style.left = 0;
        } else {
            let dragStep = this._getStepByProgress(this._progress);
            if (dragStep) {
                this._playIndex = dragStep.index;
            }
            else {
                this._playIndex = this._steps.length;
            }
        }
        if (this._playStatus === 'pause') {
            this.dispatchEvent({
                type: 'playstart'
            });

            const loop = () => {
                this._playTimeId = setTimeout(loop, this._interval);
                let step = this._steps[this._playIndex++];

                step && this._updateProgressByStep(step);
                if (this._playIndex >= this._steps.length) {
                    clearTimeout(this._playTimeId);
                    this._playStatus = 'pause';
                    this._startButton.innerHTML = '';
                    this._startButton.appendChild(this._playButton);
                    this.dispatchEvent({
                        type: 'playend'
                    });
                }
            }

            this._playTimeId = setTimeout(loop, this._interval);
            this._playStatus = 'play';
            this._startButton.innerHTML = '';
            this._startButton.appendChild(this._pauseButton);
        } else {
            this._playStatus = 'pause';
            this._startButton.innerHTML = '';
            this._startButton.appendChild(this._playButton);
            this.dispatchEvent({
                type: 'playend'
            });
            clearTimeout(this._playTimeId);
        }
    }

    /**
     * @param {Step} step 
     */
    _updateProgressByStep(step) {
        this.dispatchEvent({
            type: 'change',
            time: step.time,
        });

        this._progress = step.end;
        this._progressDiv.style.left = this._progress - 5 + 'px';

        // console.log(this._scrollIndex);
        // 判断是否滚动
        if (this._startScrollIndex > 0 && step.end >= this._steps[this._startScrollIndex].end) {
            this._scrollDiv.scrollLeft = this._steps[this._scrollIndex++].end;
        }
    }

    _getStepByProgress(progress) {
        for (let i = 0; i < this._steps.length; i++) {
            const step = this._steps[i];
            if (step.start <= progress && step.end >= progress) {
                return step;
            }
        }
    }

    _updateProgress(progress) {
        this._progress = progress;
        this._progressDiv.style.left = progress + 'px';
    }

    _applyStyle(element, style) {
        for (let key in style) {
            element.style[key] = style[key];
        }
    }

    destroy() {
        this._startButton.removeEventListener('click', this._onPlayChange);
        this._progressDiv.removeEventListener('mousedown', this._onProgressDragStart);
        this._container.removeChild(this.element);
    }

}

BMapGLLib.Timeline = Timeline;

/**
 * @typedef {Object} TimelineOptions
 * @property {string[]} times - 时间数组
 * @property {BMapGL} map - 地图实例
 * @property {HTMLElement} [customContainer] - 自定义容器
 * @property {number} [interval=1000] - 播放间隔，单位毫秒
 * @property {HTMLElement} [playButton] - 播放按钮
 * @property {HTMLElement} [pauseButton] - 暂停按钮
 * @property {string} [className] - 类名
 * @property {Object} [progressButtonStyle] - 进度按钮样式
 * @property {Object} [scrollStyle] - 滚动条样式
 * @property {Object} [timeStyle] - 时间样式
 * @property {Object} [dividerStyle] - 分割线样式
 */

/**
 * @typedef {Object} Step
 * @property {number} start - 开始px
 * @property {number} end - 结束px
 * @property {number} time - 时间
 * @property {number} index - 索引
 */