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

import {ViewFlags} from "@swim/view";
import {GraphicsViewContext, GraphicsViewObserver} from "@swim/graphics";
import {ThemedViewObserver} from "./ThemedViewObserver";
import {ThemedGraphicsView} from "./ThemedGraphicsView";

export interface ThemedGraphicsViewObserver<V extends ThemedGraphicsView = ThemedGraphicsView> extends GraphicsViewObserver<V>, ThemedViewObserver<V> {
  viewWillProcess?(viewContext: GraphicsViewContext, view: V): void;

  viewDidProcess?(viewContext: GraphicsViewContext, view: V): void;

  viewWillResize?(viewContext: GraphicsViewContext, view: V): void;

  viewDidResize?(viewContext: GraphicsViewContext, view: V): void;

  viewWillScroll?(viewContext: GraphicsViewContext, view: V): void;

  viewDidScroll?(viewContext: GraphicsViewContext, view: V): void;

  viewWillChange?(viewContext: GraphicsViewContext, view: V): void;

  viewDidChange?(viewContext: GraphicsViewContext, view: V): void;

  viewWillAnimate?(viewContext: GraphicsViewContext, view: V): void;

  viewDidAnimate?(viewContext: GraphicsViewContext, view: V): void;

  viewWillProcessChildViews?(processFlags: ViewFlags, viewContext: GraphicsViewContext, view: V): void;

  viewDidProcessChildViews?(processFlags: ViewFlags, viewContext: GraphicsViewContext, view: V): void;

  viewWillDisplay?(viewContext: GraphicsViewContext, view: V): void;

  viewDidDisplay?(viewContext: GraphicsViewContext, view: V): void;

  viewWillLayout?(viewContext: GraphicsViewContext, view: V): void;

  viewDidLayout?(viewContext: GraphicsViewContext, view: V): void;

  viewWillRender?(viewContext: GraphicsViewContext, view: V): void;

  viewDidRender?(viewContext: GraphicsViewContext, view: V): void;

  viewWillDisplayChildViews?(displayFlags: ViewFlags, viewContext: GraphicsViewContext, view: V): void;

  viewDidDisplayChildViews?(displayFlags: ViewFlags, viewContext: GraphicsViewContext, view: V): void;
}
