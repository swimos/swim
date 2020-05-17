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
import {RenderedViewController} from "../rendered/RenderedViewController";
import {CompositedViewContext} from "./CompositedViewContext";
import {CompositedView} from "./CompositedView";
import {CompositedViewObserver} from "./CompositedViewObserver";

export interface CompositedViewController<V extends CompositedView = CompositedView> extends RenderedViewController<V>, CompositedViewObserver<V> {
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

  viewWillProcess(viewContext: CompositedViewContext, view: V): void;

  viewDidProcess(viewContext: CompositedViewContext, view: V): void;

  viewWillScroll(viewContext: CompositedViewContext, view: V): void;

  viewDidScroll(viewContext: CompositedViewContext, view: V): void;

  viewWillDerive(viewContext: CompositedViewContext, view: V): void;

  viewDidDerive(viewContext: CompositedViewContext, view: V): void;

  viewWillAnimate(viewContext: CompositedViewContext, view: V): void;

  viewDidAnimate(viewContext: CompositedViewContext, view: V): void;

  viewWillProcessChildViews(viewContext: CompositedViewContext, view: V): void;

  viewDidProcessChildViews(viewContext: CompositedViewContext, view: V): void;

  viewWillDisplay(viewContext: CompositedViewContext, view: V): void;

  viewDidDisplay(viewContext: CompositedViewContext, view: V): void;

  viewWillLayout(viewContext: CompositedViewContext, view: V): void;

  viewDidLayout(viewContext: CompositedViewContext, view: V): void;

  viewWillRender(viewContext: CompositedViewContext, view: V): void;

  viewDidRender(viewContext: CompositedViewContext, view: V): void;

  viewWillComposite(viewContext: CompositedViewContext, view: V): void;

  viewDidComposite(viewContext: CompositedViewContext, view: V): void;

  viewWillDisplayChildViews(viewContext: CompositedViewContext, view: V): void;

  viewDidDisplayChildViews(viewContext: CompositedViewContext, view: V): void;

  viewWillSetHidden(hidden: boolean, view: V): void;

  viewDidSetHidden(hidden: boolean, view: V): void;

  viewWillSetCulled(culled: boolean, view: V): void;

  viewDidSetCulled(culled: boolean, view: V): void;
}
