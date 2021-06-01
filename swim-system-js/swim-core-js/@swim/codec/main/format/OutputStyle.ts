// Copyright 2015-2021 Swim inc.
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

import type {Output} from "../output/Output";

/**
 * Stylized text output utility functions.
 */
export const OutputStyle = {} as {
  /**
   * Writes the ASCII reset escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  reset(output: Output): void

  /**
   * Writes the ASCII bold (increased intensity) escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  bold(output: Output): void;

  /**
   * Writes the ASCII faint (decreased intensity) escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  faint(output: Output): void;

  /**
   * Writes the ASCII black foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  black(output: Output): void;

  /**
   * Writes the ASCII red foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  red(output: Output): void;

  /**
   * Writes the ASCII green foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  green(output: Output): void;

  /**
   * Writes the ASCII yellow foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  yellow(output: Output): void;

  /**
   * Writes the ASCII blue foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  blue(output: Output): void;

  /**
   * Writes the ASCII magenta foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  magenta(output: Output): void;

  /**
   * Writes the ASCII cyan foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  cyan(output: Output): void;

  /**
   * Writes the ASCII gray foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  gray(output: Output): void;

  /**
   * Writes the ASCII bold black foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  blackBold(output: Output): void;

  /**
   * Writes the ASCII bold red foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  redBold(output: Output): void;

  /**
   * Writes the ASCII bold green foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  greenBold(output: Output): void;

  /**
   * Writes the ASCII bold yellow foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  yellowBold(output: Output): void;

  /**
   * Writes the ASCII bold blue foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  blueBold(output: Output): void;

  /**
   * Writes the ASCII bold magenta foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  magentaBold(output: Output): void;

  /**
   * Writes the ASCII bold cyan foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  cyanBold(output: Output): void;

  /**
   * Writes the ASCII bold gray foreground color escape code to `output`,
   * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  grayBold(output: Output): void;
};

OutputStyle.reset = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(109/*'m'*/);
  }
};

OutputStyle.bold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(109/*'m'*/);
  }
};

OutputStyle.faint = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(50/*'2'*/).write(109/*'m'*/);
  }
};

OutputStyle.black = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
  }
};

OutputStyle.red = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
  }
};

OutputStyle.green = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
  }
};

OutputStyle.yellow = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
  }
};

OutputStyle.blue = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
  }
};

OutputStyle.magenta = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
  }
};

OutputStyle.cyan = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
  }
};

OutputStyle.gray = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
  }
};

OutputStyle.blackBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
  }
};

OutputStyle.redBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
  }
};

OutputStyle.greenBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
  }
};

OutputStyle.yellowBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
  }
};

OutputStyle.blueBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
  }
};

OutputStyle.magentaBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
  }
};

OutputStyle.cyanBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
  }
};

OutputStyle.grayBold = function (output: Output): void {
  if (output.settings.isStyled()) {
    output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
        .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
  }
};
