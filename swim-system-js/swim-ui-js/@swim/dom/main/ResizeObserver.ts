// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @hidden */
export interface DOMRectReadOnly {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

export interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}

export type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

interface ResizeObservation {
  readonly target: Element;
  readonly broadcastWidth: number;
  readonly broadcastHeight: number;
  isActive(): boolean;
}

class ResizeObserverPolyfill implements ResizeObserver {
  protected readonly callback: ResizeObserverCallback;
  protected readonly observationTargets: ResizeObservationPolyfill[];
  protected readonly activeTargets: ResizeObservationPolyfill[];
  protected readonly skippedTargets: ResizeObservationPolyfill[];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.observationTargets = [];
    this.activeTargets = [];
    this.skippedTargets = [];

    DETECTOR.addObserver(this);
  }

  observe(target: Element): void {
    for (let i = 0; i < this.observationTargets.length; i += 1) {
      if (target === this.observationTargets[i].target) {
        return;
      }
    }
    const observation = new ResizeObservationPolyfill(target);
    this.observationTargets.push(observation);
    DETECTOR.redetect();
  }

  unobserve(target: Element): void {
    for (let i = 0; i < this.observationTargets.length; i += 1) {
      if (target === this.observationTargets[i].target) {
        this.observationTargets.splice(i, 1);
      }
    }

    if (!this.observationTargets.length) {
      DETECTOR.removeObserver(this);
    }
  }

  gatherActive(depth: number): void {
    this.clearActive();
    this.clearSkipped();
    for (let i = 0; i < this.observationTargets.length; i += 1) {
      const observation = this.observationTargets[i];
      if (observation.isActive()) {
        const targetDepth = calculateDepth(observation.target);
        if (targetDepth > depth) {
          this.activeTargets.push(observation);
        } else {
          this.skippedTargets.push(observation);
        }
      }
    }
  }

  broadcastActive(shallowestTargetDepth: number): number {
    if (this.hasActive()) {
      const entries = [];
      for (let i = 0; i < this.activeTargets.length; i += 1) {
        const observation = this.observationTargets[i];
        const entry = new ResizeObserverEntryPolyfill(observation.target);
        entries.push(entry);

        observation.broadcastWidth = entry.contentRect.width;
        observation.broadcastHeight = entry.contentRect.height;

        const targetDepth = calculateDepth(observation.target);
        if (targetDepth < shallowestTargetDepth) {
          shallowestTargetDepth = targetDepth;
        }
      }

      this.callback(entries, this);
      this.clearActive();
    }

    return shallowestTargetDepth;
  }

  hasActive(): boolean {
    return this.activeTargets.length > 0;
  }

  hasSkipped(): boolean {
    return this.skippedTargets.length > 0;
  }

  clearActive(): void {
    this.activeTargets.length = 0;
  }

  clearSkipped(): void {
    this.skippedTargets.length = 0;
  }

  disconnect(): void {
    this.clearActive();
    this.observationTargets.length = 0;
    DETECTOR.removeObserver(this);
  }
}

// tslint:disable-next-line: variable-name
export const ResizeObserver: {new(callback: ResizeObserverCallback): ResizeObserver} =
  (typeof window !== "undefined" && typeof (window as any).ResizeObserver !== "undefined")
  ? (window as any).ResizeObserver
  : ResizeObserverPolyfill;

class ResizeObserverEntryPolyfill implements ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;

  constructor(target: Element, contentRect?: DOMRectReadOnly) {
    this.target = target;
    this.contentRect = contentRect || getContentRect(target);
  }
}

class ResizeObservationPolyfill implements ResizeObservation {
  readonly target: Element;
  broadcastWidth: number;
  broadcastHeight: number;

  constructor(target: Element) {
    this.target = target;
    this.broadcastWidth = 0;
    this.broadcastHeight = 0;
  }

  isActive(): boolean {
    const contentRect = getContentRect(this.target);
    return !!contentRect && (
           Math.round(contentRect.width) !== Math.round(this.broadcastWidth) ||
           Math.round(contentRect.height) !== Math.round(this.broadcastHeight));
  }
}

