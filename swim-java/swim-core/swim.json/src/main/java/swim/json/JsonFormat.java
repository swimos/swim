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

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.decl.FilterMode;
import swim.term.TermFormat;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

/**
 * A transcoder of values from/to JSON.
 *
 * @param <T> the type of values to transcode from/to JSON
 */
@Public
@Since("5.0")
public interface JsonFormat<T> extends TermFormat<T>, JsonParser<T>, JsonWriter<T> {

  @Override
  default MediaType mediaType() {
    return JsonMetaCodec.APPLICATION_JSON;
  }

  default JsonParser<T> parser() {
    return this;
  }

  default JsonWriter<T> writer() {
    return this;
  }

  default @Nullable T merged(@Nullable T newValue, @Nullable T oldValue) throws JsonException {
    return newValue;
  }

  static <T> JsonFormat<T> get(Type type) throws JsonProviderException {
    return Json.metaCodec().getJsonFormat(type);
  }

  static <T> JsonFormat<T> get(@Nullable T value) throws JsonProviderException {
    return Json.metaCodec().getJsonFormat(value);
  }

  static <T> JsonFormat<T> combining(@Nullable String typeName,
                                     JsonParser<? extends T> parser,
                                     JsonWriter<? super T> writer) {
    return new JsonCombiningFormat<T>(typeName, Assume.covariant(parser),
                                      Assume.contravariant(writer));
  }

}

final class JsonCombiningFormat<T> implements JsonFormat<T>, WriteSource {

  @Nullable String typeName;
  final JsonParser<T> parser;
  final JsonWriter<T> writer;

  JsonCombiningFormat(@Nullable String typeName, JsonParser<T> parser, JsonWriter<T> writer) {
    this.typeName = typeName;
    this.parser = parser;
    this.writer = writer;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public JsonParser<T> parser() {
    return this.parser;
  }

  @Override
  public JsonIdentifierParser<T> identifierParser() throws JsonException {
    return this.parser.identifierParser();
  }

  @Override
  public JsonNumberParser<T> numberParser() throws JsonException {
    return this.parser.numberParser();
  }

  @Override
  public JsonStringParser<?, T> stringParser() throws JsonException {
    return this.parser.stringParser();
  }

  @Override
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.parser.arrayParser();
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.parser.objectParser();
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    return this.parser.initializer();
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parser.parse(input, options);
  }

  @Override
  public JsonWriter<T> writer() {
    return this.writer;
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws JsonException {
    return this.writer.filter(value, filterMode);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    return this.writer.write(output, value, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFormat", "combining")
            .appendArgument(this.typeName)
            .appendArgument(this.parser)
            .appendArgument(this.writer)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
