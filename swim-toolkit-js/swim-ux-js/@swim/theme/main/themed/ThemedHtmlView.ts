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

import {Tween, Transition} from "@swim/transition";
import {ViewContextType, ViewFlags, View, ViewScope} from "@swim/view";
import {NodeView, HtmlViewInit, HtmlViewFactory, HtmlViewConstructor, HtmlView} from "@swim/dom";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";
import {Mood} from "../mood/Mood";
import {MoodVector} from "../mood/MoodVector";
import {MoodMatrix} from "../mood/MoodMatrix";
import {ThemeMatrix} from "../theme/ThemeMatrix";
import {ThemedViewInit, ThemedView} from "./ThemedView";
import {ThemedHtmlViewObserver} from "./ThemedHtmlViewObserver";
import {ThemedHtmlViewController} from "./ThemedHtmlViewController";

export interface ThemedHtmlViewInit extends HtmlViewInit, ThemedViewInit {
  viewController?: ThemedHtmlViewController;
}

export interface ThemedHtmlViewFactory<V extends ThemedHtmlView = ThemedHtmlView> extends HtmlViewFactory<V> {
}

export interface ThemedHtmlViewConstructor<V extends ThemedHtmlView = ThemedHtmlView> extends HtmlViewConstructor<V> {
}

export class ThemedHtmlView extends HtmlView implements ThemedView {
  // @ts-ignore
  declare readonly viewController: ThemedHtmlViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<ThemedHtmlViewObserver>;

  initView(init: ThemedHtmlViewInit): void {
    super.initView(init);
    if (init.mood !== void 0) {
      this.mood(init.mood);
    }
    if (init.moodModifier !== void 0) {
      this.moodModifier(init.moodModifier);
    }
    if (init.theme !== void 0) {
      this.theme(init.theme);
    }
    if (init.themeModifier !== void 0) {
      this.themeModifier(init.themeModifier);
    }
  }

  @ViewScope({type: MoodVector, inherit: true})
  mood: ViewScope<this, MoodVector | undefined>;

  @ViewScope({type: MoodMatrix})
  moodModifier: ViewScope<this, MoodMatrix | undefined>;

  @ViewScope({type: ThemeMatrix, inherit: true})
  theme: ViewScope<this, ThemeMatrix | undefined>;