class ResizeDetector {
  private resizeObservers: ResizeObserverPolyfill[];
  private mutationObserver: MutationObserver | undefined;
  private detectAnimationFrame: number;
  private connected: boolean;

  constructor() {
    this.resizeObservers = [];
    this.mutationObserver = void 0;
    this.detectAnimationFrame = 0;
    this.connected = false;

    this.onResize = this.onResize.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.onMutation = this.onMutation.bind(this);
    this.onSubtreeModified = void 0;
    this.onDetectAnimationFrame = this.onDetectAnimationFrame.bind(this);
  }

  addObserver(observer: ResizeObserverPolyfill): void {
    if (this.resizeObservers.indexOf(observer) < 0) {
      this.resizeObservers.push(observer);
    }
    this.connect();
  }

  removeObserver(observer: ResizeObserverPolyfill): void {
    const index = this.resizeObservers.indexOf(observer);
    if (index >= 0) {
      this.resizeObservers.splice(index, 1);
    }
    if (!this.resizeObservers.length) {
      this.disconnect();
    }
  }

  gatherActive(depth: number): void {
    for (let i = 0; i < this.resizeObservers.length; i += 1) {
      this.resizeObservers[i].gatherActive(depth);
    }
  }

  hasActive(): boolean {
    for (let i = 0; i < this.resizeObservers.length; i += 1) {
      if (this.resizeObservers[i].hasActive()) {
        return true;
      }
    }
    return false;
  }

  hasSkipped(): boolean {
    for (let i = 0; i < this.resizeObservers.length; i += 1) {
      if (this.resizeObservers[i].hasSkipped()) {
        return true;
      }
    }
    return false;
  }

  broadcastActive(): number {
    let shallowestTargetDepth = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.resizeObservers.length; i += 1) {
      shallowestTargetDepth = this.resizeObservers[i].broadcastActive(shallowestTargetDepth);
    }
    return shallowestTargetDepth;
  }

  detect(): void {
    let depth = 0;
    this.gatherActive(depth);
    do {
      depth = this.broadcastActive();
      // recalc styles and update layout
      this.gatherActive(depth);
    } while (this.hasActive());
    if (this.hasSkipped()) {
      window.dispatchEvent(new ErrorEvent("ResizeObserver loop completed with undelivered notifications."));
    }
  }

  redetect(): void {
    if (!this.detectAnimationFrame) {
      this.detectAnimationFrame = requestAnimationFrame(this.onDetectAnimationFrame);
    }
  }

  private onDetectAnimationFrame(timestamp: number): void {
    this.detectAnimationFrame = 0;
    this.detect();
  }

  private onResize(event: Event): void {
    this.redetect();
  }

  private onSubtreeModified?(event: Event): void;

  private onTransitionEnd(event: TransitionEvent): void {
    let reflow = false;
    for (let i = 0; i < REFLOW_KEYS.length; i += 1) {
      if (event.propertyName.indexOf(REFLOW_KEYS[i]) >= 0) {
        reflow = true;
        break;
      }
    }
    if (reflow) {
      this.redetect();
    }
  }

  private onMutation(mutations: MutationRecord[]): void {
    for (let i = 0; i < mutations.length; i += 1) {
      const mutation = mutations[i];
      if (mutation.type === "childList") {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let j = 0; j < mutation.addedNodes.length; j += 1) {
            this.addShadows(mutation.addedNodes[j]);
          }
        }
      }
    }
    this.redetect();
  }

  addShadows(node: Node): void {
    if (node instanceof Element) {
      for (let i = 0; i < node.childNodes.length; i += 1) {
        this.addShadows(node.childNodes[i]);
      }
      if (node.shadowRoot) {
        this.observe(node.shadowRoot);
        this.addShadows(node.shadowRoot);
      }
    }
  }

  observe(target: Node): void {
    this.mutationObserver!.observe(target, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  connect(): void {
    if (this.connected) {
      return;
    }

    window.addEventListener("resize", this.onResize);
    document.addEventListener("transitionend", this.onTransitionEnd);

    const isIE11 = typeof navigator !== "undefined" && (/Trident\/.*rv:11/).test(navigator.userAgent);
    if (typeof MutationObserver !== "undefined" && !isIE11) {
      this.mutationObserver = new MutationObserver(this.onMutation);
      this.observe(document);
      this.addShadows(document);
    } else {
      this.onSubtreeModified = this.onResize;
      document.addEventListener("DOMSubtreeModified", this.onSubtreeModified);
    }

    this.connected = true;
  }

  disconnect(): void {
    if (!this.connected) {
      return;
    }

    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("transitionend", this.onTransitionEnd);

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = void 0;
    }

    if (this.onSubtreeModified) {
      document.removeEventListener("DOMSubtreeModified", this.onSubtreeModified);
      this.onSubtreeModified = void 0;
    }

    if (this.detectAnimationFrame) {
      cancelAnimationFrame(this.detectAnimationFrame);
      this.detectAnimationFrame = 0;
    }

    this.connected = false;
  }
}

