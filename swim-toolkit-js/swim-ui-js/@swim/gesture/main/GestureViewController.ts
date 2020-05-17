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

import {HtmlViewController} from "@swim/view";
import {GestureViewHover, GestureViewTrack, GestureView} from "./GestureView";
import {GestureViewObserver} from "./GestureViewObserver";

export class GestureViewController<V extends GestureView = GestureView> extends HtmlViewController<V> implements GestureViewObserver<V> {
  viewWillActivate(event: Event | null, view: V): void {
    // hook
  }

  viewDidActivate(event: Event | null, view: V): void {
    // hook
  }

  viewWillStartHovering(view: V): void {
    // hook
  }

  viewDidStartHovering(view: V): void {
    // hook
  }

  viewWillStopHovering(view: V): void {
    // hook
  }

  viewDidStopHovering(view: V): void {
    // hook
  }

  viewWillBeginHover(hover: GestureViewHover, event: Event | null, view: V): void {
    // hook
  }

  viewDidBeginHover(hover: GestureViewHover, event: Event | null, view: V): void {
    // hook
  }

  viewWillEndHover(hover: GestureViewHover, event: Event | null, view: V): void {
    // hook
  }

  viewDidEndHover(hover: GestureViewHover, event: Event | null, view: V): void {
    // hook
  }

  viewWillStartTracking(view: V): void {
    // hook
  }

  viewDidStartTracking(view: V): void {
    // hook
  }

  viewWillStopTracking(view: V): void {
    // hook
  }

  viewDidStopTracking(view: V): void {
    // hook
  }

  viewWillBeginTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewDidBeginTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewWillHoldTrack(track: GestureViewTrack, view: V): void {
    // hook
  }

  viewDidHoldTrack(track: GestureViewTrack, view: V): void {
    // hook
  }

  viewWillMoveTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewDidMoveTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewWillEndTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewDidEndTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewWillCancelTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }

  viewDidCancelTrack(track: GestureViewTrack, event: Event | null, view: V): void {
    // hook
  }
}
