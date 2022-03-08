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

package swim.codec;

/**
 * Stylized text output utility functions.
 */
public final class OutputStyle {

  private OutputStyle() {
  }

  /**
   * Writes the ASCII reset escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> reset(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold (increased intensity) escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> bold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII faint (decreased intensity) escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> faint(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('2').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII black foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> black(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('0').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII red foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> red(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('1').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII green foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> green(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('2').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII yellow foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> yellow(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('3').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII blue foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> blue(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('4').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII magenta foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> magenta(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('5').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII cyan foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> cyan(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('6').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII gray foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> gray(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('7').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold black foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> blackBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('0').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold red foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> redBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('1').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold green foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> greenBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('2').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold yellow foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> yellowBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('3').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold blue foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> blueBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('4').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold magenta foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> magentaBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('5').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold cyan foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> cyanBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('6').write('m');
    }
    return output;
  }

  /**
   * Writes the ASCII bold gray foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> grayBold(Output<T> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('7').write('m');
    }
    return output;
  }

}
