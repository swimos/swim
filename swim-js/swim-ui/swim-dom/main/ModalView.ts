// Copyright 2015-2023 Nstream, inc.
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
import type {Property} from "@swim/component";
import type {Presence} from "@swim/style";
import type {PresenceAnimator} from "@swim/style";
import type {ElementViewObserver} from "./ElementView";
import {ElementView} from "./ElementView";

/** @public */
export interface ModalOptions {
  modal?: boolean;
  multi?: boolean;
}

/** @public */
export interface ModalViewObserver<V extends ModalView = ModalView> extends ElementViewObserver<V> {
  viewWillPresent?(view: V): void;

  viewDidPresent?(view: V): void;

  viewWillDismiss?(view: V): void;

  viewDidDismiss?(view: V): void;

  viewDidSetPresence?(presence: Presence, view: V): void;

  viewDidSetModality?(modality: number, view: V): void;
}

/** @public */
export interface ModalView extends ElementView {
  /** @override */
  readonly observerType?: Class<ModalViewObserver<any>>;

  readonly presence: PresenceAnimator<this, Presence>;

  readonly modality: Property<this, number>;
}

/** @public */
export const ModalView = {
  [Symbol.hasInstance](instance: unknown): instance is ModalView {
    return instance instanceof ElementView
        && "presence" in instance
        && "modality" in instance;
  },
};
