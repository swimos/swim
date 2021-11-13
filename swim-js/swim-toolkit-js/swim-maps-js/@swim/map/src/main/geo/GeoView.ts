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

import {Class, Arrays, ObserverType} from "@swim/util";
import {GeoBox, GeoProjection} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewContext, ViewFlags, View, ViewWillProject, ViewDidProject} from "@swim/view";
import {GraphicsViewInit, GraphicsView, PaintingContext, PaintingRenderer} from "@swim/graphics";
import type {GeoViewport} from "./GeoViewport";
import type {GeoViewContext} from "./GeoViewContext";
import type {GeoViewObserver} from "./GeoViewObserver";

export interface GeoViewInit extends GraphicsViewInit {
}

export abstract class GeoView extends GraphicsView {
  override readonly observerType?: Class<GeoViewObserver>;

  override readonly contextType?: Class<GeoViewContext>;

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  override cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      processFlags &= ~View.NeedsProcess;
      processFlags |= this.flags & View.UpdateMask;
      processFlags = this.needsProcess(processFlags, viewContext);
      if ((processFlags & View.ProcessMask) !== 0) {
        let cascadeFlags = processFlags;
        this.setFlags(this.flags & ~View.NeedsProcess | (View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
        this.willProcess(cascadeFlags, viewContext);
        if (((this.flags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setFlags(this.flags & ~View.NeedsResize);
          this.willResize(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setFlags(this.flags & ~View.NeedsScroll);
          this.willScroll(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setFlags(this.flags & ~View.NeedsChange);
          this.willChange(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setFlags(this.flags & ~View.NeedsAnimate);
          this.willAnimate(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setFlags(this.flags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsProject) !== 0) {
          cascadeFlags |= View.NeedsProject;
          this.setFlags(this.flags & ~View.NeedsProject);
          this.willProject(viewContext);
        }

        this.onProcess(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.onResize(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.onScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.onChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.onAnimate(viewContext);
        }
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout(viewContext);
        }
        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.onProject(viewContext);
        }

        if ((cascadeFlags & View.ProcessMask) !== 0) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.processChildren(cascadeFlags, viewContext, this.processChild);
          this.setFlags(this.flags | View.ContextualFlag);
        }

        if ((cascadeFlags & View.NeedsProject) !== 0) {
          this.didProject(viewContext);
        }
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.didLayout(viewContext);
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.didAnimate(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.didChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.didScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.didResize(viewContext);
        }
        this.didProcess(cascadeFlags, viewContext);
      }
    } finally {
      this.setFlags(this.flags & ~(View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

  protected willProject(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillProject(viewContext, this);
      }
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didProject(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidProjectObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidProject(viewContext, this);
      }
    }
  }

  @ThemeAnimator({type: Color, state: null, inherits: true})
  readonly geoBoundsColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const outlineColor = this.geoBoundsColor.value;
    if (outlineColor !== null) {
      this.renderGeoBounds(viewContext, outlineColor, 1);
    }
  }

  protected renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof PaintingRenderer && !this.isHidden() && !this.culled && !this.unbounded) {
      this.renderGeoOutline(this.geoBounds, viewContext.geoViewport, renderer.context, outlineColor, outlineWidth);
    }
  }

  protected renderGeoOutline(geoBox: GeoBox, geoProjection: GeoProjection, context: PaintingContext,
                             outlineColor: Color, outlineWidth: number): void {
    if (geoBox.isDefined()) {
      // save
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      const southWest = geoProjection.project(geoBox.southWest.normalized());
      const northWest = geoProjection.project(geoBox.northWest.normalized());
      const northEast = geoProjection.project(geoBox.northEast.normalized());
      const southEast = geoProjection.project(geoBox.southEast.normalized());
      context.beginPath();
      context.moveTo(southWest.x, southWest.y);
      context.lineTo(northWest.x, northWest.y);
      context.lineTo(northEast.x, northEast.y);
      context.lineTo(southEast.x, southEast.y);
      context.closePath();
      context.lineWidth = outlineWidth;
      context.strokeStyle = outlineColor.toString();
      context.stroke();

      // restore
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }

  protected override onSetHidden(hidden: boolean): void {
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onSetChildHidden(this, hidden);
    }
    if (!hidden) {
      this.requireUpdate(View.NeedsProject);
    }
  }

  onSetChildHidden(childView: GeoView, hidden: boolean): void {
    // hook
  }

  onSetChildUnbounded(childView: GeoView, unbounded: boolean): void {
    // hook
  }

  protected override onSetUnbounded(unbounded: boolean): void {
    const parent = this.parent;
    if (parent instanceof GeoView) {
      parent.onSetChildUnbounded(this, unbounded);
    }
  }

  cullGeoFrame(geoFrame: GeoBox = this.geoFrame): void {
    this.setCulled(!geoFrame.intersects(this.geoBounds));
  }

  get geoViewport(): GeoViewport {
    return this.viewContext.geoViewport;
  }

  /**
   * The map-specified geo-coordinate bounding box in which this view should layout
   * and render geometry.
   */
  get geoFrame(): GeoBox {
    const parent = this.parent;
    return parent instanceof GeoView ? parent.geoFrame : GeoBox.globe();
  }

  /**
   * The self-defined geo-coordinate bounding box surrounding all geometry this
   * view could possibly render.  Views with geo bounds that don't overlap
   * their map frames may be culled from rendering and hit testing.
   */
  declare readonly geoBounds: GeoBox; // getter defined below to work around useDefineForClassFields lunacy

  get ownGeoBounds(): GeoBox | null {
    return null;
  }

  willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetGeoBounds !== void 0) {
        observer.viewWillSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    if (!this.unbounded) {
      const parent = this.parent;
      if (parent instanceof GeoView) {
        parent.onSetChildGeoBounds(this, newGeoBounds, oldGeoBounds);
      }
    }
  }

  didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetGeoBounds !== void 0) {
        observer.viewDidSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  onSetChildGeoBounds(childView: GeoView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // hook
  }

  deriveGeoBounds(): GeoBox {
    let geoBounds = this.ownGeoBounds;
    type self = this;
    function accumulateGeoBounds(this: self, childView: View): void {
      if (childView instanceof GeoView && !childView.isHidden() && !childView.unbounded) {
        const childGeoBounds = childView.geoBounds;
        if (childGeoBounds.isDefined()) {
          if (geoBounds !== null) {
            geoBounds = geoBounds.union(childGeoBounds);
          } else {
            geoBounds = childGeoBounds;
          }
        }
      }
    }
    this.forEachChild(accumulateGeoBounds, this);
    if (geoBounds === null) {
      geoBounds = this.geoFrame;
    }
    return geoBounds;
  }

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
    if (observer.viewWillProject !== void 0) {
      this.observerCache.viewWillProjectObservers = Arrays.inserted(observer as ViewWillProject, this.observerCache.viewWillProjectObservers);
    }
    if (observer.viewDidProject !== void 0) {
      this.observerCache.viewDidProjectObservers = Arrays.inserted(observer as ViewDidProject, this.observerCache.viewDidProjectObservers);
    }
  }

  protected override onUnobserve(observer: ObserverType<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillProject !== void 0) {
      this.observerCache.viewWillProjectObservers = Arrays.removed(observer as ViewWillProject, this.observerCache.viewWillProjectObservers);
    }
    if (observer.viewDidProject !== void 0) {
      this.observerCache.viewDidProjectObservers = Arrays.removed(observer as ViewDidProject, this.observerCache.viewDidProjectObservers);
    }
  }

  override init(init: GeoViewInit): void {
    super.init(init);
  }

  static override readonly MountFlags: ViewFlags = GraphicsView.MountFlags | View.NeedsProject;
  static override readonly UncullFlags: ViewFlags = GraphicsView.UncullFlags | View.NeedsProject;
}
Object.defineProperty(GeoView.prototype, "geoBounds", {
  get(this: GeoView): GeoBox {
    return this.geoFrame;
  },
  configurable: true,
});
