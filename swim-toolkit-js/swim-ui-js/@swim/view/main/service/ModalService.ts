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

import {View} from "../View";
import type {ModalOptions, Modal} from "../modal/Modal";
import {ModalManager} from "../modal/ModalManager";
import {ViewService} from "./ViewService";
import {ViewManagerService} from "./ViewManagerService";

export abstract class ModalService<V extends View> extends ViewManagerService<V, ModalManager<V>> {
  presentModal(modal: Modal, options?: ModalOptions): void {
    this.manager.presentModal(modal, options);
  }

  dismissModal(modal: Modal): void {
    this.manager.dismissModal(modal);
  }

  dismissModals(): void {
    this.manager.dismissModals();
  }

  toggleModal(modal: Modal, options?: ModalOptions): void {
    this.manager.toggleModal(modal, options);
  }

  updateModality(): void {
    this.manager.updateModality();
  }

  displaceModals(event: Event | null): void {
    this.manager.displaceModals(event);
  }

  initManager(): ModalManager<V> {
    return ModalManager.global();
  }
}

ViewService({type: ModalManager, observe: false})(View.prototype, "modalService");
