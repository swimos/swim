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

import {View} from "../View";
import {ViewController} from "../ViewController";
import {AnimatedViewContext} from "./AnimatedViewContext";
import {AnimatedView} from "./AnimatedView";
import {AnimatedViewObserver} from "./AnimatedViewObserver";

export interface AnimatedViewController<V extends AnimatedView = AnimatedView> extends ViewController<V>, AnimatedViewObserver<V> {
  readonly view: V | null;

  setView(view: V | null): void;

  viewWillSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewDidSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewWillInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewDidInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewWillRemoveChildView(childView: View, view: V): void;

  viewDidRemoveChildView(childView: View, view: V): void;

  viewWillMount(view: V): void;

  viewDidMount(view: V): void;

  viewWillUnmount(view: V): void;

  viewDidUnmount(view: V): void;

  viewWillPower(view: V): void;

  viewDidPower(view: V): void;

  viewWillUnpower(view: V): void;

  viewDidUnpower(view: V): void;

  viewWillProcess(viewContext: AnimatedViewContext, view: V): void;

  viewDidProcess(viewContext: AnimatedViewContext, view: V): void;

  viewWillScroll(viewContext: AnimatedViewContext, view: V): void;

  viewDidScroll(viewContext: AnimatedViewContext, view: V): void;

  viewWillDerive(viewContext: AnimatedViewContext, view: V): void;

  viewDidDerive(viewContext: AnimatedViewContext, view: V): void;

  viewWillAnimate(viewContext: AnimatedViewContext, view: V): void;

  viewDidAnimate(viewContext: AnimatedViewContext, view: V): void;

  viewWillProcessChildViews(viewContext: AnimatedViewContext, view: V): void;

  viewDidProcessChildViews(viewContext: AnimatedViewContext, view: V): void;

  viewWillDisplay(viewContext: AnimatedViewContext, view: V): void;

  viewDidDisplay(viewContext: AnimatedViewContext, view: V): void;

  viewWillLayout(viewContext: AnimatedViewContext, view: V): void;

  viewDidLayout(viewContext: AnimatedViewContext, view: V): void;

  viewWillDisplayChildViews(viewContext: AnimatedViewContext, view: V): void;

  viewDidDisplayChildViews(viewContext: AnimatedViewContext, view: V): void;
}
