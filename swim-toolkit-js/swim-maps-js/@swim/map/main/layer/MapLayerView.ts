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

import {BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {Transform} from "@swim/transform";
import {Animator} from "@swim/animate";
import {Renderer, CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewScope,
  ViewEvent,
  ViewMouseEvent,
  ViewEventHandler,
  ViewControllerType,
  ViewFlags,
  View,
  ViewObserver,
  LayoutAnchor,
  LayoutView,
  MemberAnimator,
  AnimatedViewClass,
  AnimatedView,
  RenderedViewConstructor,
  RenderedView,
  CanvasView,
} from "@swim/view";
import {GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {GeoProjection} from "../geo/GeoProjection";
import {MapViewContext} from "../MapViewContext";
import {MapView} from "../MapView";
import {MapTile} from "./MapTile";
import {MapLayerViewObserver} from "./MapLayerViewObserver";
import {MapLayerViewController} from "./MapLayerViewController";

export class MapLayerView extends View implements MapView {
  /** @hidden */
  _key?: string;
  /** @hidden */
  _parentView: View | null;
  /** @hidden */
  _childViews: MapTile;
  /** @hidden */
  _childViewMap?: {[key: string]: MapView | undefined};
  /** @hidden */
  _viewController: ViewControllerType<this> | null;
  /** @hidden */
  _viewObservers?: ViewObserver[];
  /** @hidden */
  _viewFlags: ViewFlags;
  /** @hidden */
  _viewScopes?: {[scopeName: string]: ViewScope<View, unknown> | undefined};
  /** @hidden */
  _layoutAnchors?: {[anchorName: string]: LayoutAnchor<LayoutView> | undefined};
  /** @hidden */
  _memberAnimators?: {[animatorName: string]: Animator | undefined};
  /** @hidden */
  _viewFrame?: BoxR2;
  /** @hidden */
  _eventHandlers?: {[type: string]: ViewEventHandler[] | undefined};

  constructor(geoBounds?: GeoBox, depth?: number, maxDepth?: number) {
    super();
    this._parentView = null;
    this._childViews = MapTile.empty(geoBounds, depth, maxDepth);
    this._viewController = null;
    this._viewFlags = 0;
  }

  get viewController(): MapLayerViewController | null {
    return this._viewController;
  }

  setViewController(newViewController: ViewControllerType<this> | null): void {
    const oldViewController = this._viewController;
    if (oldViewController !== newViewController) {
      this.willSetViewController(newViewController);
      if (oldViewController !== null) {
        oldViewController.setView(null);
      }
      this._viewController = newViewController;
      if (newViewController !== null) {
        newViewController.setView(this);
      }
      this.onSetViewController(newViewController);
      this.didSetViewController(newViewController);
    }
  }

  get viewObservers(): ReadonlyArray<ViewObserver> {
    let viewObservers = this._viewObservers;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
    }
    return viewObservers;
  }

  addViewObserver(viewObserver: ViewObserver): void {
    let viewObservers = this._viewObservers;
    let index: number;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
      index = -1;
    } else {
      index = viewObservers.indexOf(viewObserver);
    }
    if (index < 0) {
      this.willAddViewObserver(viewObserver);
      viewObservers.push(viewObserver);
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  removeViewObserver(viewObserver: ViewObserver): void {
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      const index = viewObservers.indexOf(viewObserver);
      if (index >= 0) {
        this.willRemoveViewObserver(viewObserver);
        viewObservers.splice(index, 1);
        this.onRemoveViewObserver(viewObserver);
        this.didRemoveViewObserver(viewObserver);
      }
    }
  }

  get geoProjection(): GeoProjection | null {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.geoProjection : null;
  }

  get mapZoom(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapZoom : 0;
  }

  get mapHeading(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapHeading : 0;
  }

  get mapTilt(): number {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.mapTilt : 0;
  }

  get canvasView(): CanvasView | null {
    const parentView = this._parentView;
    return RenderedView.is(parentView) ? parentView.canvasView : null;
  }

  @MemberAnimator(Color)
  tileOutlineColor: MemberAnimator<this, Color, AnyColor>;

  get key(): string | null {
    const key = this._key;
    return key !== void 0 ? key : null;
  }

  /** @hidden */
  setKey(key: string | null): void {
    if (key !== null) {
      this._key = key;
    } else if (this._key !== void 0) {
      this._key = void 0;
    }
  }

  get parentView(): View | null {
    return this._parentView;
  }

  /** @hidden */
  setParentView(newParentView: View | null, oldParentView: View | null) {
    this.willSetParentView(newParentView, oldParentView);
    this._parentView = newParentView;
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
  }

  get childViews(): ReadonlyArray<View> {
    const childViews: View[] = [];
    this._childViews.forEach(function (childView: MapView): void {
      childViews.push(childView);
    }, this);
    return childViews;
  }

  getChildView(key: string): View | null {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!MapView.is(newChildView)) {
        throw new TypeError("" + newChildView);
      }
      newChildView.remove();
    }
    let oldChildView: MapView | null = null;
    if (this._childViewMap !== void 0) {
      const childView = this._childViewMap[key];
      if (childView !== void 0) {
        oldChildView = childView;
        const oldChildViewBounds = oldChildView.geoBounds;
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        this._childViews = this._childViews.removed(oldChildView, oldChildViewBounds);
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
      }
    }
    if (newChildView !== null) {
      const newChildViewBounds = newChildView.geoBounds;
      newChildView.setKey(key);
      this._childViews = this._childViews.inserted(newChildView, newChildViewBounds);
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildView(newChildView, null);
      this.didInsertChildView(newChildView, null);
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: MapView): void {
    const key = childView.key;
    if (key !== null) {
      let childViewMap = this._childViewMap;
      if (childViewMap === void 0) {
        childViewMap = {};
        this._childViewMap = childViewMap;
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: MapView): void {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const key = childView.key;
      if (key !== null) {
        delete childViewMap[key];
      }
    }
  }

  append<V extends RenderedView>(childView: V, key?: string): V;
  append<C extends RenderedViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  append(child: RenderedView | RenderedViewConstructor, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  appendChildView(childView: View, key?: string): void {
    if (!MapView.is(childView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    this._childViews = this._childViews.inserted(childView, childViewBounds);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  prepend<V extends RenderedView>(childView: V, key?: string): V;
  prepend<C extends RenderedViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  prepend(child: RenderedView | RenderedViewConstructor, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  prependChildView(childView: View, key?: string): void {
    if (!MapView.is(childView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, null);
    this._childViews = this._childViews.inserted(childView, childViewBounds);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  insert<V extends RenderedView>(childView: V, target: View | null, key?: string): V;
  insert<C extends RenderedViewConstructor>(viewConstructor: C, target: View | null, key?: string): InstanceType<C>;
  insert(child: RenderedView | RenderedViewConstructor, target: View | null, key?: string): RenderedView {
    if (typeof child === "function") {
      child = RenderedView.create(child);
    }
    this.insertChildView(child, target, key);
    return child;
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!MapView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (targetView !== null && !RenderedView.is(childView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childViewBounds = childView.geoBounds;
    this.willInsertChildView(childView, targetView);
    this._childViews = this._childViews.inserted(childView, childViewBounds);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (!MapView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    const childViewBounds = childView.geoBounds;
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    this._childViews = this._childViews.removed(childView, childViewBounds);
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(null);
    if (typeof key === "string") {
      return childView;
    }
  }

  removeAll(): void {
    this._childViews.forEach(function (childView: MapView): void {
      this.removeChildView(childView);
    }, this);
  }

  remove(): void {
    const parentView = this._parentView;
    if (parentView !== null) {
      if ((this._viewFlags & View.UpdatingMask) === 0) {
        parentView.removeChildView(this);
      } else {
        this._viewFlags |= View.RemovingFlag;
      }
    }
  }

  /** @hidden */
  get viewFlags(): ViewFlags {
    return this._viewFlags;
  }

  /** @hidden */
  setViewFlags(viewFlags: ViewFlags): void {
    this._viewFlags = viewFlags;
  }

  cascadeMount(): void {
    if ((this._viewFlags & View.MountedFlag) === 0) {
      this._viewFlags |= View.MountedFlag;
      this.willMount();
      this.onMount();
      this.doMountChildViews();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  /** @hidden */
  doMountChildViews(): void {
    this._childViews.forEach(function (childView: MapView): void {
      childView.cascadeMount();
    }, this);
  }

  cascadeUnmount(): void {
    if ((this._viewFlags & View.MountedFlag) !== 0) {
      this._viewFlags &= ~View.MountedFlag
      this.willUnmount();
      this.doUnmountChildViews();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  /** @hidden */
  doUnmountChildViews(): void {
    this._childViews.forEach(function (childView: MapView): void {
      childView.cascadeUnmount();
    }, this);
  }

  protected onMount(): void {
    super.onMount();
    this.requireUpdate(View.NeedsProject);
  }

  protected onUnmount(): void {
    this.cancelAnimators();
    this._viewFlags = 0;
  }

  cascadePower(): void {
    if ((this._viewFlags & View.PoweredFlag) === 0) {
      this._viewFlags |= View.PoweredFlag;
      this.willPower();
      this.onPower();
      this.doPowerChildViews();
      this.didPower();
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  doPowerChildViews(): void {
    this._childViews.forEach(function (childView: MapView): void {
      childView.cascadePower();
    }, this);
  }

  cascadeUnpower(): void {
    if ((this._viewFlags & View.PoweredFlag) !== 0) {
      this._viewFlags &= ~View.PoweredFlag
      this.willUnpower();
      this.doUnpowerChildViews();
      this.onUnpower();
      this.didUnpower();
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    this._childViews.forEach(function (childView: MapView): void {
      childView.cascadeUnpower();
    }, this);
  }

  get renderer(): Renderer | null {
    const parentView = this._parentView;
    return RenderedView.is(parentView) ? parentView.renderer : null;
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsProject) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: MapViewContext): ViewFlags {
    if ((this._viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: MapViewContext): void {
    processFlags = this._viewFlags | processFlags;
    processFlags = this.needsProcess(processFlags, viewContext);
    this.doProcess(processFlags, viewContext);
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: MapViewContext): void {
    let cascadeFlags = processFlags;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsResize | View.NeedsProject);
    this.willProcess(viewContext);
    this._viewFlags |= View.ProcessingFlag;
    try {
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
        this.willScroll(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsDerive) !== 0) {
        cascadeFlags |= View.NeedsDerive;
        this._viewFlags &= ~View.NeedsDerive;
        this.willDerive(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
        this.willAnimate(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsProject) !== 0) {
        cascadeFlags |= View.NeedsProject;
        this._viewFlags &= ~View.NeedsProject;
        this.willProject(viewContext);
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.onDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.onProject(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsProject) !== 0) {
        this.didProject(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.didDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.ProcessingFlag;
      this.didProcess(viewContext);
    }
  }

  protected willAnimate(viewContext: MapViewContext): void {
    this.willObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewWillAnimate !== void 0) {
        viewObserver.viewWillAnimate(viewContext, this);
      }
    });
  }

  protected onAnimate(viewContext: MapViewContext): void {
    this.animateMembers(viewContext.updateTime);
  }

  protected didAnimate(viewContext: MapViewContext): void {
    this.didObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewDidAnimate !== void 0) {
        viewObserver.viewDidAnimate(viewContext, this);
      }
    });
  }

  protected willProject(viewContext: MapViewContext): void {
    this.willObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewWillProject !== void 0) {
        viewObserver.viewWillProject(viewContext, this);
      }
    });
  }

  protected onProject(viewContext: MapViewContext): void {
    // hook
  }

  protected didProject(viewContext: MapViewContext): void {
    this.didObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewDidProject !== void 0) {
        viewObserver.viewDidProject(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: MapViewContext): void {
    if ((processFlags & View.ProcessMask) !== 0 && !this._childViews.isEmpty()) {
      this.willProcessChildViews(viewContext);
      this.doProcessTile(this._childViews, processFlags, viewContext);
      this.didProcessChildViews(viewContext);
    }
  }

  /** @hidden */
  protected doProcessTile(tile: MapTile, processFlags: ViewFlags, viewContext: MapViewContext): void {
    if (tile._southWest !== null && tile._southWest._geoBounds.intersects(viewContext.geoFrame)) {
      this.doProcessTile(tile._southWest, processFlags, viewContext);
    }
    if (tile._northWest !== null && tile._northWest._geoBounds.intersects(viewContext.geoFrame)) {
      this.doProcessTile(tile._northWest, processFlags, viewContext);
    }
    if (tile._southEast !== null && tile._southEast._geoBounds.intersects(viewContext.geoFrame)) {
      this.doProcessTile(tile._southEast, processFlags, viewContext);
    }
    if (tile._northEast !== null && tile._northEast._geoBounds.intersects(viewContext.geoFrame)) {
      this.doProcessTile(tile._northEast, processFlags, viewContext);
    }
    const childViews = tile._views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      const childViewContext = this.childViewContext(childView, viewContext);
      this.doProcessChildView(childView, processFlags, childViewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: MapViewContext): void {
    displayFlags = this._viewFlags | displayFlags;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    this.doDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: MapViewContext): void {
    let cascadeFlags = displayFlags;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsComposite);
    this.willDisplay(viewContext);
    this._viewFlags |= View.DisplayingFlag;
    try {
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
        this.willLayout(viewContext);
      }
      if (((this._viewFlags | displayFlags) & View.NeedsRender) !== 0) {
        cascadeFlags |= View.NeedsRender;
        this._viewFlags &= ~View.NeedsRender;
        this.willRender(viewContext);
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.onRender(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.didRender(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.DisplayingFlag;
      this.didDisplay(viewContext);
    }
  }

  protected willRender(viewContext: MapViewContext): void {
    this.willObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: MapViewContext): void {
    const outlineColor = this.getMemberAnimator("tileOutlineColor") as MemberAnimator<this, Color, AnyColor> | null;
    if (outlineColor !== null && outlineColor.value !== void 0) {
      this.renderTiles(viewContext, outlineColor.value);
    }
  }

  protected renderTiles(viewContext: MapViewContext, outlineColor: Color): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderTile(this._childViews, context, viewContext.geoProjection, outlineColor);
      context.restore();
    }
  }

  protected renderTile(tile: MapTile, context: CanvasContext,
                       geoProjection: GeoProjection, outlineColor: Color): void {
    if (tile._southWest !== null) {
      this.renderTile(tile._southWest, context, geoProjection, outlineColor);
    }
    if (tile._northWest !== null) {
      this.renderTile(tile._northWest, context, geoProjection, outlineColor);
    }
    if (tile._southEast !== null) {
      this.renderTile(tile._southEast, context, geoProjection, outlineColor);
    }
    if (tile._northEast !== null) {
      this.renderTile(tile._northEast, context, geoProjection, outlineColor);
    }
    const minDepth = 2;
    if (tile.depth >= minDepth) {
      const southWest = geoProjection.project(tile._geoBounds.southWest);
      const northWest = geoProjection.project(tile._geoBounds.northWest);
      const northEast = geoProjection.project(tile._geoBounds.northEast);
      const southEast = geoProjection.project(tile._geoBounds.southEast);
      context.beginPath();
      context.moveTo(southWest._x, southWest._y);
      context.lineTo(northWest._x, northWest._y);
      context.lineTo(northEast._x, northEast._y);
      context.lineTo(southEast._x, southEast._y);
      context.closePath();
      const u = (tile._depth - minDepth) / (tile._maxDepth - minDepth)
      context.lineWidth = 4 * (1 - u) + 0.5 * u;
      context.strokeStyle = outlineColor.toString();
      context.stroke();
    }
  }

  protected didRender(viewContext: MapViewContext): void {
    this.didObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: MapViewContext): void {
    if ((displayFlags & View.DisplayMask) !== 0 && !this._childViews.isEmpty() && !this.isHidden() && !this.isCulled()) {
      this.willDisplayChildViews(viewContext);
      this.doDisplayTile(this._childViews, displayFlags, viewContext);
      this.didDisplayChildViews(viewContext);
    }
  }

  /** @hidden */
  protected doDisplayTile(tile: MapTile, displayFlags: ViewFlags, viewContext: MapViewContext): void {
    if (tile._southWest !== null && tile._southWest._geoBounds.intersects(viewContext.geoFrame)) {
      this.doDisplayTile(tile._southWest, displayFlags, viewContext);
    }
    if (tile._northWest !== null && tile._northWest._geoBounds.intersects(viewContext.geoFrame)) {
      this.doDisplayTile(tile._northWest, displayFlags, viewContext);
    }
    if (tile._southEast !== null && tile._southEast._geoBounds.intersects(viewContext.geoFrame)) {
      this.doDisplayTile(tile._southEast, displayFlags, viewContext);
    }
    if (tile._northEast !== null && tile._northEast._geoBounds.intersects(viewContext.geoFrame)) {
      this.doDisplayTile(tile._northEast, displayFlags, viewContext);
    }
    const childViews = tile._views;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      const childViewContext = this.childViewContext(childView, viewContext);
      this.doDisplayChildView(childView, displayFlags, childViewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }
  }

  childViewContext(childView: View, viewContext: MapViewContext): MapViewContext {
    return viewContext;
  }

  childViewDidSetGeoBounds(childView: MapView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this._childViews = this._childViews.moved(childView, newGeoBounds, oldGeoBounds);
  }

  hasViewScope(scopeName: string): boolean {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 && viewScopes[scopeName] !== void 0;
  }

  getViewScope(scopeName: string): ViewScope<View, unknown> | null {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 ? viewScopes[scopeName] || null : null;
  }

  setViewScope(scopeName: string, viewScope: ViewScope<View, unknown> | null): void {
    let viewScopes = this._viewScopes;
    if (viewScopes === void 0) {
      viewScopes = {};
      this._viewScopes = viewScopes;
    }
    if (viewScope !== null) {
      viewScopes[scopeName] = viewScope;
    } else {
      delete viewScopes[scopeName];
    }
  }

  hasLayoutAnchor(anchorName: string): boolean {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 && layoutAnchors[anchorName] !== void 0;
  }

  getLayoutAnchor(anchorName: string): LayoutAnchor<LayoutView> | null {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 ? layoutAnchors[anchorName] || null : null;
  }

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<LayoutView> | null): void {
    let layoutAnchors = this._layoutAnchors;
    if (layoutAnchors === void 0) {
      layoutAnchors = {};
      this._layoutAnchors = layoutAnchors;
    }
    if (layoutAnchor !== null) {
      layoutAnchors[anchorName] = layoutAnchor;
    } else {
      delete layoutAnchors[anchorName];
    }
  }

  hasMemberAnimator(animatorName: string): boolean {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 && memberAnimators[animatorName] !== void 0;
  }

  getMemberAnimator(animatorName: string): Animator | null {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 ? memberAnimators[animatorName] || null : null;
  }

  setMemberAnimator(animatorName: string, animator: Animator | null): void {
    let memberAnimators = this._memberAnimators;
    if (memberAnimators === void 0) {
      memberAnimators = {};
      this._memberAnimators = memberAnimators;
    }
    if (animator !== null) {
      memberAnimators[animatorName] = animator;
    } else {
      delete memberAnimators[animatorName];
    }
  }

  /** @hidden */
  getLazyMemberAnimator(animatorName: string): Animator | null {
    let memberAnimator = this.getMemberAnimator(animatorName);
    if (memberAnimator === null) {
      const viewClass = (this as any).__proto__ as AnimatedViewClass;
      const descriptor = AnimatedView.getMemberAnimatorDescriptor(animatorName, viewClass);
      if (descriptor !== null && descriptor.animatorType !== void 0) {
        memberAnimator = AnimatedView.initMemberAnimator(descriptor.animatorType, this, animatorName, descriptor);
        this.setMemberAnimator(animatorName, memberAnimator);
      }
    }
    return memberAnimator;
  }

  /** @hidden */
  animatorDidSetAuto(animator: Animator, auto: boolean): void {
    if (animator instanceof MemberAnimator) {
      this.requireUpdate(View.NeedsDerive);
    }
  }

  /** @hidden */
  animateMembers(t: number): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.onFrame(t);
      }
    }
  }

  animate(animator: Animator): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  /** @hidden */
  cancelAnimators(): void {
    this.cancelMemberAnimators();
  }

  /** @hidden */
  cancelMemberAnimators(): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.cancel();
      }
    }
  }

  isHidden(): boolean {
    if ((this._viewFlags & View.HiddenFlag) !== 0) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderedView.is(parentView) ? parentView.isHidden() : false;
    }
  }

  setHidden(newHidden: boolean): void {
    const oldHidden = (this._viewFlags & View.HiddenFlag) !== 0;
    if (oldHidden !== newHidden) {
      this.willSetHidden(newHidden);
      if (newHidden) {
        this._viewFlags |= View.HiddenFlag;
      } else {
        this._viewFlags &= ~View.HiddenFlag;
      }
      this.onSetHidden(newHidden);
      this.didSetHidden(newHidden);
    }
  }

  protected willSetHidden(hidden: boolean): void {
    this.willObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    });
  }

  protected onSetHidden(hidden: boolean): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  isCulled(): boolean {
    if ((this._viewFlags & View.CulledFlag) !== 0) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderedView.is(parentView) ? parentView.isCulled() : false;
    }
  }

  setCulled(newCulled: boolean): void {
    const oldCulled = (this._viewFlags & View.CulledFlag) !== 0;
    if (oldCulled !== newCulled) {
      this.willSetCulled(newCulled);
      if (newCulled) {
        this._viewFlags |= View.CulledFlag;
      } else {
        this._viewFlags &= ~View.CulledFlag;
      }
      this.onSetCulled(newCulled);
      this.didSetCulled(newCulled);
    }
  }

  protected willSetCulled(culled: boolean): void {
    this.willObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewWillSetCulled !== void 0) {
        viewObserver.viewWillSetCulled(culled, this);
      }
    });
  }

  protected onSetCulled(culled: boolean): void {
    if (!culled) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetCulled(culled: boolean): void {
    this.didObserve(function (viewObserver: MapLayerViewObserver): void {
      if (viewObserver.viewDidSetCulled !== void 0) {
        viewObserver.viewDidSetCulled(culled, this);
      }
    });
  }

  cullViewFrame(viewFrame: BoxR2 = this.viewFrame): void {
    this.setCulled(!viewFrame.intersects(this.viewBounds));
  }

  get viewFrame(): BoxR2 {
    let viewFrame = this._viewFrame;
    if (viewFrame === void 0) {
      const parentView = this._parentView;
      viewFrame = RenderedView.is(parentView) ? parentView.viewFrame : BoxR2.empty();
    }
    return viewFrame;
  }

  setViewFrame(viewFrame: BoxR2 | null): void {
    if (viewFrame !== null) {
      this._viewFrame = viewFrame;
    } else if (this._viewFrame !== void 0) {
      this._viewFrame = void 0;
    }
  }

  get viewBounds(): BoxR2 {
    return this.viewFrame;
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    this.setCulled(!geoFrame.intersects(this.geoBounds));
  }

  get geoFrame(): GeoBox {
    const parentView = this.parentView;
    return MapView.is(parentView) ? parentView.geoFrame : GeoBox.globe();
  }

  get geoBounds(): GeoBox {
    return this._childViews._geoBounds;
  }

  get hitBounds(): BoxR2 {
    return this.viewBounds;
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    const geoPoint = viewContext.geoProjection.unproject(x, y);
    return this.hitTestTile(this._childViews, x, y, geoPoint, viewContext);
  }

  protected hitTestTile(tile: MapTile, x: number, y: number, geoPoint: GeoPoint,
                        viewContext: MapViewContext): RenderedView | null {
    let hit: RenderedView | null = null;
    if (tile._southWest !== null && tile._southWest._geoBounds.contains(geoPoint)) {
      hit = this.hitTestTile(tile._southWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile._northWest !== null && tile._northWest._geoBounds.contains(geoPoint)) {
      hit = this.hitTestTile(tile._northWest, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile._southEast !== null && tile._southEast._geoBounds.contains(geoPoint)) {
      hit = this.hitTestTile(tile._southEast, x, y, geoPoint, viewContext);
    }
    if (hit === null && tile._northEast !== null && tile._northEast._geoBounds.contains(geoPoint)) {
      hit = this.hitTestTile(tile._northEast, x, y, geoPoint, viewContext);
    }
    if (hit === null) {
      const childViews = tile._views;
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i];
        if (childView.hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  get parentTransform(): Transform {
    return Transform.identity();
  }

  get clientBounds(): BoxR2 {
    const inverseClientTransform = this.clientTransform.inverse();
    return this.viewBounds.transform(inverseClientTransform);
  }

  get popoverFrame(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    return this.viewBounds.transform(inversePageTransform);
  }

  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    let eventHandlers = this._eventHandlers;
    if (eventHandlers === void 0) {
      eventHandlers = {};
      this._eventHandlers = eventHandlers;
    }
    let handlers = eventHandlers[type];
    const capture = typeof options === "boolean" ? options : typeof options === "object" && options !== null && options.capture || false;
    const passive = options && typeof options === "object" && options.passive || false;
    const once = options && typeof options === "object" && options.once || false;
    let handler: ViewEventHandler | undefined;
    if (handlers === void 0) {
      handler = {listener, capture, passive, once};
      handlers = [handler];
      eventHandlers[type] = handlers;
    } else {
      const n = handlers.length;
      let i = 0;
      while (i < n) {
        handler = handlers[i];
        if (handler.listener === listener && handler.capture === capture) {
          break;
        }
        i += 1;
      }
      if (i < n) {
        handler!.passive = passive;
        handler!.once = once;
      } else {
        handler = {listener, capture, passive, once};
        handlers.push(handler);
      }
    }
    return this;
  }

  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        const capture = typeof options === "boolean" ? options : typeof options === "object" && options !== null && options.capture || false;
        const n = handlers.length;
        let i = 0;
        while (i < n) {
          const handler = handlers[i];
          if (handler.listener === listener && handler.capture === capture) {
            handlers.splice(i, 1);
            if (handlers.length === 0) {
              delete eventHandlers[type];
            }
            break;
          }
          i += 1;
        }
      }
    }
    return this;
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    const type = event.type;
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        let i = 0;
        while (i < handlers.length) {
          const handler = handlers[i];
          if (!handler.capture) {
            const listener = handler.listener;
            if (typeof listener === "function") {
              listener(event);
            } else if (typeof listener === "object" && listener !== null) {
              listener.handleEvent(event);
            }
            if (handler.once) {
              handlers.splice(i, 1);
              continue;
            }
          }
          i += 1;
        }
        if (handlers.length === 0) {
          delete eventHandlers[type];
        }
      }
    }
    if (type === "mouseover") {
      this.onMouseOver(event as MouseEvent);
    } else if (type === "mouseout") {
      this.onMouseOut(event as MouseEvent);
    }
  }

  /** @hidden */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    if (event.bubbles && !event.cancelBubble) {
      const parentView = this._parentView;
      if (RenderedView.is(parentView)) {
        return parentView.bubbleEvent(event);
      } else {
        return parentView;
      }
    } else {
      return null;
    }
  }

  dispatchEvent(event: ViewEvent): boolean {
    event.targetView = this;
    const next = this.bubbleEvent(event);
    if (next !== null) {
      return next.dispatchEvent(event);
    } else {
      return !event.cancelBubble;
    }
  }

  isHovering(): boolean {
    return (this._viewFlags & View.HoveringFlag) !== 0;
  }

  /** @hidden */
  protected onMouseOver(event: ViewMouseEvent): void {
    if ((this._viewFlags & View.HoveringFlag) === 0) {
      this._viewFlags |= View.HoveringFlag;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseenter !== void 0) {
        const enterEvent = new MouseEvent("mouseenter", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onMouseOut(event: ViewMouseEvent): void {
    if ((this._viewFlags & View.HoveringFlag) !== 0) {
      this._viewFlags &= ~View.HoveringFlag;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseleave !== void 0) {
        const leaveEvent = new MouseEvent("mouseleave", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        leaveEvent.targetView = this;
        leaveEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(leaveEvent);
      }
    }
  }
}
