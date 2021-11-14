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

import type {Observable} from "./Observable";

/** @public */
export type ObserverMethods<O> =
  {[K in keyof O as O[K] extends ((...args: any) => any) | undefined ? K : never]: O[K]};

/** @public */
export type ObserverMethod<O, K extends keyof ObserverMethods<O>> =
  ObserverMethods<O>[K] extends ((...args: any) => any) | undefined ? ObserverMethods<O>[K] : never;

/** @public */
export type ObserverParameters<O, K extends keyof ObserverMethods<O>> =
  ObserverMethods<O>[K] extends ((...args: infer P) => any) | undefined ? P : never;

/** @public */
export type ObserverReturnType<O, K extends keyof ObserverMethods<O>> =
  ObserverMethods<O>[K] extends ((...args: any) => infer R) | undefined ? R : never;

/** @public */
export interface Observer<O extends Observable = Observable> {
}
