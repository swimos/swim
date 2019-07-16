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
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void reset(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write('m');
    }
  }

  /**
   * Writes the ASCII bold (increased intensity) escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void bold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write('m');
    }
  }

  /**
   * Writes the ASCII faint (decreased intensity) escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void faint(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('2').write('m');
    }
  }

  /**
   * Writes the ASCII black foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void black(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('0').write('m');
    }
  }

  /**
   * Writes the ASCII red foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void red(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('1').write('m');
    }
  }

  /**
   * Writes the ASCII green foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void green(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('2').write('m');
    }
  }

  /**
   * Writes the ASCII yellow foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void yellow(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('3').write('m');
    }
  }

  /**
   * Writes the ASCII blue foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void blue(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('4').write('m');
    }
  }

  /**
   * Writes the ASCII magenta foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void magenta(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('5').write('m');
    }
  }

  /**
   * Writes the ASCII cyan foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void cyan(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('6').write('m');
    }
  }

  /**
   * Writes the ASCII gray foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void gray(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('0').write(';').write('3').write('7').write('m');
    }
  }

  /**
   * Writes the ASCII bold black foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void blackBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('0').write('m');
    }
  }

  /**
   * Writes the ASCII bold red foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void redBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('1').write('m');
    }
  }

  /**
   * Writes the ASCII bold green foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void greenBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('2').write('m');
    }
  }

  /**
   * Writes the ASCII bold yellow foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void yellowBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('3').write('m');
    }
  }

  /**
   * Writes the ASCII bold blue foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void blueBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('4').write('m');
    }
  }

  /**
   * Writes the ASCII bold magenta foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void magentaBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('5').write('m');
    }
  }

  /**
   * Writes the ASCII bold cyan foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void cyanBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('6').write('m');
    }
  }

  /**
   * Writes the ASCII bold gray foreground color escape code to {@code output},
   * if {@link OutputSettings#isStyled output.settings().isStyled()} is {@code true}.
   *
   * @throws OutputException if {@code output} exits the <em>cont</em> state
   *         before the full escape code has been written.
   */
  public static void grayBold(Output<?> output) {
    if (output.settings().isStyled()) {
      output = output.write(27).write('[').write('1').write(';').write('3').write('7').write('m');
    }
  }
}
