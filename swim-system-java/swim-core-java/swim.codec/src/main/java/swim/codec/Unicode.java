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
 * Unicode code point {@link Input}/{@link Output}/{@link Writer} factory.
 *
 * <p>The {@code Unicode.stringInput(...)} family of functions return an {@code
 * Input} that reads the Unicode code points of a {@code String}.</p>
 *
 * <p>The {@code Unicode.stringOutput(...)} family of functions return an {@code
 * Output} that writes Unicode code points to an internal buffer, and {@link
 * Output#bind() bind} a {@code String} containing all written code points.</p>
 */
public final class Unicode {
  private Unicode() {
    // nop
  }

  public static Input stringInput(String string) {
    return new StringInput(string);
  }

  /**
   * Returns a new {@code Output} that writes Unicode code points to the
   * given string {@code builder}, using the given output {@code settings}.
   * The returned {@code Output} accepts an unbounded number of code points,
   * remaining permanently in the <em>cont</em> state, and {@link Output#bind()
   * binds} a {@code String} containing all written code points.
   */
  public static Output<String> stringOutput(StringBuilder builder, OutputSettings settings) {
    return new StringOutput(builder, settings);
  }

  /**
   * Returns a new {@code Output} that writes Unicode code points to the given
   * string {@code builder}.  The returned {@code Output} accepts an unbounded
   * number of code points, remaining permanently in the <em>cont</em> state,
   * and {@link Output#bind() binds} a {@code String} containing all written
   * code points.
   */
  public static Output<String> stringOutput(StringBuilder builder) {
    return new StringOutput(builder, OutputSettings.standard());
  }

  /**
   * Returns a new {@code Output} that appends Unicode code points to the given
   * {@code string}, using the given output {@code settings}.  The returned
   * {@code Output} accepts an unbounded number of code points, remaining
   * permanently in the <em>cont</em> state, and {@link Output#bind() binds}
   * a {@code String} containing the given {@code string}, and all appended
   * code points.
   */
  public static Output<String> stringOutput(String string, OutputSettings settings) {
    return new StringOutput(new StringBuilder(string), settings);
  }

  /**
   * Returns a new {@code Output} that appends Unicode code points to the given
   * {@code string}.  The returned {@code Output} accepts an unbounded number
   * of code points, remaining permanently in the <em>cont</em> state, and
   * {@link Output#bind() binds} a {@code String} containing the given {@code
   * string}, and all appended code points.
   */
  public static Output<String> stringOutput(String string) {
    return new StringOutput(new StringBuilder(string), OutputSettings.standard());
  }

  public static Output<String> stringOutput(int initialCapacity, OutputSettings settings) {
    return new StringOutput(new StringBuilder(initialCapacity), settings);
  }

  public static Output<String> stringOutput(int initialCapacity) {
    return new StringOutput(new StringBuilder(initialCapacity), OutputSettings.standard());
  }

  /**
   * Returns a new {@code Output} that buffers Unicode code points, using the
   * given output {@code settings}.  The returned {@code Output} accepts an
   * unbounded number of code points, remaining permanently in the <em>cont</em>
   * state, and {@link Output#bind() binds} a {@code String} containing all
   * written code points.
   */
  public static Output<String> stringOutput(OutputSettings settings) {
    return new StringOutput(new StringBuilder(), settings);
  }

  /**
   * Returns a new {@code Output} that buffers Unicode code points.
   * The returned {@code Output} accepts an unbounded number of code points,
   * remaining permanently in the <em>cont</em> state, and {@link Output#bind()
   * binds} a {@code String} containing all written code points.
   */
  public static Output<String> stringOutput() {
    return new StringOutput(new StringBuilder(), OutputSettings.standard());
  }

  public static Parser<String> stringParser(StringBuilder builder) {
    return new StringParser(builder);
  }

  public static Parser<String> stringParser() {
    return new StringParser();
  }

  public static Parser<String> parseString(Input input, StringBuilder builder) {
    return StringParser.parse(input, builder);
  }

  public static Parser<String> parseString(Input input) {
    return StringParser.parse(input);
  }

  public static <O> Parser<O> outputParser(Output<O> output) {
    return new ByteParser<O>(output);
  }

  public static <O> Parser<O> parseOutput(Output<O> output, Input input) {
    return ByteParser.parse(input, output);
  }

  public static <O> Parser<O> nullParser() {
    return new NullParser<O>();
  }

  public static <O> Parser<O> parseNull(Input input) {
    return NullParser.parse(input);
  }

  @SuppressWarnings("unchecked")
  public static <I> Writer<I, Object> stringWriter() {
    return (Writer<I, Object>) new StringWriter();
  }

  @SuppressWarnings("unchecked")
  public static <I, O> Writer<I, O> stringWriter(O input) {
    return (Writer<I, O>) new StringWriter(input, input);
  }

  @SuppressWarnings("unchecked")
  public static <I> Writer<I, Object> writeString(Object input, Output<?> output) {
    return (Writer<I, Object>) StringWriter.write(output, null, input);
  }

  public static Parser<String> lineParser() {
    return new LineParser();
  }

  public static Parser<String> parseLine(Input input, StringBuilder output) {
    return LineParser.parse(input, output);
  }

  public static Parser<String> parseLine(Input input) {
    return LineParser.parse(input, new StringBuilder());
  }
}
