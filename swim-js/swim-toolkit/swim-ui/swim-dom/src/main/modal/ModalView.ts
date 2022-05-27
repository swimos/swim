// Copyright 2015-2022 Swim.inc
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

import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import {AnyPresence, Presence, PresenceAnimator} from "@swim/style";
import {ElementView} from "../element/ElementView";
import type {ModalViewObserver} from "./ModalViewObserver";

/** @public */
export interface ModalOptions {
  modal?: boolean;
  multi?: boolean;
}

/** @public */
export interface ModalView extends ElementView {
  /** @override */
  readonly observerType?: Class<ModalViewObserver<any>>;

  readonly presence: PresenceAnimator<this, Presence, AnyPresence>;

  readonly modality: Property<this, number>;
}

/** @public */
export const ModalView = (function () {
  const ModalView = {} as {
    is(object: unknown): object is ModalView;
  };

  ModalView.is = function (object: unknown): object is ModalView {
    if (typeof object === "object" && object !== null) {
      const modalView = object as ModalView;
      return modalView instanceof ElementView
          && modalView.presence instanceof PresenceAnimator
          && modalView.modality instanceof Property;
    }
    return false;
  };

  return ModalView;
})();
