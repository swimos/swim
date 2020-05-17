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

import {ViewContext} from "../ViewContext";
import {View} from "../View";
import {ViewController} from "../ViewController";
import {ModalOptions, Modal} from "../modal/Modal";
import {RootView} from "./RootView";
import {RootViewObserver} from "./RootViewObserver";

export interface RootViewController<V extends RootView = RootView> extends ViewController<V>, RootViewObserver<V> {
  readonly view: V | null;

  setView(view: V | null): void;

  viewWillSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewDidSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewWillInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewDidInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewWillRemoveChildView(childView: View, view: V): void;

  viewDidRemoveChildView(childView: View, view: V): void;

  viewWillPresentModal(modal: Modal, options: ModalOptions, view: V): void;

  viewDidPresentModal(modal: Modal, options: ModalOptions, view: V): void;

  viewWillDismissModal(modal: Modal, view: V): void;

  viewDidDismissModal(modal: Modal, view: V): void;

  viewWillMount(view: V): void;

  viewDidMount(view: V): void;

  viewWillUnmount(view: V): void;

  viewDidUnmount(view: V): void;

  viewWillPower(view: V): void;

  viewDidPower(view: V): void;

  viewWillUnpower(view: V): void;

  viewDidUnpower(view: V): void;

  viewWillProcess(viewContext: ViewContext, view: V): void;

  viewDidProcess(viewContext: ViewContext, view: V): void;

  viewWillScroll(viewContext: ViewContext, view: V): void;

  viewDidScroll(viewContext: ViewContext, view: V): void;

  viewWillDerive(viewContext: ViewContext, view: V): void;

  viewDidDerive(viewContext: ViewContext, view: V): void;

  viewWillAnimate(viewContext: ViewContext, view: V): void;

  viewDidAnimate(viewContext: ViewContext, view: V): void;

  viewWillProcessChildViews(viewContext: ViewContext, view: V): void;

  viewDidProcessChildViews(viewContext: ViewContext, view: V): void;

  viewWillDisplay(viewContext: ViewContext, view: V): void;

  viewDidDisplay(viewContext: ViewContext, view: V): void;

  viewWillLayout(viewContext: ViewContext, view: V): void;

  viewDidLayout(viewContext: ViewContext, view: V): void;

  viewWillDisplayChildViews(viewContext: ViewContext, view: V): void;

  viewDidDisplayChildViews(viewContext: ViewContext, view: V): void;
}
