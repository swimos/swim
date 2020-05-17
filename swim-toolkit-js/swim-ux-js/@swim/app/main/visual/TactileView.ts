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

import {Ease, Transition} from "@swim/transition";
import {GestureViewTrack, GestureView, GestureViewController} from "@swim/gesture";
import {IlluminationView} from "./IlluminationView";

export class TactileView extends GestureView {
  constructor(node: HTMLElement) {
    super(node);
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("tactile");
  }

  get viewController(): GestureViewController<TactileView> | null {
    return this._viewController;
  }

  get tactileTransition(): Transition<any> | null {
    return Transition.duration<any>(250, Ease.cubicOut);
  }

  protected onBeginTrack(track: GestureViewTrack, event: Event | null): void {
    if (track.view === void 0) {
      const delay = track.pointerType === "mouse" ? 0 : 100;
      const illumination = this.prepend(IlluminationView);
      illumination.illuminate(track.x, track.y, 0.1, this.tactileTransition, delay);
      track.view = illumination;
    }
  }

  protected onMoveTrack(track: GestureViewTrack, event: Event | null): void {
    super.onMoveTrack(track, event);
    if (!this.clientBounds.contains(track.x, track.y)) {
      track.preventDefault();
      this.beginHover(track.id, track.pointerType, event);
      if (track.view instanceof IlluminationView) {
        track.view.dissipate(track.x, track.y, this.tactileTransition);
      }
    }
  }

  protected onEndTrack(track: GestureViewTrack, event: Event | null): void {
    if (track.view instanceof IlluminationView) {
      if (this.clientBounds.contains(track.x, track.y)) {
        track.view.stimulate(track.x, track.y, 0.1, this.tactileTransition);
      } else {
        track.view.dissipate(track.x, track.y, this.tactileTransition);
      }
    }
  }

  protected onCancelTrack(track: GestureViewTrack, event: Event | null): void {
    if (track.view instanceof IlluminationView) {
      track.view.dissipate(track.x, track.y, this.tactileTransition);
    }
  }
}