  @ViewScope({type: MoodMatrix})
  themeModifier: ViewScope<this, MoodMatrix | undefined>;

  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel>): T | undefined {
    const theme = this.theme.state;
    let value: T | undefined;
    if (theme !== void 0) {
      if (mood === void 0) {
        mood = this.mood.state;
      }
      if (mood !== void 0) {
        value = theme.inner(mood, look);
      }
    }
    return value;
  }

  getLookOr<T, V>(look: Look<T, unknown>, elseValue: V, mood?: MoodVector<Feel>): T | V {
    const theme = this.theme.state;
    let value: T | V | undefined;
    if (theme !== void 0) {
      if (mood === void 0) {
        mood = this.mood.state;
      }
      if (mood !== void 0) {
        value = theme.inner(mood, look);
      }
    }
    if (value === void 0) {
      value = elseValue;
    }
    return value;
  }

  modifyMood(feel: Feel, ...entries: [Feel, number | undefined][]): void {
    const oldMoodModifier = this.moodModifier.getStateOr(MoodMatrix.empty());
    const newMoodModifier = oldMoodModifier.updatedCol(feel, true, ...entries);
    if (!newMoodModifier.equals(oldMoodModifier)) {
      this.moodModifier.setState(newMoodModifier);
      this.changeMood();
      this.requireUpdate(View.NeedsChange);
    }
  }

  modifyTheme(feel: Feel, ...entries: [Feel, number | undefined][]): void {
    const oldThemeModifier = this.themeModifier.getStateOr(MoodMatrix.empty());
    const newThemeModifier = oldThemeModifier.updatedCol(feel, true, ...entries);
    if (!newThemeModifier.equals(oldThemeModifier)) {
      this.themeModifier.setState(newThemeModifier);
      this.changeTheme();
      this.requireUpdate(View.NeedsChange);
    }
  }

  applyTheme(theme: ThemeMatrix, mood: MoodVector, tween?: Tween<any>): void {
    if (tween === void 0 || tween === true) {
      tween = theme.inner(Mood.ambient, Look.transition);
      if (tween === void 0) {
        tween = null;
      }
    } else {
      tween = Transition.forTween(tween);
    }
    this.willApplyTheme(theme, mood, tween);
    this.onApplyTheme(theme, mood, tween);
    this.didApplyTheme(theme, mood, tween);
  }

  protected willApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                           transition: Transition<any> | null): void {
    this.willObserve(function (viewObserver: ThemedHtmlViewObserver): void {
      if (viewObserver.viewWillApplyTheme !== void 0) {
        viewObserver.viewWillApplyTheme(theme, mood, transition, this);
      }
    });
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    // hook
  }

  protected didApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                          transition: Transition<any> | null): void {
    this.didObserve(function (viewObserver: ThemedHtmlViewObserver): void {
      if (viewObserver.viewDidApplyTheme !== void 0) {
        viewObserver.viewDidApplyTheme(theme, mood, transition, this);
      }
    });
  }

  protected onMount(): void {
    super.onMount();
    this.initTheme();
  }

  protected initTheme(): void {
    if (NodeView.isRootView(this._node)) {
      const themeManager = this.themeService.manager;
      if (themeManager !== void 0) {
        if (this.mood.isAuto() && this.mood.state === void 0) {
          this.mood.setAutoState(themeManager.mood);
        }
        if (this.theme.isAuto() && this.theme.state === void 0) {
          this.theme.setAutoState(themeManager.theme);
        }
      }
    }
  }

  protected changeMood(): void {
    const moodModifierScope = this.getViewScope("moodModifier") as ViewScope<this, MoodMatrix> | null;
    if (moodModifierScope !== null && this.mood.isAuto()) {
      const moodModifier = moodModifierScope.state;
      if (moodModifier !== void 0) {
        let superMood = this.mood.superState;
        if (superMood === void 0) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superMood = themeManager.mood;
          }
        }
        if (superMood !== void 0) {
          const mood = moodModifier.transform(superMood, true);
          this.mood.setAutoState(mood);
        }
      } else {
        this.mood.setInherited(true);
      }
    }
  }

  protected changeTheme(): void {
    const themeModifierScope = this.getViewScope("themeModifier") as ViewScope<this, MoodMatrix> | null;
    if (themeModifierScope !== null && this.theme.isAuto()) {
      const themeModifier = themeModifierScope.state;
      if (themeModifier !== void 0) {
        let superTheme = this.theme.superState;
        if (superTheme === void 0) {
          const themeManager = this.themeService.manager;
          if (themeManager !== void 0) {
            superTheme = themeManager.theme;
          }
        }
        if (superTheme !== void 0) {
          const theme = superTheme.transform(themeModifier, true);
          this.theme.setAutoState(theme);
        }
      } else {
        this.theme.setInherited(true);
      }
    }
  }

  protected updateTheme(): void {
    if (this.theme.isChanging() || this.mood.isChanging()) {
      this.changeMood();
      this.changeTheme();

      const theme = this.theme.state;
      const mood = this.mood.state;
      if (theme !== void 0 && mood !== void 0) {
        this.applyTheme(theme, mood);
      }
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.updateTheme();
  }

  protected onUncull(): void {
    super.onUncull();
    if (this.theme.isInherited()) {
      this.theme.change();
    }
    if (this.mood.isInherited()) {
      this.mood.change();
    }
  }

  static readonly mountFlags: ViewFlags = HtmlView.mountFlags | View.NeedsChange;

  /** @hidden */
  static readonly tags: {[tag: string]: typeof ThemedHtmlView | undefined} = {};

  /** @hidden */
  static decorateTag(tag: string, constructor: typeof ThemedHtmlView, name: string): void {
    const tagConstructor = constructor.forTag(tag);
    Object.defineProperty(ThemedHtmlView, name, {
      value: tagConstructor,
      configurable: true,
      enumerable: true,
    });
    if (!(tag in ThemedHtmlView.tags)) {
      ThemedHtmlView.tags[tag] = tagConstructor as any;
    }
  }

  @ThemedHtmlView.Tag("a")
  static a: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("abbr")
  static abbr: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("address")
  static address: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("area")
  static area: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("article")
  static article: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("aside")
  static aside: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("audio")
  static audio: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("b")
  static b: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("base")
  static base: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("bdi")
  static bdi: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("bdo")
  static bdo: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("blockquote")
  static blockquote: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("body")
  static body: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("br")
  static br: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("button")
  static button: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("canvas")
  static canvas: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("caption")
  static caption: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("cite")
  static cite: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("code")
  static code: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("col")
  static col: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("colgroup")
  static colgroup: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("data")
  static data: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("datalist")
  static datalist: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("dd")
  static dd: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("del")
  static del: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("details")
  static details: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("dfn")
  static dfn: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("dialog")
  static dialog: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("div")
  static div: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("dl")
  static dl: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("dt")
  static dt: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("em")
  static em: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("embed")
  static embed: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("fieldset")
  static fieldset: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("figcaption")
  static figcaption: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("figure")
  static figure: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("footer")
  static footer: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("form")
  static form: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h1")
  static h1: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h2")
  static h2: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h3")
  static h3: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h4")
  static h4: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h5")
  static h5: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("h6")
  static h6: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("head")
  static head: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("header")
  static header: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("hr")
  static hr: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("html")
  static html: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("i")
  static i: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("iframe")
  static iframe: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("img")
  static img: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("input")
  static input: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("ins")
  static ins: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("kbd")
  static kbd: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("label")
  static label: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("legend")
  static legend: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("li")
  static li: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("link")
  static link: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("main")
  static main: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("map")
  static map: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("mark")
  static mark: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("meta")
  static meta: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("meter")
  static meter: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("nav")
  static nav: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("noscript")
  static noscript: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("object")
  static object: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("ol")
  static ol: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("optgroup")
  static optgroup: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("option")
  static option: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("output")
  static output: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("p")
  static p: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("param")
  static param: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("picture")
  static picture: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("pre")
  static pre: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("progress")
  static progress: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("q")
  static q: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("rb")
  static rb: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("rp")
  static rp: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("rt")
  static rt: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("rtc")
  static rtc: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("ruby")
  static ruby: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("s")
  static s: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("samp")
  static samp: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("script")
  static script: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("section")
  static section: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("select")
  static select: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("small")
  static small: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("slot")
  static slot: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("source")
  static source: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("span")
  static span: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("strong")
  static strong: ThemedHtmlViewFactory;

  //@ThemedHtmlView.Tag("style")
  //static style: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("sub")
  static sub: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("summary")
  static summary: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("sup")
  static sup: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("table")
  static table: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("tbody")
  static tbody: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("td")
  static td: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("template")
  static template: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("textarea")
  static textarea: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("tfoot")
  static tfoot: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("th")
  static th: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("thead")
  static thead: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("time")
  static time: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("title")
  static title: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("tr")
  static tr: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("track")
  static track: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("u")
  static u: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("ul")
  static ul: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("var")
  static var: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("video")
  static video: ThemedHtmlViewFactory;

  @ThemedHtmlView.Tag("wbr")
  static wbr: ThemedHtmlViewFactory;
}
