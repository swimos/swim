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

import {View, ViewManagerObserver} from "@swim/view";
import {ModalOptions, Modal} from "../Modal";
import {ModalManager} from "./ModalManager";

export interface ModalManagerObserver<V extends View = View, VM extends ModalManager<V> = ModalManager<V>> extends ViewManagerObserver<V, VM> {
  modalManagerWillPresentModal?(modal: Modal, options: ModalOptions, modalManager: VM): void;

  modalManagerDidPresentModal?(modal: Modal, options: ModalOptions, modalManager: VM): void;

  modalManagerWillDismissModal?(modal: Modal, modalManager: VM): void;

  modalManagerDidDismissModal?(modal: Modal, modalManager: VM): void;

  modalManagerWillUpdateModality?(newModality: number, oldModality: number, modalManager: VM): void;

  modalManagerDidUpdateModality?(newModality: number, oldModality: number, modalManager: VM): void;

  modalManagerWillDisplaceModals?(event: Event | null, modalManager: VM): void | boolean;

  modalManagerDidDisplaceModals?(event: Event | null, modalManager: VM): void;
}
