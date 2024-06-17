// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Provider} from "@swim/component";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {ViewInsets} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {ViewportColorScheme} from "@swim/view";
import type {ViewportService} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {GeoPerspectiveLike} from "@swim/map";
import {GeoPerspective} from "@swim/map";
import type {GeoViewport} from "@swim/map";
import type {MapViewObserver} from "@swim/map";
import {MapView} from "@swim/map";
import {MapboxViewport} from "./MapboxViewport";

/** @public */
export interface MapboxViewObserver<V extends MapboxView = MapboxView> extends MapViewObserver<V> {
  viewWillSetGeoViewport?(newGeoViewport: MapboxViewport | null, oldGeoViewport: MapboxViewport | null, view: V): void;

  viewDidSetGeoViewport?(newGeoViewport: MapboxViewport | null, oldGeoViewport: MapboxViewport | null, view: V): void;

  viewWillMoveMap?(view: V): void;

  viewDidMoveMap?(view: V): void;
}

/** @public */
export class MapboxView extends MapView {
  constructor(map: mapboxgl.Map) {
    super();
    this.map = map;
    (this.geoViewport as Mutable<typeof this.geoViewport>).value = MapboxViewport.create(map);

    this.onMapRender = this.onMapRender.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);
    this.initMap(map);
  }

  declare readonly observerType?: Class<MapboxViewObserver>;

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

  @Property({
    extends: true,
    didSetValue(newGeoViewport: GeoViewport | null, oldGeoViewport: GeoViewport | null): void {
      super.didSetValue(newGeoViewport, oldGeoViewport);
      const immediate = !this.owner.hidden && !this.owner.culled;
      this.owner.requireUpdate(View.NeedsProject, immediate);
    },
    update(): void {
      if (this.hasAffinity(Affinity.Intrinsic)) {
        this.setIntrinsic(MapboxViewport.create(this.owner.map));
      }
    },
  })
  override readonly geoViewport!: Property<this, GeoViewport | null> & MapView["geoViewport"] & {
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

  override moveTo(geoPerspective: GeoPerspectiveLike, timing?: TimingLike | boolean): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }

    geoPerspective = GeoPerspective.fromLike(geoPerspective);
    let bounds: mapboxgl.LngLatBoundsLike | undefined;
    const options: mapboxgl.FitBoundsOptions = {};

    const geoFrame = geoPerspective.geoFrame;
    if (geoFrame !== null) {
      bounds = [geoFrame.west, geoFrame.south, geoFrame.east, geoFrame.north];
    }

    const geoCenter = geoPerspective.geoCenter;
    if (geoCenter !== null && !geoViewport.geoCenter.equivalentTo(geoCenter, 1e-5)) {
      options.center = geoCenter;
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
      timing = Timing.fromLike(timing);
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    } else {
      options.duration = 0;
    }

    options.padding = this.edgeInsets.padding;

    if (bounds !== void 0) {
      this.map.fitBounds(bounds, options);
    } else {
      this.map.flyTo(options);
    }

    if (options.duration === 0) {
      setTimeout(this.requireUpdate.bind(this, View.NeedsProject));
    }
  }

  protected willMoveMap(): void {
    this.callObservers("viewWillMoveMap", this);
  }

  protected didMoveMap(): void {
    this.callObservers("viewDidMoveMap", this);
  }

  @ViewRef({
    extends: true,
    didAttachView(canvasView: CanvasView, targetView: View | null): void {
      if (this.owner.parent === null) {
        canvasView.appendChild(this.owner);
        canvasView.setEventTarget(this.owner.map.getCanvasContainer());
      }
      super.didAttachView(canvasView, targetView);
    },
    willDetachView(canvasView: CanvasView): void {
      super.willDetachView(canvasView);
      if (this.owner.parent === canvasView) {
        canvasView.removeChild(this.owner);
      }
    },
  })
  override readonly canvas!: ViewRef<this, CanvasView> & MapView["canvas"];

  @ViewRef({
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
      super.didAttachView(containerView, targetView);
    },
    willDetachView(containerView: HtmlView): void {
      super.willDetachView(containerView);
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

  @ViewRef({viewType: HtmlView})
  readonly controlContainer!: ViewRef<this, HtmlView>;

  @ViewRef({viewType: HtmlView})
  readonly topLeftControls!: ViewRef<this, HtmlView>;

  @ViewRef({viewType: HtmlView})
  readonly topRightControls!: ViewRef<this, HtmlView>;

  @ViewRef({viewType: HtmlView})
  readonly bottomLeftControls!: ViewRef<this, HtmlView>;

  @ViewRef({viewType: HtmlView})
  readonly bottomRightControls!: ViewRef<this, HtmlView>;

  @Property({
    extends: true,
    get padding(): mapboxgl.PaddingOptions {
      const edgeInsets = this.value;
      let top = edgeInsets.insetTop;
      let right = edgeInsets.insetRight;
      let bottom = edgeInsets.insetBottom;
      let left = edgeInsets.insetLeft;
      const containerView = this.owner.container.view;
      if (containerView !== null) {
        top = Math.max(containerView.style.paddingTop.pxState(), top);
        right = Math.max(containerView.style.paddingRight.pxState(), right);
        bottom = Math.max(containerView.style.paddingBottom.pxState(), bottom);
        left = Math.max(containerView.style.paddingLeft.pxState(), left);
      }
      return {top, right, bottom, left};
    },
  })
  override get edgeInsets(): Property<this, ViewInsets> & {
    get padding(): mapboxgl.PaddingOptions;
  } {
    return Property.getter();
  }

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
    if (containerView === null) {
      return;
    }
    const edgeInsets = containerView.edgeInsets.value;
    const top = Math.max(containerView.style.paddingTop.pxState(), edgeInsets.insetTop);
    const right = Math.max(containerView.style.paddingRight.pxState(), edgeInsets.insetRight);
    const bottom = Math.max(containerView.style.paddingBottom.pxState(), edgeInsets.insetBottom);
    const left = Math.max(containerView.style.paddingLeft.pxState(), edgeInsets.insetLeft);
    const topLeftControlsView = this.topLeftControls.view;
    if (topLeftControlsView !== null) {
      topLeftControlsView.style.top.setIntrinsic(top);
      topLeftControlsView.style.left.setIntrinsic(left);
    }
    const topRightControlsView = this.topRightControls.view;
    if (topRightControlsView !== null) {
      topRightControlsView.style.top.setIntrinsic(top);
      topRightControlsView.style.right.setIntrinsic(right);
    }
    const bottomLeftControlsView = this.bottomLeftControls.view;
    if (bottomLeftControlsView !== null) {
      bottomLeftControlsView.style.bottom.setIntrinsic(bottom);
      bottomLeftControlsView.style.left.setIntrinsic(left);
    }
    const bottomRightControlsView = this.bottomRightControls.view;
    if (bottomRightControlsView !== null) {
      bottomRightControlsView.style.bottom.setIntrinsic(bottom);
      bottomRightControlsView.style.right.setIntrinsic(right);
    }
  }

  @Provider({
    extends: true,
    observes: true,
    serviceDidSetViewportColorScheme(colorScheme: ViewportColorScheme): void {
      this.owner.mapStyle.update();
    },
  })
  override get viewport(): Provider<this, ViewportService> & MapView["viewport"] & Observes<ViewportService> {
    return Provider.getter();
  }

  @Property({
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
      if (!this.hasAffinity(Affinity.Intrinsic)) {
        return;
      }
      const viewportService = this.owner.viewport.service;
      if (viewportService === null) {
        return;
      }
      const colorScheme = viewportService.colorScheme.value;
      if (colorScheme === "dark") {
        this.setIntrinsic(this.dark);
      } else {
        this.setIntrinsic(this.light);
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
