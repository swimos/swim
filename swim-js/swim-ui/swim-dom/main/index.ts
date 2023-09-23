// Copyright 2015-2023 Nstream, inc.
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

// Attribute

export {AttributeContext} from "./AttributeAnimator";
export type {AttributeAnimatorDescriptor} from "./AttributeAnimator";
export type {AttributeAnimatorClass} from "./AttributeAnimator";
export {AttributeAnimator} from "./AttributeAnimator";
export {StringAttributeAnimator} from "./AttributeAnimator";
export {NumberAttributeAnimator} from "./AttributeAnimator";
export {BooleanAttributeAnimator} from "./AttributeAnimator";
export {LengthAttributeAnimator} from "./AttributeAnimator";
export {ColorAttributeAnimator} from "./AttributeAnimator";
export {TransformAttributeAnimator} from "./AttributeAnimator";

// Style

export {StyleContext} from "./StyleAnimator";
export type {StyleAnimatorDescriptor} from "./StyleAnimator";
export type {StyleAnimatorClass} from "./StyleAnimator";
export {StyleAnimator} from "./StyleAnimator";
export {StringStyleAnimator} from "./StyleAnimator";
export {NumberStyleAnimator} from "./StyleAnimator";
export {LengthStyleAnimator} from "./StyleAnimator";
export {ColorStyleAnimator} from "./StyleAnimator";
export {FontFamilyStyleAnimator} from "./StyleAnimator";
export {BoxShadowStyleAnimator} from "./StyleAnimator";
export {TransformStyleAnimator} from "./StyleAnimator";

export type {StyleConstraintAnimatorDescriptor} from "./StyleConstraintAnimator";
export type {StyleConstraintAnimatorClass} from "./StyleConstraintAnimator";
export {StyleConstraintAnimator} from "./StyleConstraintAnimator";
export {NumberStyleConstraintAnimator} from "./StyleConstraintAnimator";
export {LengthStyleConstraintAnimator} from "./StyleConstraintAnimator";

export * from "./csstypes";

export type {StyleAttributeDescriptor} from "./StyleAttribute";
export type {StyleAttributeClass} from "./StyleAttribute";
export {StyleAttribute} from "./StyleAttribute";

export type {CssScopeDescriptor} from "./CssScope";
export type {CssScopeClass} from "./CssScope";
export {CssScope} from "./CssScope";

export type {StyleSheetDescriptor} from "./StyleSheet";
export type {StyleSheetClass} from "./StyleSheet";
export {StyleSheet} from "./StyleSheet";

export type {CssRuleDescriptor} from "./CssRule";
export type {CssRuleClass} from "./CssRule";
export {CssRule} from "./CssRule";

export type {StyleRuleDescriptor} from "./StyleRule";
export type {StyleRuleClass} from "./StyleRule";
export {StyleRule} from "./StyleRule";

export type {MediaRuleDescriptor} from "./MediaRule";
export type {MediaRuleClass} from "./MediaRule";
export {MediaRule} from "./MediaRule";

export {ClassList} from "./ClassList";

// Node

export {TextContext} from "./TextAnimator";
export type {TextAnimatorDescriptor} from "./TextAnimator";
export type {TextAnimatorClass} from "./TextAnimator";
export {TextAnimator} from "./TextAnimator";

export type {NodeViewFactory} from "./NodeView";
export type {NodeViewClass} from "./NodeView";
export type {NodeViewConstructor} from "./NodeView";
export type {NodeViewObserver} from "./NodeView";
export {NodeView} from "./NodeView";

// Text

export type {TextViewConstructor} from "./TextView";
export type {TextViewObserver} from "./TextView";
export {TextView} from "./TextView";

// Element

export {ElementAttributes} from "./ElementView";
export type {ElementViewFactory} from "./ElementView";
export type {ElementViewClass} from "./ElementView";
export type {ElementViewConstructor} from "./ElementView";
export type {ElementViewObserver} from "./ElementView";
export {ElementView} from "./ElementView";

// HTML

export {HtmlAttributes} from "./HtmlView";
export type {HtmlViewTagMap} from "./HtmlView";
export type {HtmlViewFactory} from "./HtmlView";
export type {HtmlViewClass} from "./HtmlView";
export type {HtmlViewConstructor} from "./HtmlView";
export type {HtmlViewObserver} from "./HtmlView";
export {HtmlView} from "./HtmlView";
export {HtmlViewTagFactory} from "./HtmlView";

export type {StyleViewObserver} from "./StyleView";
export {StyleView} from "./StyleView";

// SVG

export {SvgAttributes} from "./SvgView";
export type {SvgViewTagMap} from "./SvgView";
export type {SvgViewFactory} from "./SvgView";
export type {SvgViewClass} from "./SvgView";
export type {SvgViewConstructor} from "./SvgView";
export type {SvgViewObserver} from "./SvgView";
export {SvgView} from "./SvgView";
export {SvgViewTagFactory} from "./SvgView";

// DOM

export type {DomServiceObserver} from "./DomService";
export {DomService} from "./DomService";

// Modal

export type {ModalOptions} from "./ModalView";
export type {ModalViewObserver} from "./ModalView";
export {ModalView} from "./ModalView";

export type {ModalServiceObserver} from "./ModalService";
export {ModalService} from "./ModalService";
