// Copyright 2015-2021 Swim.inc
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
 * @public
 */
export const OutputStyle = (function () {
  const OutputStyle = {} as {
    /**
     * Writes the ASCII reset escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    reset<T>(output: Output<T>): Output<T>

    /**
     * Writes the ASCII bold (increased intensity) escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    bold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII faint (decreased intensity) escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    faint<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII black foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    black<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII red foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    red<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII green foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    green<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII yellow foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    yellow<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII blue foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    blue<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII magenta foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    magenta<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII cyan foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    cyan<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII gray foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    gray<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold black foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    blackBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold red foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    redBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold green foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    greenBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold yellow foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    yellowBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold blue foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    blueBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold magenta foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    magentaBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold cyan foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    cyanBold<T>(output: Output<T>): Output<T>;

    /**
     * Writes the ASCII bold gray foreground color escape code to `output`,
     * if [[OutputSettings.isStyled `output.settings.isStyled()`]] is `true`.
     *
     * @returns the continuation of the `output`.
     */
    grayBold<T>(output: Output<T>): Output<T>;
  };

  OutputStyle.reset = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.bold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.faint = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(50/*'2'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.black = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.red = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.green = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.yellow = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.blue = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.magenta = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.cyan = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.gray = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(48/*'0'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.blackBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(48/*'0'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.redBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(49/*'1'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.greenBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(50/*'2'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.yellowBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(51/*'3'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.blueBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(52/*'4'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.magentaBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(53/*'5'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.cyanBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(54/*'6'*/).write(109/*'m'*/);
    }
    return output;
  };

  OutputStyle.grayBold = function <T>(output: Output<T>): Output<T> {
    if (output.settings.isStyled()) {
      output = output.write(27).write(91/*'['*/).write(49/*'1'*/).write(59/*';'*/)
                     .write(51/*'3'*/).write(55/*'7'*/).write(109/*'m'*/);
    }
    return output;
  };

  return OutputStyle;
})();
