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

/** @beta */
export type Methods<O> =
  {[K in keyof O as O[K] extends (...args: any) => any ? K : never]: O[K]};

/** @beta */
export type MethodParameters<O, K extends keyof Methods<O>> =
  Methods<O>[K] extends (...args: infer P) => any ? P : never;

/** @beta */
export type MethodReturnType<O, K extends keyof Methods<O>> =
  Methods<O>[K] extends (...args: any) => infer R ? R : never;
