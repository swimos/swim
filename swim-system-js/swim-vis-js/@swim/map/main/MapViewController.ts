// Copyright 2015-2019 SWIM.AI inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {RenderingContext} from "@swim/render";
import {View, RenderViewController} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapView} from "./MapView";
import {MapViewObserver} from "./MapViewObserver";

export interface MapViewController<V extends MapView = MapView> extends RenderViewController<V>, MapViewObserver<V> {
  readonly view: V | null;

  setView(view: V | null): void;

  viewWillSetKey(key: string | null, view: V): void;

  viewDidSetKey(key: string | null, view: V): void;

  viewWillSetParentView(parentView: View | null, view: V): void;

  viewDidSetParentView(parentView: View | null, view: V): void;

  viewWillInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewDidInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewWillRemoveChildView(childView: View, view: V): void;

  viewDidRemoveChildView(childView: View, view: V): void;

  viewWillMount(view: V): void;

  viewDidMount(view: V): void;

  viewWillUnmount(view: V): void;

  viewDidUnmount(view: V): void;

  viewWillResize(view: V): void;

  viewDidResize(view: V): void;

  viewWillLayout(view: V): void;

  viewDidLayout(view: V): void;

  viewWillScroll(view: V): void;

  viewDidScroll(view: V): void;

  viewWillAnimate(frame: number, view: V): void;

  viewDidAnimate(frame: number, view: V): void;

  viewWillRender(context: RenderingContext, view: V): void;

  viewDidRender(context: RenderingContext, view: V): void;

  viewWillCull(view: V): void;

  viewDidCull(view: V): void;

  viewWillSetHidden(hidden: boolean, view: V): boolean | void;

  viewDidSetHidden(hidden: boolean, view: V): void;

  viewWillSetCulled(culled: boolean, view: V): boolean | void;

  viewDidSetCulled(culled: boolean, view: V): void;

  viewWillSetBounds(bounds: BoxR2, view: V): BoxR2 | void;

  viewDidSetBounds(newBounds: BoxR2, oldBounds: BoxR2, view: V): void;

  viewWillSetAnchor(anchor: PointR2, view: V): PointR2 | void;

  viewDidSetAnchor(newAnchor: PointR2, oldAnchor: PointR2, view: V): void;

  viewWillSetProjection(projection: MapProjection, view: V): MapProjection | void;

  viewDidSetProjection(projection: MapProjection, view: V): void;

  viewWillSetZoom(zoom: number, view: V): void;

  viewDidSetZoom(newZoom: number, oldZoom: number, view: V): void;
}
