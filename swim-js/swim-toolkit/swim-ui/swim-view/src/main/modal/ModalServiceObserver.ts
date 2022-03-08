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

import type {ServiceObserver} from "@swim/component";
import type {ModalOptions, Modal} from "./Modal";
import type {ModalService} from "./ModalService";
import type {View} from "../view/View";

/** @public */
export interface ModalServiceObserver<V extends View = View, S extends ModalService<V> = ModalService<V>> extends ServiceObserver<V, S> {
  serviceWillPresentModal?(modal: Modal, options: ModalOptions, service: S): void;

  serviceDidPresentModal?(modal: Modal, options: ModalOptions, service: S): void;

  serviceWillDismissModal?(modal: Modal, service: S): void;

  serviceDidDismissModal?(modal: Modal, service: S): void;

  serviceWillUpdateModality?(newModality: number, oldModality: number, service: S): void;

  serviceDidUpdateModality?(newModality: number, oldModality: number, service: S): void;

  serviceWillDisplaceModals?(event: Event | null, service: S): void | boolean;

  serviceDidDisplaceModals?(event: Event | null, service: S): void;
}
