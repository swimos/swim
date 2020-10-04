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

import {Transition} from "@swim/transition";
import {ViewContext, ViewFlags, View, ViewController} from "@swim/view";
import {MoodVector} from "../mood/MoodVector";
import {ThemeMatrix} from "../theme/ThemeMatrix";
import {ThemedView} from "./ThemedView";
import {ThemedViewObserver} from "./ThemedViewObserver";

export interface ThemedViewController<V extends ThemedView = ThemedView> extends ViewController<V>, ThemedViewObserver<V> {
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

  viewWillCull(view: V): void;

  viewDidCull(view: V): void;

  viewWillUncull(view: V): void;

  viewDidUncull(view: V): void;

  viewWillApplyTheme(theme: ThemeMatrix, mood: MoodVector, transition: Transition<any> | null, view: V): void;

  viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, transition: Transition<any> | null, view: V): void;

  viewWillProcess(viewContext: ViewContext, view: V): void;

  viewDidProcess(viewContext: ViewContext, view: V): void;

  viewWillResize(viewContext: ViewContext, view: V): void;

  viewDidResize(viewContext: ViewContext, view: V): void;

  viewWillScroll(viewContext: ViewContext, view: V): void;

  viewDidScroll(viewContext: ViewContext, view: V): void;

  viewWillChange(viewContext: ViewContext, view: V): void;

  viewDidChange(viewContext: ViewContext, view: V): void;

  viewWillAnimate(viewContext: ViewContext, view: V): void;

  viewDidAnimate(viewContext: ViewContext, view: V): void;

  viewWillLayout(viewContext: ViewContext, view: V): void;

  viewDidLayout(viewContext: ViewContext, view: V): void;

  viewWillProcessChildViews(processFlags: ViewFlags, viewContext: ViewContext, view: V): void;

  viewDidProcessChildViews(processFlags: ViewFlags, viewContext: ViewContext, view: V): void;

  viewWillDisplay(viewContext: ViewContext, view: V): void;

  viewDidDisplay(viewContext: ViewContext, view: V): void;

  viewWillDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContext, view: V): void;

  viewDidDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContext, view: V): void;
}
