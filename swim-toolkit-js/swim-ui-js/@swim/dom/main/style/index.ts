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

export * from "./types";

export {
  StyleContextPrototype,
  StyleContext,
} from "./StyleContext";

export {
  StyleAnimatorMemberType,
  StyleAnimatorMemberInit,
  StyleAnimatorMemberKey,
  StyleAnimatorMemberMap,
  StyleAnimatorInit,
  StyleAnimatorDescriptor,
  StyleAnimatorDescriptorExtends,
  StyleAnimatorDescriptorFromAny,
  StyleAnimatorConstructor,
  StyleAnimatorClass,
  StyleAnimator,
} from "./StyleAnimator";

export {
  StyleAnimatorConstraintInit,
  StyleAnimatorConstraintDescriptor,
  StyleAnimatorConstraintDescriptorExtends,
  StyleAnimatorConstraintDescriptorFromAny,
  StyleAnimatorConstraintConstructor,
  StyleAnimatorConstraintClass,
  StyleAnimatorConstraint,
} from "./StyleAnimatorConstraint";

export {StringStyleAnimator} from "./StringStyleAnimator";

export {NumberStyleAnimator} from "./NumberStyleAnimator";

export {NumberStyleAnimatorConstraint} from "./NumberStyleAnimatorConstraint";

export {LengthStyleAnimator} from "./LengthStyleAnimator";

export {LengthStyleAnimatorConstraint} from "./LengthStyleAnimatorConstraint";

export {ColorStyleAnimator} from "./ColorStyleAnimator";

export {FontFamilyStyleAnimator} from "./FontFamilyStyleAnimator";

export {BoxShadowStyleAnimator} from "./BoxShadowStyleAnimator";

export {TransformStyleAnimator} from "./TransformStyleAnimator";

export {
  StyleMapInit,
  StyleMap,
} from "./StyleMap";
