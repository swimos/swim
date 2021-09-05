// Copyright 2015-2021 Swim Inc.
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

export {
  ViewContextType,
  ViewContext,
} from "./ViewContext";
export {
  ViewMemberType,
  ViewMemberInit,
  ViewMemberKey,
  ViewMemberMap,
  ViewFlags,
  ViewPrecedence,
  ViewInit,
  ViewFactory,
  ViewPrototype,
  ViewConstructor,
  ViewClass,
  View,
} from "./View";
export {
  ViewObserverType,
  ViewObserver,
  ViewObserverCache,
  ViewWillResize,
  ViewDidResize,
  ViewWillScroll,
  ViewDidScroll,
  ViewWillChange,
  ViewDidChange,
  ViewWillAnimate,
  ViewDidAnimate,
  ViewWillProject,
  ViewDidProject,
  ViewWillLayout,
  ViewDidLayout,
  ViewWillRender,
  ViewDidRender,
  ViewWillRasterize,
  ViewDidRasterize,
  ViewWillComposite,
  ViewDidComposite,
} from "./ViewObserver";

export * from "./manager";

export * from "./viewport";

export * from "./display";

export * from "./layout";

export * from "./theme";

export * from "./modal";

export * from "./service";

export * from "./property";

export * from "./animation";

export * from "./animator";

export * from "./fastener";

export * from "./event";

export * from "./gesture";

declare global {
  interface VisualViewportEventMap {
    "resize": Event;
    "scroll": Event;
  }

  interface VisualViewport extends EventTarget {
    readonly width: number;
    readonly height: number;
    readonly offsetLeft: number;
    readonly offsetTop: number;
    readonly pageLeft: number;
    readonly pageTop: number;
    readonly scale: number;
    onresize: ((this: VisualViewport, event: Event) => any) | null;
    onscroll: ((this: VisualViewport, event: Event) => any) | null;
    addEventListener<K extends keyof VisualViewportEventMap>(type: K, listener: (this: VisualViewport, event: VisualViewportEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof VisualViewportEventMap>(type: K, listener: (this: VisualViewport, event: VisualViewportEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface Window {
    readonly visualViewport: VisualViewport;
  }
}
