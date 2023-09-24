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

import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.collections.UniformMap;
import swim.decl.FilterMode;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonObjectFormat<V, B, T> extends JsonFormat<T>, JsonObjectParser<V, B, T>, JsonObjectWriter<V, T> {

  JsonFieldFormat<? extends V, T> getFieldFormat(@Nullable T object, String key) throws JsonException;

  Iterator<JsonFieldFormat<? extends V, T>> getFieldFormats(@Nullable T object) throws JsonException;

  Iterator<JsonFieldFormat<? extends V, T>> getDeclaredFieldFormats() throws JsonException;

  @Override
  default @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws JsonException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final Iterator<JsonFieldFormat<? extends V, T>> fieldFormats = this.getFieldFormats(newObject);
    while (fieldFormats.hasNext()) {
      newObject = fieldFormats.next().merged(newObject, oldObject);
    }
    return newObject;
  }

  static <V, B, T> JsonObjectFormat<V, B, T> combining(@Nullable String typeName,
                                                       JsonObjectParser<V, B, T> objectParser,
                                                       JsonObjectWriter<V, T> objectWriter,
                                                       UniformMap<String, JsonFieldFormat<? extends V, T>> fieldFormats) {
    return new JsonCombiningObjectFormat<V, B, T>(typeName, objectParser, objectWriter, fieldFormats);
  }

}

final class JsonCombiningObjectFormat<V, B, T> implements JsonObjectFormat<V, B, T>, WriteSource {

  @Nullable String typeName;
  final JsonObjectParser<V, B, T> objectParser;
  final JsonObjectWriter<V, T> objectWriter;
  final UniformMap<String, JsonFieldFormat<? extends V, T>> fieldFormats;

  JsonCombiningObjectFormat(@Nullable String typeName, JsonObjectParser<V, B, T> objectParser,
                            JsonObjectWriter<V, T> objectWriter,
                            UniformMap<String, JsonFieldFormat<? extends V, T>> fieldFormats) {
    this.typeName = typeName;
    this.objectParser = objectParser;
    this.objectWriter = objectWriter;
    this.fieldFormats = fieldFormats.commit();
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public JsonFieldFormat<? extends V, T> getFieldFormat(@Nullable T object, String key) throws JsonException {
    final JsonFieldFormat<? extends V, T> fieldFormat = this.fieldFormats.get(key);
    if (fieldFormat == null) {
      throw new JsonException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldFormat;
  }

  @Override
  public Iterator<JsonFieldFormat<? extends V, T>> getFieldFormats(@Nullable T object) {
    return this.fieldFormats.valueIterator();
  }

  @Override
  public Iterator<JsonFieldFormat<? extends V, T>> getDeclaredFieldFormats() {
    return this.fieldFormats.valueIterator();
  }

  @Override
  public JsonParser<T> parser() {
    return this.objectParser;
  }

  @Override
  public JsonIdentifierParser<T> identifierParser() throws JsonException {
    return this.objectParser.identifierParser();
  }

  @Override
  public JsonNumberParser<T> numberParser() throws JsonException {
    return this.objectParser.numberParser();
  }

  @Override
  public JsonStringParser<?, T> stringParser() throws JsonException {
    return this.objectParser.stringParser();
  }

  @Override
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.objectParser.arrayParser();
  }

  @Override
  public JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this.objectParser.objectParser();
  }

  @Override
  public JsonParser<String> keyParser() {
    return this.objectParser.keyParser();
  }

  @Override
  public B objectBuilder() throws JsonException {
    return this.objectParser.objectBuilder();
  }

  @Override
  public JsonFieldParser<? extends V, B> getFieldParser(B builder, String key) throws JsonException {
    return this.objectParser.getFieldParser(builder, key);
  }

  @Override
  public @Nullable T buildObject(B builder) throws JsonException {
    return this.objectParser.buildObject(builder);
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    return this.objectParser.initializer();
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.objectParser.parse(input, options);
  }

  @Override
  public JsonWriter<T> writer() {
    return this.objectWriter;
  }

  @Override
  public JsonFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws JsonException {
    return this.objectWriter.getFieldWriter(object, key);
  }

  @Override
  public Iterator<JsonFieldWriter<? extends V, T>> getFieldWriters(T object) throws JsonException {
    return this.objectWriter.getFieldWriters(object);
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws JsonException {
    return this.objectWriter.filter(value, filterMode);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    return this.objectWriter.write(output, value, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectFormat", "combining")
            .appendArgument(this.typeName)
            .appendArgument(this.objectParser)
            .appendArgument(this.objectWriter)
            .appendArgument(this.fieldFormats)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
