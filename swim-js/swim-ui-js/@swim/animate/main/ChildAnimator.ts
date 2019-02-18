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

import {Animated} from "./Animated";
import {Animator} from "./Animator";

export abstract class ChildAnimator extends Animator {
  abstract get parent(): Animated | null;

  get dirty(): boolean {
    const parent = this.parent;
    return parent ? parent.dirty : false;
  }

  setDirty(dirty: boolean): void {
    if (dirty) {
      const parent = this.parent;
      if (parent) {
        parent.setDirty(dirty);
      }
    }
  }

  animate(): void {
    const parent = this.parent;
    if (parent) {
      parent.animate();
    }
  }
}
