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

import type {ViewportColorScheme} from "./ViewportColorScheme";
import type {ViewportInsets} from "./ViewportInsets";
import type {ViewportArea} from "./ViewportArea";

/** @public */
export interface Viewport {
  readonly width: number;
  readonly height: number;
  readonly visual: ViewportArea;
  readonly safeArea: ViewportInsets;
  readonly orientation: OrientationType;
  readonly colorScheme: ViewportColorScheme;
}

/** @public */
export const Viewport = (function () {
  const Viewport = {} as {
    detect(): Viewport;
  };

  Viewport.detect = function (): Viewport {
    let insetTop = 0;
    let insetRight = 0;
    let insetBottom = 0;
    let insetLeft = 0;
    const documentWidth = document.documentElement.style.width;
    const documentHeight = document.documentElement.style.height;
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    const div = document.createElement("div");
    div.style.setProperty("position", "fixed");
    div.style.setProperty("top", "0");
    div.style.setProperty("right", "0");
    div.style.setProperty("width", window.innerWidth === document.documentElement.offsetWidth ? "100%" : "100vw");
    div.style.setProperty("height", window.innerHeight === document.documentElement.offsetHeight ? "100%" : "100vh");
    div.style.setProperty("box-sizing", "border-box");
    div.style.setProperty("padding-top", "env(safe-area-inset-top)");
    div.style.setProperty("padding-right", "env(safe-area-inset-right)");
    div.style.setProperty("padding-bottom", "env(safe-area-inset-bottom)");
    div.style.setProperty("padding-left", "env(safe-area-inset-left)");
    div.style.setProperty("overflow", "hidden");
    div.style.setProperty("visibility", "hidden");
    document.body.appendChild(div);
    const style = window.getComputedStyle(div);
    const width = parseFloat(style.getPropertyValue("width"));
    const height = parseFloat(style.getPropertyValue("height"));
    let visualWidth = width;
    let visualHeight = height;
    let visualOffsetLeft = 0;
    let visualOffsetTop = 0;
    let visualPageLeft = 0;
    let visualPageTop = 0;
    let visualScale = 1;
    if (window.visualViewport !== void 0) {
      visualWidth = window.visualViewport.width;
      visualHeight = window.visualViewport.height;
      visualOffsetLeft = window.visualViewport.offsetLeft;
      visualOffsetTop = window.visualViewport.offsetTop;
      visualPageLeft = window.visualViewport.pageLeft;
      visualPageTop = window.visualViewport.pageTop;
      visualScale = window.visualViewport.scale;
    }
    const visual: ViewportArea = {
      width: visualWidth,
      height: visualHeight,
      offsetLeft: visualOffsetLeft,
      offsetTop: visualOffsetTop,
      pageLeft: visualPageLeft,
      pageTop: visualPageTop,
      scale: visualScale,
    };
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function"
        && CSS.supports("padding-top: env(safe-area-inset-top)")) {
      insetTop = parseFloat(style.getPropertyValue("padding-top"));
      insetRight = parseFloat(style.getPropertyValue("padding-right"));
      insetBottom = parseFloat(style.getPropertyValue("padding-bottom"));
      insetLeft = parseFloat(style.getPropertyValue("padding-left"));
    }
    document.body.removeChild(div);
    document.documentElement.style.width = documentWidth;
    document.documentElement.style.height = documentHeight;
    const safeArea: ViewportInsets = {insetTop, insetRight, insetBottom, insetLeft};
    let orientation: OrientationType | undefined =
        (screen as any).msOrientation ||
        (screen as any).mozOrientation ||
        (screen.orientation || {}).type;
    if (orientation === void 0) {
      switch (window.orientation) {
        case 0: orientation = "portrait-primary"; break;
        case 180: orientation = "portrait-secondary"; break;
        case -90: orientation = "landscape-primary"; break;
        case 90: orientation = "landscape-secondary"; break;
        default: orientation = "landscape-primary";
      }
    }
    let colorScheme: ViewportColorScheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      colorScheme = "dark";
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      colorScheme = "light";
    } else {
      colorScheme = "no-preference";
    }
    return {width, height, visual, safeArea, orientation, colorScheme};
  };

  return Viewport;
})();
