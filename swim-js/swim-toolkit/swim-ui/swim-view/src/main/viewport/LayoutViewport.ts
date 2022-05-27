// Copyright 2015-2022 Swim.inc
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

/** @public */
export interface LayoutViewport {
  readonly width: number;
  readonly height: number;
  readonly pageLeft: number;
  readonly pageTop: number;
}

/** @public */
export const LayoutViewport = (function () {
  const LayoutViewport = {} as {
    equal(x: LayoutViewport | null | undefined, y: LayoutViewport | null | undefined): boolean;
  };

  LayoutViewport.equal = function (x: LayoutViewport | null | undefined, y: LayoutViewport | null | undefined): boolean {
    if (x === y) {
      return true;
    } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
      return x.width === y.width
          && x.height === y.height
          && x.pageLeft === y.pageLeft
          && x.pageTop === y.pageTop;
    }
    return false;
  };

  return LayoutViewport;
})();
