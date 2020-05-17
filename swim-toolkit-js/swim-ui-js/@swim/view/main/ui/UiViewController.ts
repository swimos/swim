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

import {ModalOptions, Modal} from "../modal/Modal";
import {RootViewController} from "../root/RootViewController";
import {HtmlViewController} from "../html/HtmlViewController";
import {UiViewContext} from "./UiViewContext";
import {UiView} from "./UiView";
import {UiViewObserver} from "./UiViewObserver";

export class UiViewController<V extends UiView = UiView> extends HtmlViewController<V> implements RootViewController<V>, UiViewObserver<V> {
  viewWillResize(viewContext: UiViewContext, view: V): void {
    // hook
  }

  viewDidResize(viewContext: UiViewContext, view: V): void {
    // hook
  }

  get modals(): ReadonlyArray<Modal> {
    const view = this._view;
    return view !== null ? view.modals : [];
  }

  viewWillPresentModal(modal: Modal, options: ModalOptions, view: V): void {
    // hook
  }

  viewDidPresentModal(modal: Modal, options: ModalOptions, view: V): void {
    // hook
  }

  viewWillDismissModal(modal: Modal, view: V): void {
    // hook
  }

  viewDidDismissModal(modal: Modal, view: V): void {
    // hook
  }
}
