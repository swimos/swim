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

import {Tween} from "@swim/transition";
import {View} from "../View";

export type ModalState = "hidden" | "showing" | "shown" | "hiding";

export interface ModalOptions {
  focus?: boolean;
  multi?: boolean;
}

export interface Modal {
  readonly modalState: ModalState;

  readonly modalView: View | null;

  showModal(tween?: Tween<any>): void;

  hideModal(tween?: Tween<any>): void;
}

/** @hidden */
export const Modal = {
  is(object: unknown): object is Modal {
    if (typeof object === "object" && object !== null) {
      const modal = object as Modal;
      return modal.modalState !== void 0
          && modal.modalView !== void 0
          && typeof modal.showModal === "function"
          && typeof modal.hideModal === "function";
    }
    return false;
  },
};
