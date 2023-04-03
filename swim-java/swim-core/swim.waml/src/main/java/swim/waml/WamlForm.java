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

package swim.waml;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryOutput;
import swim.codec.Input;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Translator;
import swim.codec.Write;
import swim.expr.TermForm;
import swim.util.Notation;

/**
 * A transcoder between serialized WAML and values of type {@code T}.
 *
 * @param <T> the type of values transcoded by this {@code WamlForm}
 *
 * @see WamlCodec
 */
@Public
@Since("5.0")
public interface WamlForm<T> extends TermForm<T>, Translator<T> {

  default WamlAttrForm<?, ? extends T> getAttrForm(String name) throws WamlException {
    throw new WamlFormException(Notation.of("unsupported attr: ")
                                        .appendSource(name)
                                        .toString());
  }

  /**
   * Returns a {@code WamlForm} that injects a {@code tag} attribute
   * into serialized WAML values.
   *
   * @param tag the name of the attribute to inject into
   *        serialized WAML values
   * @return a {@code WamlForm} that tags serialized WAML values
   *         with a distinguishing attribute
   * @throws WamlException if values of type {@code T} cannot be
   *         serialized to WAML values with an injected {@code tag} attribute
   */
  default WamlForm<T> taggedForm(String tag) throws WamlException {
    throw new WamlFormException(Notation.of("unsupported tag: ")
                                        .appendSource(tag)
                                        .toString());
  }

  /**
   * Returns a {@code WamlUndefinedForm} for transcoding WAML
   * undefined literals to values of type {@code T}.
   *
   * @return a {@code WamlUndefinedForm} that transcodes values
   *         of type {@code T} to WAML undefined literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML undefined literals is not supported
   */
  default WamlUndefinedForm<? extends T> undefinedForm() throws WamlException {
    throw new WamlFormException("undefined not supported");
  }

  /**
   * Returns a {@code WamlUnitForm} for transcoding WAML
   * unit literals to values of type {@code T}.
   *
   * @return a {@code WamlUnitForm} that transcodes values
   *         of type {@code T} to WAML unit literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML unit literals is not supported
   */
  default WamlUnitForm<? extends T> unitForm() throws WamlException {
    throw new WamlFormException("unit not supported");
  }

  /**
   * Returns a {@code WamlIdentifierForm} for transcoding WAML
   * identifier literals to values of type {@code T}.
   *
   * @return a {@code WamlIdentifierForm} that transcodes values
   *         of type {@code T} to WAML identifier literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML identifier literals is not supported
   */
  @Override
  default WamlIdentifierForm<? extends T> identifierForm() throws WamlException {
    throw new WamlFormException("identifier not supported");
  }

  /**
   * Returns a {@code WamlNumberForm} for transcoding WAML
   * number literals to values of type {@code T}.
   *
   * @return a {@code WamlNumberForm} that transcodes values
   *         of type {@code T} to WAML number literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML number literals is not supported
   */
  @Override
  default WamlNumberForm<? extends T> numberForm() throws WamlException {
    throw new WamlFormException("number not supported");
  }

  /**
   * Returns a {@code WamlStringForm} for transcoding WAML
   * string literals to values of type {@code T}.
   *
   * @return a {@code WamlStringForm} that transcodes values
   *         of type {@code T} to WAML string literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML string literals is not supported
   */
  @Override
  default WamlStringForm<?, ? extends T> stringForm() throws WamlException {
    throw new WamlFormException("string not supported");
  }

  /**
   * Returns a {@code WamlArrayForm} for transcoding WAML
   * array literals to values of type {@code T}.
   *
   * @return a {@code WamlArrayForm} that transcodes values
   *         of type {@code T} to WAML array literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML array literals is not supported
   */
  default WamlArrayForm<?, ?, ? extends T> arrayForm() throws WamlException {
    throw new WamlFormException("array not supported");
  }

