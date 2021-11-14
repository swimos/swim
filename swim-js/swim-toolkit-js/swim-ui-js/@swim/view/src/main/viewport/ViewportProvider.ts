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

import {ProviderClass, Provider} from "@swim/fastener";
import type {ViewportIdiom} from "./ViewportIdiom";
import type {Viewport} from "./Viewport";
import {ViewportService} from "./ViewportService";
import type {ViewContext} from "../view/ViewContext";
import type {View} from "../view/View";

/** @public */
export interface ViewportProvider<V extends View, S extends ViewportService<V> | null | undefined = ViewportService<V>> extends Provider<V, S> {
  get viewContext(): ViewContext;

  get viewport(): Viewport;

  get viewportIdiom(): ViewportIdiom;

  setViewportIdiom(viewportIdiom: ViewportIdiom): void;

  createService(): S;
}

/** @public */
export const ViewportProvider = (function (_super: typeof Provider) {
  const ViewportProvider = _super.extend("ViewportProvider") as ProviderClass<ViewportProvider<any, any>>;

  Object.defineProperty(ViewportProvider.prototype, "viewContext", {
    get<V extends View, S extends ViewportService<V> | null | undefined>(this: ViewportProvider<V, S>): ViewContext {
      let service: ViewportService<V> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ViewportService.global();
      }
      return service.viewContext;
    },
    configurable: true,
  });

  Object.defineProperty(ViewportProvider.prototype, "viewport", {
    get<V extends View, S extends ViewportService<V> | null | undefined>(this: ViewportProvider<V, S>): Viewport {
      let service: ViewportService<V> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ViewportService.global();
      }
      return service.viewport;
    },
    configurable: true,
  });

  Object.defineProperty(ViewportProvider.prototype, "viewportIdiom", {
    get<V extends View, S extends ViewportService<V> | null | undefined>(this: ViewportProvider<V, S>): ViewportIdiom {
      let service: ViewportService<V> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ViewportService.global();
      }
      return service.viewportIdiom;
    },
    configurable: true,
  });

  ViewportProvider.prototype.setViewportIdiom = function <V extends View, S extends ViewportService<V> | null | undefined>(this: ViewportProvider<V, S>, viewportIdiom: ViewportIdiom): void {
    let service: ViewportService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ViewportService.global();
    }
    service.setViewportIdiom(viewportIdiom);
  }

  ViewportProvider.prototype.createService = function <V extends View, S extends ViewportService<V> | null | undefined>(this: ViewportProvider<V, S>): S {
    return ViewportService.global() as S;
  }

  return ViewportProvider;
})(Provider);
