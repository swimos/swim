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

import type {AnyTiming} from "@swim/util";
import type {View} from "../view/View";

/** @public */
export interface ModalOptions {
  modal?: boolean | number;
  multi?: boolean;
}

/** @public */
export type ModalState = "hidden" | "showing" | "shown" | "hiding";

/** @public */
export interface Modal {
  readonly modalView: View | null;

  readonly modalState: ModalState;

  readonly modality: boolean | number;

  showModal(options: ModalOptions, timing?: AnyTiming | boolean): void;

  hideModal(timing?: AnyTiming | boolean): void;
}

/** @public */
export const Modal = (function () {
  const Modal = {} as {
    is(object: unknown): object is Modal;
  };

  Modal.is = function (object: unknown): object is Modal {
    if (typeof object === "object" && object !== null) {
      const modal = object as Modal;
      return "modalView" in modal
          && "modalState" in modal
          && "modality" in modal
          && typeof modal.showModal === "function"
          && typeof modal.hideModal === "function";
    }
    return false;
  };

  return Modal;
})();
