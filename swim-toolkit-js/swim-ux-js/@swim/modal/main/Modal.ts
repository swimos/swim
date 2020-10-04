// Copyright 2015-2020 Swim inc.
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
import {View} from "@swim/view";

export interface ModalOptions {
  modal?: boolean | number;
  multi?: boolean;
}

export type ModalState = "hidden" | "showing" | "shown" | "hiding";

export interface Modal {
  readonly modalView: View | null;

  readonly modalState: ModalState;

  readonly modality: boolean | number;

  showModal(options: ModalOptions, tween?: Tween<any>): void;

  hideModal(tween?: Tween<any>): void;
}

/** @hidden */
export const Modal = {
  is(object: unknown): object is Modal {
    if (typeof object === "object" && object !== null) {
      const modal = object as Modal;
      return "modalView" in modal
          && "modalState" in modal
          && "modality" in modal
          && typeof modal.showModal === "function"
          && typeof modal.hideModal === "function";
    }
    return false;
  },
};
