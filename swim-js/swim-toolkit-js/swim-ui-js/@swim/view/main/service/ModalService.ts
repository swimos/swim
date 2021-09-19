// Copyright 2015-2021 Swim Inc.
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

export abstract class ModalService<V extends View, VM extends ModalManager<V> | null | undefined = ModalManager<V>> extends ViewManagerService<V, VM> {
  presentModal(modal: Modal, options?: ModalOptions): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.presentModal(modal, options);
  }

  dismissModal(modal: Modal): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.dismissModal(modal);
  }

  dismissModals(): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.dismissModals();
  }

  toggleModal(modal: Modal, options?: ModalOptions): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.toggleModal(modal, options);
  }

  updateModality(): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.updateModality();
  }

  displaceModals(event: Event | null): void {
    let manager: ModalManager<V> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = ModalManager.global();
    }
    manager.displaceModals(event);
  }

  override initManager(): VM {
    return ModalManager.global() as VM;
  }
}

ViewService({
  extends: ModalService,
  type: ModalManager,
  observe: false,
  manager: ModalManager.global(),
})(View.prototype, "modalService");
