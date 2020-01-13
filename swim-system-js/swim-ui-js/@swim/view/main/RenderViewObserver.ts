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

import {PointR2, BoxR2} from "@swim/math";
import {AnimatedViewObserver} from "./AnimatedViewObserver";
import {RenderViewContext} from "./RenderViewContext";
import {RenderView} from "./RenderView";

export interface RenderViewObserver<V extends RenderView = RenderView> extends AnimatedViewObserver<V> {
  viewWillUpdate?(viewContext: RenderViewContext, view: V): void;

  viewDidUpdate?(viewContext: RenderViewContext, view: V): void;

  viewWillCompute?(viewContext: RenderViewContext, view: V): void;

  viewDidCompute?(viewContext: RenderViewContext, view: V): void;

  viewWillAnimate?(viewContext: RenderViewContext, view: V): void;

  viewDidAnimate?(viewContext: RenderViewContext, view: V): void;

  viewWillLayout?(viewContext: RenderViewContext, view: V): void;

  viewDidLayout?(viewContext: RenderViewContext, view: V): void;

  viewWillScroll?(viewContext: RenderViewContext, view: V): void;

  viewDidScroll?(viewContext: RenderViewContext, view: V): void;

  viewWillRender?(viewContext: RenderViewContext, view: V): void;

  viewDidRender?(viewContext: RenderViewContext, view: V): void;

  viewWillUpdateChildViews?(viewContext: RenderViewContext, view: V): void;

  viewDidUpdateChildViews?(viewContext: RenderViewContext, view: V): void;

  viewWillSetHidden?(hidden: boolean, view: V): void;

  viewDidSetHidden?(hidden: boolean, view: V): void;

  viewWillSetCulled?(culled: boolean, view: V): void;

  viewDidSetCulled?(culled: boolean, view: V): void;

  viewWillSetBounds?(bounds: BoxR2, view: V): void;

  viewDidSetBounds?(newBounds: BoxR2, oldBounds: BoxR2, view: V): void;

  viewWillSetAnchor?(anchor: PointR2, view: V): void;

  viewDidSetAnchor?(newAnchor: PointR2, oldAnchor: PointR2, view: V): void;
}
