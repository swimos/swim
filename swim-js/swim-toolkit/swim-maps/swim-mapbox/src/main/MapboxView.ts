// Copyright 2015-2023 Swim.inc
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

import {Class, Equivalent, AnyTiming, Timing, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property, Provider} from "@swim/component";
import {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View, ViewRef, ViewportColorScheme, ViewportService} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import {AnyGeoPerspective, GeoViewport, MapView} from "@swim/map";
import {MapboxViewport} from "./MapboxViewport";
import type {MapboxViewObserver} from "./MapboxViewObserver";

/** @public */
export class MapboxView extends MapView {
  constructor(map: mapboxgl.Map) {
    super();
    this.map = map;
    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  override readonly observerType?: Class<MapboxViewObserver>;

  readonly map: mapboxgl.Map;

  protected initMap(map: mapboxgl.Map): void {
    map.on("render", this.onMapRender);
    map.on("movestart", this.onMoveStart);
    map.on("moveend", this.onMoveEnd);
    if ((map as any).style === void 0) {
      this.mapStyle.update();
    } else {
      this.mapStyle.setAffinity(Affinity.Extrinsic);
    }
  }

  @Property<MapboxView["geoViewport"]>({
    extends: true,
    initValue(): GeoViewport {
      return MapboxViewport.create(this.owner.map);
    },
    willSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewWillSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    didSetValue(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("viewDidSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
      const immediate = !this.owner.hidden && !this.owner.culled;
      this.owner.requireUpdate(View.NeedsProject, immediate);
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        this.setValue(MapboxViewport.create(this.owner.map), Affinity.Intrinsic);
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport> & MapView["geoViewport"] & {
    /** @internal */
    update(): void;
  };

  protected onMapRender(): void {
    this.geoViewport.update();
  }

  protected onMoveStart(): void {
    this.willMoveMap();
  }

  protected onMoveEnd(): void {
    this.didMoveMap();
  }

  override moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void {
    const options: mapboxgl.FlyToOptions = {};
    const geoViewport = this.geoViewport.value;
    let geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== void 0 && geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(geoCenter);
      if (!geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
        options.center = geoCenter;
      }
    }
    const zoom = geoPerspective.zoom;
    if (zoom !== void 0 && !Equivalent(geoViewport.zoom, zoom, 1e-5)) {
      options.zoom = zoom;
    }
    const heading = geoPerspective.heading;
    if (heading !== void 0 && !Equivalent(geoViewport.heading, heading, 1e-5)) {
      options.bearing = heading;
    }
    const tilt = geoPerspective.tilt;
    if (tilt !== void 0 && !Equivalent(geoViewport.tilt, tilt, 1e-5)) {
      options.pitch = tilt;
    }
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    }
    this.map.flyTo(options);
  }

  protected willMoveMap(): void {
    this.callObservers("viewWillMoveMap", this);
  }

  protected didMoveMap(): void {
    this.callObservers("viewDidMoveMap", this);
  }

  @ViewRef<MapboxView["canvas"]>({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
        canvasView.setEventNode(this.owner.map.getCanvasContainer());
      }
      MapView.canvas.prototype.didAttachView.call(this, canvasView, targetView);
    },
    willDetachView(canvasView: CanvasView): void {
      MapView.canvas.prototype.willDetachView.call(this, canvasView);
      if (this.owner.parent === canvasView) {
        canvasView.removeChild(this.owner);
      }
    },
  })
  override readonly canvas!: ViewRef<this, CanvasView> & MapView["canvas"];
  static override readonly canvas: FastenerClass<MapboxView["canvas"]>;

  @ViewRef<MapboxView["container"]>({
    extends: true,
    didAttachView(containerView: HtmlView, targetView: View | null): void {
      HtmlView.fromNode(this.owner.map.getContainer());
      const canvasContainerView =  HtmlView.fromNode(this.owner.map.getCanvasContainer());
      this.owner.canvas.insertView(canvasContainerView);
      const controlContainerNode = containerView.node.querySelector(".mapboxgl-control-container") as HTMLElement | null;
      if (controlContainerNode !== null) {
        this.owner.controlContainer.setView(HtmlView.fromNode(controlContainerNode));
        const topLeftControlsNode = controlContainerNode.querySelector(".mapboxgl-ctrl-top-left") as HTMLElement | null;
        if (topLeftControlsNode !== null) {
          this.owner.topLeftControls.setView(HtmlView.fromNode(topLeftControlsNode));
        }
        const topRightControlsNode = controlContainerNode.querySelector(".mapboxgl-ctrl-top-right") as HTMLElement | null;
        if (topRightControlsNode !== null) {
          this.owner.topRightControls.setView(HtmlView.fromNode(topRightControlsNode));
        }
        const bottomLeftControlsNode = controlContainerNode.querySelector(".mapboxgl-ctrl-bottom-left") as HTMLElement | null;
        if (bottomLeftControlsNode !== null) {
          this.owner.bottomLeftControls.setView(HtmlView.fromNode(bottomLeftControlsNode));
        }
        const bottomRightControlsNode = controlContainerNode.querySelector(".mapboxgl-ctrl-bottom-right") as HTMLElement | null;
        if (bottomRightControlsNode !== null) {
          this.owner.bottomRightControls.setView(HtmlView.fromNode(bottomRightControlsNode));
        }
      }
      MapView.container.prototype.didAttachView.call(this, containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      MapView.container.prototype.willDetachView.call(this, containerView);
      const canvasView = this.owner.canvas.view;
      const canvasContainerView = HtmlView.fromNode(this.owner.map.getCanvasContainer());
      if (canvasView !== null && canvasView.parent === canvasContainerView) {
        canvasContainerView.removeChild(containerView);
      }
      this.owner.controlContainer.setView(null);
      this.owner.topLeftControls.setView(null);
      this.owner.topRightControls.setView(null);
      this.owner.bottomLeftControls.setView(null);
      this.owner.bottomRightControls.setView(null);
    },
  })
  override readonly container!: ViewRef<this, HtmlView> & MapView["container"];
  static override readonly container: FastenerClass<MapboxView["container"]>;

  @ViewRef<MapboxView["controlContainer"]>({
    viewType: HtmlView,
  })
  readonly controlContainer!: ViewRef<this, HtmlView>;

  @ViewRef<MapboxView["topLeftControls"]>({
    viewType: HtmlView,
  })
  readonly topLeftControls!: ViewRef<this, HtmlView>;

  @ViewRef<MapboxView["topRightControls"]>({
    viewType: HtmlView,
  })
  readonly topRightControls!: ViewRef<this, HtmlView>;

  @ViewRef<MapboxView["bottomLeftControls"]>({
    viewType: HtmlView,
  })
  readonly bottomLeftControls!: ViewRef<this, HtmlView>;

  @ViewRef<MapboxView["bottomRightControls"]>({
    viewType: HtmlView,
  })
  readonly bottomRightControls!: ViewRef<this, HtmlView>;

  protected override onResize(): void {
    super.onResize();
    this.map.resize();
  }

  protected override onLayout(): void {
    super.onLayout();
    this.layoutControls();
  }

  protected layoutControls(): void {
    const containerView = this.container.view;
    if (containerView !== null) {
      const edgeInsets = containerView.edgeInsets.value;
      const top = Math.max(containerView.paddingTop.pxState(), edgeInsets.insetTop);
      const right = Math.max(containerView.paddingRight.pxState(), edgeInsets.insetRight);
      const bottom = Math.max(containerView.paddingBottom.pxState(), edgeInsets.insetBottom);
      const left = Math.max(containerView.paddingLeft.pxState(), edgeInsets.insetLeft);
      const topLeftControlsView = this.topLeftControls.view;
      if (topLeftControlsView !== null) {
        topLeftControlsView.top.setState(top, Affinity.Intrinsic);
        topLeftControlsView.left.setState(left, Affinity.Intrinsic);
      }
      const topRightControlsView = this.topRightControls.view;
      if (topRightControlsView !== null) {
        topRightControlsView.top.setState(top, Affinity.Intrinsic);
        topRightControlsView.right.setState(right, Affinity.Intrinsic);
      }
      const bottomLeftControlsView = this.bottomLeftControls.view;
      if (bottomLeftControlsView !== null) {
        bottomLeftControlsView.bottom.setState(bottom, Affinity.Intrinsic);
        bottomLeftControlsView.left.setState(left, Affinity.Intrinsic);
      }
      const bottomRightControlsView = this.bottomRightControls.view;
      if (bottomRightControlsView !== null) {
        bottomRightControlsView.bottom.setState(bottom, Affinity.Intrinsic);
        bottomRightControlsView.right.setState(right, Affinity.Intrinsic);
      }
    }
  }

  @Provider<MapboxView["viewport"]>({
    extends: true,
    observes: true,
    serviceDidSetViewportColorScheme(colorScheme: ViewportColorScheme): void {
      this.owner.mapStyle.update();
    },
  })
  override readonly viewport!: Provider<this, ViewportService> & MapView["viewport"] & Observes<ViewportService>;
  static override readonly viewport: FastenerClass<MapboxView["viewport"]>;

  @Property<MapboxView["mapStyle"]>({
    value: null,
    init(): void {
      this.dark = "mapbox://styles/mapbox/dark-v10";
      this.light = "mapbox://styles/mapbox/light-v10";
    },
    didSetValue(mapStyle: mapboxgl.Style | string | null) {
      if (mapStyle !== null) {
        this.owner.map.setStyle(mapStyle);
      }
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        const viewportService = this.owner.viewport.service;
        if (viewportService !== null) {
          const colorScheme = viewportService.colorScheme.value;
          if (colorScheme === "dark") {
            this.setValue(this.dark, Affinity.Intrinsic);
          } else {
            this.setValue(this.light, Affinity.Intrinsic);
          }
        }
      }
    },
  })
  readonly mapStyle!: Property<this, mapboxgl.Style | string | null> & {
    dark: mapboxgl.Style | string | null,
    light: mapboxgl.Style | string | null,
    update(): void,
  };

  protected override onMount(): void {
    super.onMount();
    this.mapStyle.update();
  }
}
