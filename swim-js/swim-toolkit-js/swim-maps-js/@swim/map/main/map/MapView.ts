// Copyright 2015-2021 Swim Inc.
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

import type {AnyTiming} from "@swim/util";
import type {GeoBox} from "@swim/geo";
import {ViewContextType, ViewFlags, View, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {GraphicsViewContext, CanvasView} from "@swim/graphics";
import type {AnyGeoPerspective} from "../geo/GeoPerspective";
import type {GeoViewport} from "../geo/GeoViewport";
import {GeoLayerView} from "../layer/GeoLayerView";
import type {MapViewObserver} from "./MapViewObserver";

export abstract class MapView extends GeoLayerView {
  override readonly viewObservers!: ReadonlyArray<MapViewObserver>;

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsProject;
    }
    return processFlags;
  }

  override extendViewContext(viewContext: GraphicsViewContext): ViewContextType<this> {
    const mapViewContext = Object.create(viewContext);
    mapViewContext.geoViewport = this.geoViewport;
    return mapViewContext;
  }

  override get geoFrame(): GeoBox {
    return this.geoViewport.geoFrame;
  }

  abstract override get geoViewport(): GeoViewport;

  abstract moveTo(geoPerspective: AnyGeoPerspective, timing?: AnyTiming | boolean): void;

  protected initCanvas(canvasView: CanvasView): void {
    // hook
  }

  protected attachCanvas(canvasView: CanvasView): void {
    // hook
  }

  protected detachCanvas(canvasView: CanvasView): void {
    // hook
  }

  protected willSetCanvas(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetMapCanvas !== void 0) {
        viewObserver.viewWillSetMapCanvas(newCanvasView, oldCanvasView, this);
      }
    }
  }

  protected onSetCanvas(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    if (oldCanvasView !== null) {
      this.detachCanvas(oldCanvasView);
    }
    if (newCanvasView !== null) {
      this.attachCanvas(newCanvasView);
      this.initCanvas(newCanvasView);
    }
  }

  protected didSetCanvas(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetMapCanvas !== void 0) {
        viewObserver.viewDidSetMapCanvas(newCanvasView, oldCanvasView, this);
      }
    }
  }

  @ViewFastener<MapView, CanvasView>({
    type: CanvasView,
    child: false,
    willSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.willSetCanvas(newCanvasView, oldCanvasView);
    },
    onSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.onSetCanvas(newCanvasView, oldCanvasView);
    },
    didSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.didSetCanvas(newCanvasView, oldCanvasView);
    },
  })
  readonly canvas!: ViewFastener<this, CanvasView>;

  protected initContainer(containerView: HtmlView): void {
    // hook
  }

  protected attachContainer(containerView: HtmlView): void {
    // hook
  }

  protected detachContainer(containerView: HtmlView): void {
    // hook
  }

  protected willSetContainer(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetMapContainer !== void 0) {
        viewObserver.viewWillSetMapContainer(newContainerView, oldContainerView, this);
      }
    }
  }

  protected onSetContainer(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
    if (oldContainerView !== null) {
      this.detachContainer(oldContainerView);
    }
    if (newContainerView !== null) {
      this.attachContainer(newContainerView);
      this.initContainer(newContainerView);
    }
  }

  protected didSetContainer(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetMapContainer !== void 0) {
        viewObserver.viewDidSetMapContainer(newContainerView, oldContainerView, this);
      }
    }
  }

  @ViewFastener<MapView, HtmlView>({
    type: HtmlView,
    child: false,
    willSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.willSetContainer(newContainerView, oldContainerView);
    },
    onSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.onSetContainer(newContainerView, oldContainerView);
    },
    didSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.didSetContainer(newContainerView, oldContainerView);
    },
  })
  readonly container!: ViewFastener<this, HtmlView>;

  static override readonly powerFlags: ViewFlags = GeoLayerView.powerFlags | View.NeedsProject;
}
