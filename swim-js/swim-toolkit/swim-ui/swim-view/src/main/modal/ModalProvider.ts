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

import {ProviderClass, Provider} from "@swim/component";
import type {ModalOptions, Modal} from "./Modal";
import {ModalService} from "./ModalService";
import type {View} from "../view/View";

/** @public */
export interface ModalProvider<V extends View, S extends ModalService<V> | null | undefined = ModalService<V>> extends Provider<V, S> {
  presentModal(modal: Modal, options?: ModalOptions): void;

  dismissModal(modal: Modal): void;

  dismissModals(): void;

  toggleModal(modal: Modal, options?: ModalOptions): void;

  updateModality(): void;

  displaceModals(event: Event | null): void;

  createService(): S;
}

/** @public */
export const ModalProvider = (function (_super: typeof Provider) {
  const ModalProvider = _super.extend("ModalProvider") as ProviderClass<ModalProvider<any, any>>;

  ModalProvider.prototype.presentModal = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>, modal: Modal, options?: ModalOptions): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.presentModal(modal, options);
  };

  ModalProvider.prototype.dismissModal = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>, modal: Modal): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.dismissModal(modal);
  };

  ModalProvider.prototype.dismissModals = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.dismissModals();
  };

  ModalProvider.prototype.toggleModal = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>, modal: Modal, options?: ModalOptions): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.toggleModal(modal, options);
  };

  ModalProvider.prototype.updateModality = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>, ): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.updateModality();
  };

  ModalProvider.prototype.displaceModals = function <V extends View, S extends ModalService<V>>(this: ModalProvider<V, S>, event: Event | null): void {
    let service: ModalService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ModalService.global();
    }
    service.displaceModals(event);
  };

  ModalProvider.prototype.createService = function <V extends View, S extends ModalService<V> | null | undefined>(this: ModalProvider<V, S>): S {
    return ModalService.global() as S;
  };

  return ModalProvider;
})(Provider);
