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

import {ViewObserver} from "../ViewObserver";
import {ModalOptions, Modal} from "../modal/Modal";
import {RootView} from "./RootView";

export interface RootViewObserver<V extends RootView = RootView> extends ViewObserver<V> {
  viewWillPresentModal?(modal: Modal, options: ModalOptions, view: V): void;

  viewDidPresentModal?(modal: Modal, options: ModalOptions, view: V): void;

  viewWillDismissModal?(modal: Modal, view: V): void;

  viewDidDismissModal?(modal: Modal, view: V): void;
}
