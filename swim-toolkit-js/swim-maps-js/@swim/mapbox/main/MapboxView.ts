// Copyright 2015-2020 Swim inc.
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

import {Equivalent} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import type {AnyPointR2, PointR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {GraphicsViewContext, CanvasView} from "@swim/graphics";
import {MapView, MapLayerView} from "@swim/map";
import {MapboxProjection} from "./MapboxProjection";
import type {MapboxViewObserver} from "./MapboxViewObserver";
import type {MapboxViewController} from "./MapboxViewController";

export class MapboxView extends MapLayerView implements MapView {
  constructor(map: mapboxgl.Map) {
    super();
    Object.defineProperty(this, "map", {
      value: map,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "geoProjection", {
      value: new MapboxProjection(map),
      enumerable: true,
      configurable: true,
    });
    const center = map.getCenter();
    Object.defineProperty(this, "mapCenter", {
      value: new GeoPoint(center.lng, center.lat),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "mapZoom", {
      value: map.getZoom(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "mapHeading", {
      value: map.getBearing(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "mapTilt", {
      value: map.getPitch(),
      enumerable: true,
      configurable: true,
    });
    this.onMapRender = this.onMapRender.bind(this);
    this.startRepositioning = this.startRepositioning.bind(this);
    this.stopRepositioning = this.stopRepositioning.bind(this);
    this.initMap(map);
  }

  declare readonly viewController: MapboxViewController | null;

  declare readonly viewObservers: ReadonlyArray<MapboxViewObserver>;

  declare readonly map: mapboxgl.Map;

  protected initMap(map: mapboxgl.Map): void {
    map.on("render", this.onMapRender);
    map.on("movestart", this.startRepositioning);
    map.on("moveend", this.stopRepositioning);
  }

  project(lnglat: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyGeoPoint | number, lat?: number): PointR2 {
    if (arguments.length === 1) {
      return this.geoProjection.project(lng as AnyGeoPoint);
    } else {
      return this.geoProjection.project(lng as number, lat!);
    }
  }

  unproject(point: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
  unproject(x: AnyPointR2 | number, y?: number): GeoPoint {
    if (arguments.length === 1) {
      return this.geoProjection.unproject(x as AnyPointR2);
    } else {
      return this.geoProjection.unproject(x as number, y!);
    }
  }

  // @ts-ignore
  declare readonly geoProjection: MapboxProjection;

  declare readonly mapCenter: GeoPoint;

  // @ts-ignore
  declare readonly mapZoom: number;

  // @ts-ignore
  declare readonly mapHeading: number;

  // @ts-ignore
  declare readonly mapTilt: number;

  moveTo(mapCenter: AnyGeoPoint | undefined, mapZoom: number | undefined,
         timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    const options: mapboxgl.FlyToOptions = {};
    if (mapCenter !== void 0) {
      mapCenter = GeoPoint.fromAny(mapCenter);
      if (!this.mapCenter.equivalentTo(mapCenter, 1e-5)) {
        options.center = mapCenter;
      }
    }
    if (mapZoom !== void 0 && !Equivalent(this.mapZoom, mapZoom, 1e-5)) {
      options.zoom = mapZoom;
    }
    if (timing instanceof Timing) {
      options.duration = timing.duration;
    }
    this.map.flyTo(options);
  }

  protected mapWillMove(mapCenter: GeoPoint, mapZoom: number): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.mapViewWillMove !== void 0) {
      viewController.mapViewWillMove(mapCenter, mapZoom, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.mapViewWillMove !== void 0) {
        viewObserver.mapViewWillMove(mapCenter, mapZoom, this);
      }
    }
  }

  protected mapDidMove(mapCenter: GeoPoint, mapZoom: number): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!
      if (viewObserver.mapViewDidMove !== void 0) {
        viewObserver.mapViewDidMove(mapCenter, mapZoom, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.mapViewDidMove !== void 0) {
      viewController.mapViewDidMove(mapCenter, mapZoom, this);
    }
  }

  extendViewContext(viewContext: GraphicsViewContext): ViewContextType<this> {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.geoProjection = this.geoProjection;
    mapViewContext.geoFrame = this.geoFrame;
    mapViewContext.mapZoom = this.mapZoom;
    mapViewContext.mapHeading = this.mapHeading;
    mapViewContext.mapTilt = this.mapTilt;
    return mapViewContext;
  }

  get geoFrame(): GeoBox {
    const bounds = this.map.getBounds();
    return new GeoBox(bounds.getWest(), bounds.getSouth(),
                      bounds.getEast(), bounds.getNorth());
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsProject;
    }
    return processFlags;
  }

  protected onMapRender(): void {
    const map = this.map;
    let needsProject = false;
    const oldMapCenter = this.mapCenter;
    const center = map.getCenter();
    const newMapCenter = new GeoPoint(center.lng, center.lat);
    if (!oldMapCenter.equals(newMapCenter)) {
      Object.defineProperty(this, "mapCenter", {
        value: newMapCenter,
        enumerable: true,
        configurable: true,
      });
      needsProject = true;
    }
    const oldMapZoom = this.mapZoom;
    const newMapZoom = map.getZoom();
    if (oldMapZoom !== newMapZoom) {
      Object.defineProperty(this, "mapZoom", {
        value: newMapZoom,
        enumerable: true,
        configurable: true,
      });
      needsProject = true;
    }
    const oldMapHeading = this.mapHeading;
    const newMapHeading = map.getBearing();
    if (oldMapHeading !== newMapHeading) {
      Object.defineProperty(this, "mapHeading", {
        value: newMapHeading,
        enumerable: true,
        configurable: true,
      });
      needsProject = true;
    }
    const oldMapTilt = this.mapTilt;
    const newMapTilt = map.getPitch();
    if (oldMapTilt !== newMapTilt) {
      Object.defineProperty(this, "mapTilt", {
        value: newMapTilt,
        enumerable: true,
        configurable: true,
      });
      needsProject = true;
    }
    if (needsProject && !this.isHidden() && !this.isCulled()) {
      this.requireUpdate(View.NeedsProject, true);
    }
  }

  protected startRepositioning(): void {
    this.mapWillMove(this.mapCenter, this.mapZoom);
  }

  protected stopRepositioning(): void {
    this.mapDidMove(this.mapCenter, this.mapZoom);
  }

  overlayCanvas(): CanvasView | null {
    if (this.isMounted()) {
      return this.getSuperView(CanvasView);
    } else {
      const map = this.map;
      HtmlView.fromNode(map.getContainer());
      const canvasContainer = HtmlView.fromNode(map.getCanvasContainer());
      const canvas = canvasContainer.append(CanvasView);
      canvas.setEventNode(canvasContainer.node);
      canvas.appendChildView(this);
      return canvas;
    }
  }

  static readonly powerFlags: ViewFlags = MapLayerView.powerFlags | View.NeedsProject;
}
