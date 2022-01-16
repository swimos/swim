// Copyright 2015-2021 Swim.inc
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

import type {ServiceObserver} from "@swim/component";
import type {StorageService} from "./StorageService";
import type {Controller} from "../controller/Controller";

/** @public */
export interface StorageServiceObserver<C extends Controller = Controller, S extends StorageService<C> = StorageService<C>> extends ServiceObserver<C, S> {
  serviceWillStore?(key: string, newValue: string | undefined, oldValue: string | undefined, service: S): void;

  serviceDidStore?(key: string, newValue: string | undefined, oldValue: string | undefined, service: S): void;

  serviceWillClear?(service: S): void;

  serviceDidClear?(service: S): void;
}