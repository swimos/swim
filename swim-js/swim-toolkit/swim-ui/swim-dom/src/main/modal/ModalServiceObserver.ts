// Copyright 2015-2023 Swim.inc
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
import type {ModalView} from "./ModalView";
import type {ModalService} from "./ModalService";

/** @public */
export interface ModalServiceObserver<S extends ModalService = ModalService> extends ServiceObserver<S> {
  serviceWillAttachModal?(modalView: ModalView, service: S): void;

  serviceDidAttachModal?(modalView: ModalView, service: S): void;

  serviceWillDetachModal?(modalView: ModalView, service: S): void;

  serviceDidDetachModal?(modalView: ModalView, service: S): void;

  serviceWillPresentModal?(modalView: ModalView, service: S): void;

  serviceDidPresentModal?(modalView: ModalView, service: S): void;

  serviceWillDismissModal?(modalView: ModalView, service: S): void;

  serviceDidDismissModal?(modalView: ModalView, service: S): void;

  serviceDidSetModality?(newModality: number, oldModality: number, service: S): void;
}
