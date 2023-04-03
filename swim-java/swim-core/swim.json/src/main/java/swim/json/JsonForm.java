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

package swim.json;

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
 * A transcoder between serialized JSON and values of type {@code T}.
 *
 * @param <T> the type of values transcoded by this {@code JsonForm}
 *
 * @see JsonCodec
 */
@Public
@Since("5.0")
public interface JsonForm<T> extends TermForm<T>, Translator<T> {

  /**
   * Returns a {@code JsonForm} that injects a {@code type} field
   * with the given {@code tag} value into serialized JSON objects.
   *
   * @param tag the value of the {@code type} field to inject into
   *        serialized JSON objects
   * @return a {@code JsonForm} that tags serialized JSON objects
   *         with a distinguishing field
   * @throws JsonException if values of type {@code T} cannot be
   *         serialized to JSON objects with an injected {@code type} field
   */
  default JsonForm<T> taggedForm(String tag) throws JsonException {
    throw new JsonFormException(Notation.of("unsupported tag: ")
                                        .appendSource(tag)
                                        .toString());
  }

  /**
   * Returns a {@code JsonUndefinedForm} for transcoding JSON
   * undefined literals to values of type {@code T}.
   *
   * @return a {@code JsonUndefinedForm} that transcodes values
   *         of type {@code T} to JSON undefined literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON undefined literals is not supported
   */
  default JsonUndefinedForm<? extends T> undefinedForm() throws JsonException {
    throw new JsonFormException("undefined not supported");
  }

  /**
   * Returns a {@code JsonNullForm} for transcoding JSON
   * null literals to values of type {@code T}.
   *
   * @return a {@code JsonNullForm} that transcodes values
   *         of type {@code T} to JSON null literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON null literals is not supported
   */
  default JsonNullForm<? extends T> nullForm() throws JsonException {
    throw new JsonFormException("null not supported");
  }

  /**
   * Returns a {@code JsonIdentifierForm} for transcoding JSON
   * identifier literals to values of type {@code T}.
   *
   * @return a {@code JsonIdentifierForm} that transcodes values
   *         of type {@code T} to JSON identifier literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON identifier literals is not supported
   */
  @Override
  default JsonIdentifierForm<? extends T> identifierForm() throws JsonException {
    throw new JsonFormException("identifier not supported");
  }

  /**
   * Returns a {@code JsonNumberForm} for transcoding JSON
   * number literals to values of type {@code T}.
   *
   * @return a {@code JsonNumberForm} that transcodes values
   *         of type {@code T} to JSON number literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON number literals is not supported
   */
  @Override
  default JsonNumberForm<? extends T> numberForm() throws JsonException {
    throw new JsonFormException("number not supported");
  }

  /**
   * Returns a {@code JsonStringForm} for transcoding JSON
   * string literals to values of type {@code T}.
   *
   * @return a {@code JsonStringForm} that transcodes values
   *         of type {@code T} to JSON string literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON string literals is not supported
   */
  @Override
  default JsonStringForm<?, ? extends T> stringForm() throws JsonException {
    throw new JsonFormException("string not supported");
  }

  /**
   * Returns a {@code JsonArrayForm} for transcoding JSON
   * array literals to values of type {@code T}.
   *
   * @return a {@code JsonArrayForm} that transcodes values
   *         of type {@code T} to JSON array literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON array literals is not supported
   */
  default JsonArrayForm<?, ?, ? extends T> arrayForm() throws JsonException {
    throw new JsonFormException("array not supported");
  }

  /**
   * Returns a {@code JsonObjectForm} for transcoding JSON
   * object literals to values of type {@code T}.
   *
   * @return a {@code JsonObjectForm} that transcodes values
   *         of type {@code T} to JSON object literals
   * @throws JsonException if transcoding values of type {@code T}
   *         to JSON object literals is not supported
   */
  default JsonObjectForm<?, ?, ?, ? extends T> objectForm() throws JsonException {
    throw new JsonFormException("object not supported");
  }

  @Override
  default MediaType mediaType() {
    return Json.codec().mediaType();
  }

  Parse<T> parse(Input input, JsonParser parser);

  @Override
  default Parse<T> parse(Input input) {
    return this.parse(input, Json.parser());
  }

  default Parse<T> parse(JsonParser parser) {
    return this.parse(StringInput.empty(), parser);
  }

  @Override
  default Parse<T> parse() {
    return this.parse(Json.parser());
  }

  default Parse<T> parse(String json, JsonParser parser) {
    Objects.requireNonNull(json, "json");
    Objects.requireNonNull(parser, "parser");
    final StringInput input = new StringInput(json);
    while (input.isCont() && parser.isWhitespace(input.head())) {
      input.step();
    }
    final Parse<T> parseJson = this.parse(input, parser);
    if (parseJson.isDone()) {
      while (input.isCont() && parser.isWhitespace(input.head())) {
        input.step();
      }
    }
    return parseJson.complete(input);
  }

  @Override
  default Parse<T> parse(String json) {
    return this.parse(json, Json.parser());
  }

  Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer);

  default Write<?> write(@Nullable T value, JsonWriter writer) {
    return this.write(BinaryOutput.full(), value, writer);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, Json.writer());
  }

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, Json.writer());
  }

  default String toString(@Nullable T value, JsonWriter writer) {
    final StringOutput output = new StringOutput();
    this.write(output, value, writer).assertDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, Json.writer());
  }

}
