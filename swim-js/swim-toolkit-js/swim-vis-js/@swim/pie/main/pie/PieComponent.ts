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

import {AnyTiming, Timing} from "@swim/mapping";
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import {
  Component,
  ComponentProperty,
  ComponentView,
  ComponentViewTrait,
  ComponentFastener,
  CompositeComponent,
} from "@swim/component";
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import {SliceComponent} from "../slice/SliceComponent";
import {PieView} from "./PieView";
import {PieTitle, PieTrait} from "./PieTrait";
import type {PieComponentObserver} from "./PieComponentObserver";

export class PieComponent extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "sliceFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<PieComponentObserver>;

  protected initPieTrait(pieTrait: PieTrait): void {
    // hook
  }

  protected attachPieTrait(pieTrait: PieTrait): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      this.setTitleView(pieTrait.title.state, pieTrait);
    }

    const sliceFasteners = pieTrait.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        this.insertSliceTrait(sliceTrait);
      }
    }
  }

  protected detachPieTrait(pieTrait: PieTrait): void {
    const sliceFasteners = pieTrait.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        this.removeSliceTrait(sliceTrait);
      }
    }

    const pieView = this.pie.view;
    if (pieView !== null) {
      this.setTitleView(null, pieTrait);
    }
  }

  protected willSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPieTrait !== void 0) {
        componentObserver.componentWillSetPieTrait(newPieTrait, oldPieTrait, this);
      }
    }
  }

  protected onSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    if (oldPieTrait !== null) {
      this.detachPieTrait(oldPieTrait);
    }
    if (newPieTrait !== null) {
      this.attachPieTrait(newPieTrait);
      this.initPieTrait(newPieTrait);
    }
  }

  protected didSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPieTrait !== void 0) {
        componentObserver.componentDidSetPieTrait(newPieTrait, oldPieTrait, this);
      }
    }
  }

  protected createPieView(): PieView | null {
    return PieView.create();
  }

  protected initPieView(pieView: PieView): void {
    // hook
  }

  protected attachPieView(pieView: PieView): void {
    this.title.setView(pieView.title.view);

    const pieTrait = this.pie.trait;
    if (pieTrait !== null) {
      this.setTitleView(pieTrait.title.state, pieTrait);
    }

    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceComponent = sliceFasteners[i]!.component;
      if (sliceComponent !== null) {
        const sliceView = sliceComponent.slice.view;
        if (sliceView !== null && sliceView.parentView === null) {
          sliceComponent.slice.injectView(pieView);
        }
      }
    }
  }

  protected detachPieView(pieView: PieView): void {
    this.title.setView(null);
  }

  protected willSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPieView !== void 0) {
        componentObserver.componentWillSetPieView(newPieView, oldPieView, this);
      }
    }
  }

  protected onSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    if (oldPieView !== null) {
      this.detachPieView(oldPieView);
    }
    if (newPieView !== null) {
      this.attachPieView(newPieView);
      this.initPieView(newPieView);
    }
  }

  protected didSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPieView !== void 0) {
        componentObserver.componentDidSetPieView(newPieView, oldPieView, this);
      }
    }
  }

  protected themePieView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, pieView: PieView): void {
    // hook
  }

  protected createTitleView(title: PieTitle, pieTrait: PieTrait): GraphicsView | string | null {
    if (typeof title === "function") {
      return title(pieTrait);
    } else {
      return title;
    }
  }

  protected setTitleView(title: PieTitle | null, pieTrait: PieTrait): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      const titleView = title !== null ? this.createTitleView(title, pieTrait) : null;
      pieView.title.setView(titleView);
    }
  }

  protected initTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected attachTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected detachTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected willSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPieTitleView !== void 0) {
        componentObserver.componentWillSetPieTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  protected onSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    if (oldTitleView !== null) {
      this.detachTitleView(oldTitleView);
    }
    if (newTitleView !== null) {
      this.attachTitleView(newTitleView);
      this.initTitleView(newTitleView);
    }
  }

  protected didSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPieTitleView !== void 0) {
        componentObserver.componentDidSetPieTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  /** @hidden */
  static PieFastener = ComponentViewTrait.define<PieComponent, PieView, PieTrait>({
    viewType: PieView,
    observeView: true,
    willSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.willSetPieView(newPieView, oldPieView);
    },
    onSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.onSetPieView(newPieView, oldPieView);
    },
    didSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.didSetPieView(newPieView, oldPieView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, pieView: PieView): void {
      this.owner.themePieView(theme, mood, timing, pieView);
    },
    viewDidSetPieTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.title.setView(newTitleView);
    },
    createView(): PieView | null {
      return this.owner.createPieView();
    },
    traitType: PieTrait,
    observeTrait: true,
    willSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.willSetPieTrait(newPieTrait, oldPieTrait);
    },
    onSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.onSetPieTrait(newPieTrait, oldPieTrait);
    },
    didSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.didSetPieTrait(newPieTrait, oldPieTrait);
    },
    traitDidSetPieTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null, pieTrait: PieTrait): void {
      this.owner.setTitleView(newTitle, pieTrait);
    },
    traitWillSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait): void {
      if (oldSliceTrait !== null) {
        this.owner.removeSliceTrait(oldSliceTrait);
      }
    },
    traitDidSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait): void {
      if (newSliceTrait !== null) {
        this.owner.insertSliceTrait(newSliceTrait, targetTrait);
      }
    },
  });

  @ComponentViewTrait<PieComponent, PieView, PieTrait>({
    extends: PieComponent.PieFastener,
  })
  readonly pie!: ComponentViewTrait<this, PieView, PieTrait>;

  @ComponentView<PieComponent, GraphicsView>({
    key: true,
    willSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.willSetTitleView(newTitleView, oldTitleView);
    },
    onSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.onSetTitleView(newTitleView, oldTitleView);
    },
    didSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.didSetTitleView(newTitleView, oldTitleView);
    },
  })
  readonly title!: ComponentView<this, GraphicsView>;

  insertSlice(sliceComponent: SliceComponent, targetComponent: Component | null = null): void {
    const sliceFasteners = this.sliceFasteners as ComponentFastener<this, SliceComponent>[];
    let targetIndex = sliceFasteners.length;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.component === sliceComponent) {
        return;
      } else if (sliceFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const sliceFastener = this.createSliceFastener(sliceComponent);
    sliceFasteners.splice(targetIndex, 0, sliceFastener);
    sliceFastener.setComponent(sliceComponent, targetComponent);
    if (this.isMounted()) {
      sliceFastener.mount();
    }
  }

  removeSlice(sliceComponent: SliceComponent): void {
    const sliceFasteners = this.sliceFasteners as ComponentFastener<this, SliceComponent>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.component === sliceComponent) {
        sliceFastener.setComponent(null);
        if (this.isMounted()) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createSlice(sliceTrait: SliceTrait): SliceComponent | null {
    return new SliceComponent();
  }

  protected initSlice(sliceComponent: SliceComponent, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const sliceTrait = sliceComponent.slice.trait;
    if (sliceTrait !== null) {
      this.initSliceTrait(sliceTrait, sliceFastener);
    }
    const sliceView = sliceComponent.slice.view;
    if (sliceView !== null) {
      this.initSliceView(sliceView, sliceFastener);
    }
  }

  protected attachSlice(sliceComponent: SliceComponent, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const sliceTrait = sliceComponent.slice.trait;
    if (sliceTrait !== null) {
      this.attachSliceTrait(sliceTrait, sliceFastener);
    }
    const sliceView = sliceComponent.slice.view;
    if (sliceView !== null) {
      this.attachSliceView(sliceView, sliceFastener);
    }
  }

  protected detachSlice(sliceComponent: SliceComponent, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const sliceView = sliceComponent.slice.view;
    if (sliceView !== null) {
      this.detachSliceView(sliceView, sliceFastener);
    }
    const sliceTrait = sliceComponent.slice.trait;
    if (sliceTrait !== null) {
      this.detachSliceTrait(sliceTrait, sliceFastener);
    }
  }

  protected willSetSlice(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null,
                         sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSlice !== void 0) {
        componentObserver.componentWillSetSlice(newSliceComponent, oldSliceComponent, sliceFastener);
      }
    }
  }

  protected onSetSlice(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null,
                       sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (oldSliceComponent !== null) {
      this.detachSlice(oldSliceComponent, sliceFastener);
    }
    if (newSliceComponent !== null) {
      this.attachSlice(newSliceComponent, sliceFastener);
      this.initSlice(newSliceComponent, sliceFastener);
    }
  }

  protected didSetSlice(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null,
                        sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSlice !== void 0) {
        componentObserver.componentDidSetSlice(newSliceComponent, oldSliceComponent, sliceFastener);
      }
    }
  }

  insertSliceTrait(sliceTrait: SliceTrait, targetTrait: Trait | null = null): void {
    const sliceFasteners = this.sliceFasteners as ComponentFastener<this, SliceComponent>[];
    let targetComponent: SliceComponent | null = null;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceComponent = sliceFasteners[i]!.component;
      if (sliceComponent !== null) {
        if (sliceComponent.slice.trait === sliceTrait) {
          return;
        } else if (sliceComponent.slice.trait === targetTrait) {
          targetComponent = sliceComponent;
        }
      }
    }
    const sliceComponent = this.createSlice(sliceTrait);
    if (sliceComponent !== null) {
      sliceComponent.slice.setTrait(sliceTrait);
      this.insertChildComponent(sliceComponent, targetComponent);
      if (sliceComponent.slice.view === null) {
        const sliceView = this.createSliceView(sliceComponent);
        let targetView: SliceView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.slice.view;
        }
        const pieView = this.pie.view;
        if (pieView !== null) {
          sliceComponent.slice.injectView(pieView, sliceView, targetView, null);
        } else {
          sliceComponent.slice.setView(sliceView, targetView);
        }
      }
    }
  }

  removeSliceTrait(sliceTrait: SliceTrait): void {
    const sliceFasteners = this.sliceFasteners as ComponentFastener<this, SliceComponent>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      const sliceComponent = sliceFastener.component;
      if (sliceComponent !== null && sliceComponent.slice.trait === sliceTrait) {
        sliceFastener.setComponent(null);
        if (this.isMounted()) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        sliceComponent.remove();
        return;
      }
    }
  }

  protected initSliceTrait(sliceTrait: SliceTrait, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected attachSliceTrait(sliceTrait: SliceTrait, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected detachSliceTrait(sliceTrait: SliceTrait, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected willSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                              sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceTrait !== void 0) {
        componentObserver.componentWillSetSliceTrait(newSliceTrait, oldSliceTrait, sliceFastener);
      }
    }
  }

  protected onSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                            sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (oldSliceTrait !== null) {
      this.detachSliceTrait(oldSliceTrait, sliceFastener);
    }
    if (newSliceTrait !== null) {
      this.attachSliceTrait(newSliceTrait, sliceFastener);
      this.initSliceTrait(newSliceTrait, sliceFastener);
    }
  }

  protected didSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                             sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceTrait !== void 0) {
        componentObserver.componentDidSetSliceTrait(newSliceTrait, oldSliceTrait, sliceFastener);
      }
    }
  }

  protected createSliceView(sliceComponent: SliceComponent): SliceView | null {
    return sliceComponent.slice.createView();
  }

  protected initSliceView(sliceView: SliceView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.initSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.initSliceLegendView(legendView, sliceFastener);
    }
  }

  protected attachSliceView(sliceView: SliceView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.attachSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.attachSliceLegendView(legendView, sliceFastener);
    }
  }

  protected detachSliceView(sliceView: SliceView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.detachSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.detachSliceLegendView(legendView, sliceFastener);
    }
    sliceView.remove();
  }

  protected willSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                             sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceView !== void 0) {
        componentObserver.componentWillSetSliceView(newSliceView, oldSliceView, sliceFastener);
      }
    }
  }

  protected onSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                           sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (oldSliceView !== null) {
      this.detachSliceView(oldSliceView, sliceFastener);
    }
    if (newSliceView !== null) {
      this.attachSliceView(newSliceView, sliceFastener);
      this.initSliceView(newSliceView, sliceFastener);
    }
  }

  protected didSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                            sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceView !== void 0) {
        componentObserver.componentDidSetSliceView(newSliceView, oldSliceView, sliceFastener);
      }
    }
  }

  protected willSetSliceValue(newValue: number, oldValue: number,
                              sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceValue !== void 0) {
        componentObserver.componentWillSetSliceValue(newValue, oldValue, sliceFastener);
      }
    }
  }

  protected onSetSliceValue(newValue: number, oldValue: number,
                            sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (newValue === 0) {
      const sliceComponent = sliceFastener.component;
      if (sliceComponent !== null) {
        const sliceTrait = sliceComponent.slice.trait;
        if (sliceTrait !== null) {
          this.removeSliceTrait(sliceTrait);
        }
      }
    }
  }

  protected didSetSliceValue(newValue: number, oldValue: number,
                             sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceValue !== void 0) {
        componentObserver.componentDidSetSliceValue(newValue, oldValue, sliceFastener);
      }
    }
  }

  protected initSliceLabelView(labelView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected attachSliceLabelView(labelView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected detachSliceLabelView(labelView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected willSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                  sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceLabelView !== void 0) {
        componentObserver.componentWillSetSliceLabelView(newLabelView, oldLabelView, sliceFastener);
      }
    }
  }

  protected onSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (oldLabelView !== null) {
      this.detachSliceLabelView(oldLabelView, sliceFastener);
    }
    if (newLabelView !== null) {
      this.attachSliceLabelView(newLabelView, sliceFastener);
      this.initSliceLabelView(newLabelView, sliceFastener);
    }
  }

  protected didSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                 sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceLabelView !== void 0) {
        componentObserver.componentDidSetSliceLabelView(newLabelView, oldLabelView, sliceFastener);
      }
    }
  }

  protected initSliceLegendView(legendView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected attachSliceLegendView(legendView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected detachSliceLegendView(legendView: GraphicsView, sliceFastener: ComponentFastener<this, SliceComponent>): void {
    // hook
  }

  protected willSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                   sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceLegendView !== void 0) {
        componentObserver.componentWillSetSliceLegendView(newLegendView, oldLegendView, sliceFastener);
      }
    }
  }

  protected onSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                 sliceFastener: ComponentFastener<this, SliceComponent>): void {
    if (oldLegendView !== null) {
      this.detachSliceLegendView(oldLegendView, sliceFastener);
    }
    if (newLegendView !== null) {
      this.attachSliceLegendView(newLegendView, sliceFastener);
      this.initSliceLegendView(newLegendView, sliceFastener);
    }
  }

  protected didSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                  sliceFastener: ComponentFastener<this, SliceComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceLegendView !== void 0) {
        componentObserver.componentDidSetSliceLegendView(newLegendView, oldLegendView, sliceFastener);
      }
    }
  }

  @ComponentProperty({type: Timing, state: true})
  readonly sliceTiming!: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static SliceFastener = ComponentFastener.define<PieComponent, SliceComponent>({
    type: SliceComponent,
    child: false,
    observe: true,
    willSetComponent(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null): void {
      this.owner.willSetSlice(newSliceComponent, oldSliceComponent, this);
    },
    onSetComponent(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null): void {
      this.owner.onSetSlice(newSliceComponent, oldSliceComponent, this);
    },
    didSetComponent(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null): void {
      this.owner.didSetSlice(newSliceComponent, oldSliceComponent, this);
    },
    componentWillSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.willSetSliceTrait(newSliceTrait, oldSliceTrait, this);
    },
    componentDidSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.onSetSliceTrait(newSliceTrait, oldSliceTrait, this);
      this.owner.didSetSliceTrait(newSliceTrait, oldSliceTrait, this);
    },
    componentWillSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.willSetSliceView(newSliceView, oldSliceView, this);
    },
    componentDidSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.onSetSliceView(newSliceView, oldSliceView, this);
      this.owner.didSetSliceView(newSliceView, oldSliceView, this);
    },
    componentWillSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.willSetSliceValue(newValue, oldValue, this);
    },
    componentDidSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.onSetSliceValue(newValue, oldValue, this);
      this.owner.didSetSliceValue(newValue, oldValue, this);
    },
    componentWillSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetSliceLabelView(newLabelView, oldLabelView, this);
    },
    componentDidSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetSliceLabelView(newLabelView, oldLabelView, this);
      this.owner.didSetSliceLabelView(newLabelView, oldLabelView, this);
    },
    componentWillSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetSliceLegendView(newLegendView, oldLegendView, this);
    },
    componentDidSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetSliceLegendView(newLegendView, oldLegendView, this);
      this.owner.didSetSliceLegendView(newLegendView, oldLegendView, this);
    },
  });

  protected createSliceFastener(sliceComponent: SliceComponent): ComponentFastener<this, SliceComponent> {
    return new PieComponent.SliceFastener(this, sliceComponent.key, "slice");
  }

  /** @hidden */
  readonly sliceFasteners!: ReadonlyArray<ComponentFastener<this, SliceComponent>>;

  protected getSliceFastener(sliceTrait: SliceTrait): ComponentFastener<this, SliceComponent> | null {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      const sliceComponent = sliceFastener.component;
      if (sliceComponent !== null && sliceComponent.slice.trait === sliceTrait) {
        return sliceFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.mount();
    }
  }

  /** @hidden */
  protected unmountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.unmount();
    }
  }

  protected detectSliceComponent(component: Component): SliceComponent | null {
    return component instanceof SliceComponent ? component : null;
  }

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const sliceComponent = this.detectSliceComponent(childComponent);
    if (sliceComponent !== null) {
      this.insertSlice(sliceComponent, targetComponent);
    }
  }

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const sliceComponent = this.detectSliceComponent(childComponent);
    if (sliceComponent !== null) {
      this.removeSlice(sliceComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountSliceFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountComponentFasteners();
  }
}