const REFLOW_KEYS = ["top", "right", "bottom", "left", "width", "height", "size", "weight"];

const DETECTOR = new ResizeDetector();

function calculateDepth(node: Node): number {
  let k = 0;
  while (node.parentNode) {
    node = node.parentNode;
    k += 1;
  }
  return k;
}

function isSVGGraphicsElement(target: Element): boolean {
  return typeof SVGGraphicsElement !== "undefined" ?
         target instanceof SVGGraphicsElement :
         target instanceof SVGElement && typeof (target as any).getBBox === "function";
}

function getContentRect(target: Element): DOMRectReadOnly {
  if (target instanceof HTMLElement) {
    return getHTMLContentRect(target);
  } else if (isSVGGraphicsElement(target)) {
    return getSVGContentRect(target as SVGGraphicsElement);
  } else {
    return createContentRect(0, 0, 0, 0);
  }
}

function getHTMLContentRect(target: HTMLElement): DOMRectReadOnly {
  if (!target.clientWidth && !target.clientHeight) {
    return createContentRect(0, 0, 0, 0);
  }

  const style = getComputedStyle(target);
  const paddingLeft = toFloat(style.getPropertyValue("padding-left"));
  const paddingTop = toFloat(style.getPropertyValue("padding-top"));
  const xPadding = paddingLeft + toFloat(style.getPropertyValue("padding-right"));
  const yPadding = paddingTop + toFloat(style.getPropertyValue("padding-bottom"));

  let width = toFloat(style.getPropertyValue("width"));
  let height = toFloat(style.getPropertyValue("height"));

  if (style.getPropertyValue("box-sizing") === "border-box") {
    if (Math.round(width + xPadding) !== target.clientWidth) {
      width -= xPadding + toFloat(style.getPropertyValue("border-left-width")) +
                          toFloat(style.getPropertyValue("border-right-width"));
    }
    if (Math.round(height + yPadding) !== target.clientHeight) {
      height -= yPadding + toFloat(style.getPropertyValue("border-top-width")) +
                           toFloat(style.getPropertyValue("border-bottom-width"));
    }
  }

  if (target !== document.documentElement) {
    const yScrollbar = Math.round(width + xPadding) - target.clientWidth;
    const xScrollbar = Math.round(height + yPadding) - target.clientHeight;

    if (Math.abs(yScrollbar) !== 1) {
      width -= yScrollbar;
    }
    if (Math.abs(xScrollbar) !== 1) {
      height -= xScrollbar;
    }
  }

  return createContentRect(paddingLeft, paddingTop, width, height);
}

function getSVGContentRect(target: SVGGraphicsElement): DOMRectReadOnly {
  const bbox = target.getBBox();
  return createContentRect(0, 0, bbox.width, bbox.height);
}

function toFloat(value: string): number {
  return parseFloat(value) || 0;
}

function createContentRect(x: number, y: number, width: number, height: number): DOMRectReadOnly {
  return {
    x: x,
    y: y,
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
  };
}
