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

import {FontFamily, Font} from "@swim/font";
import {StyleContext} from "../sheet/StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class FontFamilyStyleAnimator<V extends StyleContext> extends StyleAnimator<V, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> {
  parse(value: string): FontFamily | FontFamily[] | undefined {
    return Font.parse(value).family();
  }

  fromAny(value: FontFamily | ReadonlyArray<FontFamily>): FontFamily | FontFamily[] | undefined {
    return Font.family(value).family();
  }
}
StyleAnimator.FontFamily = FontFamilyStyleAnimator;
