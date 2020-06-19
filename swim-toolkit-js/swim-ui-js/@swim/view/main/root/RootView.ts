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

import {Viewport} from "../Viewport";
import {ViewContext} from "../ViewContext";
import {View} from "../View";
import {ModalOptions, Modal} from "../modal/Modal";
import {LayoutManager} from "../layout/LayoutManager";
import {RootViewController} from "./RootViewController";

export interface RootView extends View, LayoutManager {
  readonly viewController: RootViewController | null;

  readonly rootView: this;

  readonly viewport: Viewport;

  readonly viewContext: ViewContext;

  readonly modals: ReadonlyArray<Modal>;

  toggleModal(popover: Modal, options?: ModalOptions): void;

  presentModal(popover: Modal, options?: ModalOptions): void;

  dismissModal(popover: Modal): void;

  dismissModals(): void;
}

/** @hidden */
export const RootView = {
  is(object: unknown): object is RootView {
    if (typeof object === "object" && object !== null) {
      const view = object as RootView;
      return view instanceof View
          && typeof view.toggleModal === "function"
          && typeof view.presentModal === "function"
          && typeof view.dismissModal === "function"
          && typeof view.dismissModals === "function";
    }
    return false;
  },
};
View.Root = RootView;
