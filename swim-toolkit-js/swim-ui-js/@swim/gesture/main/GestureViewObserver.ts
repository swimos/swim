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

import {HtmlViewObserver} from "@swim/view";
import {GestureViewHover, GestureViewTrack, GestureView} from "./GestureView";

export interface GestureViewObserver<V extends GestureView = GestureView> extends HtmlViewObserver<V> {
  viewWillActivate?(event: Event | null, view: V): void;

  viewDidActivate?(event: Event | null, view: V): void;

  viewWillStartHovering?(view: V): void;

  viewDidStartHovering?(view: V): void;

  viewWillStopHovering?(view: V): void;

  viewDidStopHovering?(view: V): void;

  viewWillBeginHover?(hover: GestureViewHover, event: Event | null, view: V): void;

  viewDidBeginHover?(hover: GestureViewHover, event: Event | null, view: V): void;

  viewWillEndHover?(hover: GestureViewHover, event: Event | null, view: V): void;

  viewDidEndHover?(hover: GestureViewHover, event: Event | null, view: V): void;

  viewWillStartTracking?(view: V): void;

  viewDidStartTracking?(view: V): void;

  viewWillStopTracking?(view: V): void;

  viewDidStopTracking?(view: V): void;

  viewWillBeginTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewDidBeginTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewWillHoldTrack?(track: GestureViewTrack,view: V): void;

  viewDidHoldTrack?(track: GestureViewTrack, view: V): void;

  viewWillMoveTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewDidMoveTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewWillEndTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewDidEndTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewWillCancelTrack?(track: GestureViewTrack, event: Event | null, view: V): void;

  viewDidCancelTrack?(track: GestureViewTrack, event: Event | null, view: V): void;
}