  /**
   * Returns a {@code WamlMarkupForm} for transcoding WAML
   * markup literals to values of type {@code T}.
   *
   * @return a {@code WamlMarkupForm} that transcodes values
   *         of type {@code T} to WAML markup literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML markup literals is not supported
   */
  default WamlMarkupForm<?, ?, ? extends T> markupForm() throws WamlException {
    throw new WamlFormException("markup not supported");
  }

  /**
   * Returns a {@code WamlObjectForm} for transcoding WAML
   * object literals to values of type {@code T}.
   *
   * @return a {@code WamlObjectForm} that transcodes values
   *         of type {@code T} to WAML object literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML object literals is not supported
   */
  default WamlObjectForm<?, ?, ?, ? extends T> objectForm() throws WamlException {
    throw new WamlFormException("object not supported");
  }

  /**
   * Returns a {@code WamlTupleForm} for transcoding WAML
   * tuple literals to values of type {@code T}.
   *
   * @return a {@code WamlTupleForm} that transcodes values
   *         of type {@code T} to WAML tuple literals
   * @throws WamlException if transcoding values of type {@code T}
   *         to WAML tuple literals is not supported
   */
  default WamlTupleForm<?, ?, ?, ? extends T> tupleForm() throws WamlException {
    throw new WamlFormException("tuple not supported");
  }

  @Override
  default MediaType mediaType() {
    return Waml.codec().mediaType();
  }

  Parse<T> parse(Input input, WamlParser parser);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, Waml.parser());
  }

  default Parse<T> parse(WamlParser parser) {
    return this.parse(StringInput.empty(), parser);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(Waml.parser());
  }

  default Parse<T> parse(String waml, WamlParser parser) {
    Objects.requireNonNull(waml, "waml");
    Objects.requireNonNull(parser, "parser");
    final StringInput input = new StringInput(waml);
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseWaml = this.parse(input, parser);
    if (parseWaml.isDone()) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseWaml.complete(input);
  }

  @Override
  default Parse<T> parse(String waml) {
    return this.parse(waml, Waml.parser());
  }

  default Parse<T> parseBlock(Input input, WamlParser parser) {
    return parser.parseBlock(input, this);
  }

  default Parse<T> parseBlock(Input input) {
    return this.parseBlock(input, Waml.parser());
  }

  default Parse<T> parseBlock(WamlParser parser) {
    return this.parseBlock(StringInput.empty(), parser);
  }

  default Parse<T> parseBlock() {
    return this.parseBlock(Waml.parser());
  }

  default Parse<T> parseBlock(String waml, WamlParser parser) {
    Objects.requireNonNull(waml, "waml");
    Objects.requireNonNull(parser, "parser");
    final StringInput input = new StringInput(waml);
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseWaml = this.parseBlock(input, parser);
    if (parseWaml.isDone()) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseWaml.complete(input);
  }

  default Parse<T> parseBlock(String waml) {
    return this.parseBlock(waml, Waml.parser());
  }

  Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer);

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, Waml.writer());
  }

  default Write<?> write(@Nullable T value, WamlWriter writer) {
    return this.write(BinaryOutput.full(), value, writer);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, Waml.writer());
  }

  default String toString(@Nullable T value, WamlWriter writer) {
    final StringOutput output = new StringOutput();
    this.write(output, value, writer).assertDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, Waml.writer());
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriter writer) {
    return this.write(output, value, writer);
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value) {
    return this.writeBlock(output, value, Waml.writer());
  }

  default Write<?> writeBlock(@Nullable T value, WamlWriter writer) {
    return this.writeBlock(BinaryOutput.full(), value, writer);
  }

  default Write<?> writeBlock(@Nullable T value) {
    return this.writeBlock(value, Waml.writer());
  }

  default String toBlockString(@Nullable T value, WamlWriter writer) {
    final StringOutput output = new StringOutput();
    this.writeBlock(output, value, writer).assertDone();
    return output.get();
  }

  default String toBlockString(@Nullable T value) {
    return this.toBlockString(value, Waml.writer());
  }

  default boolean isInline(@Nullable T value) {
    return false;
  }

  default Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriter writer) {
    return this.write(output, value, writer);
  }

}
