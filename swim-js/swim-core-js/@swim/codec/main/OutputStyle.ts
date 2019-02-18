// Copyright 2015-2019 SWIM.AI inc.
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

import {Output} from "./Output";

/**
 * Stylized text output utility functions.
 */
export class OutputStyle {
  private constructor() {
  }

  /**
   * Writes the ASCII reset escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static reset(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold (increased intensity) escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static bold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII faint (decreased intensity) escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static faint(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(50/*'2'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII black foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static black(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII red foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static red(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII green foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static green(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII yellow foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static yellow(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII blue foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static blue(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII magenta foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static magenta(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII cyan foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static cyan(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII gray foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static gray(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold black foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static blackBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold red foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static redBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold green foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static greenBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold yellow foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static yellowBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold blue foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static blueBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold magenta foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static magentaBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold cyan foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static cyanBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
    }
  }

  /**
   * Writes the ASCII bold gray foreground color escape code to `output`,
   * if [[OutputSettings.isStyled output.settings().isStyled()]] is `true`.
   *
   * @throws [[OutputException]] if `output` exits the _cont_ state before the
   *         full escape code has been written.
   */
  static grayBold(output: Output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
          .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
    }
  }
}
