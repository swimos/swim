// Copyright 2015-2023 Nstream, inc.
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
import swim.term.Term;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface WamlObjectFormat<V, B, T> extends WamlFormat<T>, WamlObjectParser<V, B, T>, WamlObjectWriter<V, T> {

  WamlFieldFormat<? extends V, T> getFieldFormat(@Nullable T object, String key) throws WamlException;

  Iterator<WamlFieldFormat<? extends V, T>> getFieldFormats(@Nullable T object) throws WamlException;

  Iterator<WamlFieldFormat<? extends V, T>> getDeclaredFieldFormats() throws WamlException;

  @Override
  default @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws WamlException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final Iterator<WamlFieldFormat<? extends V, T>> fieldFormats = this.getFieldFormats(newObject);
    while (fieldFormats.hasNext()) {
      newObject = fieldFormats.next().merged(newObject, oldObject);
    }
    return newObject;
  }

  static <V, B, T> WamlObjectFormat<V, B, T> combining(@Nullable String typeName,
                                                       WamlObjectParser<V, B, T> objectParser,
                                                       WamlObjectWriter<V, T> objectWriter,
                                                       UniformMap<String, WamlFieldFormat<? extends V, T>> fieldFormats) {
    return new WamlCombiningObjectFormat<V, B, T>(typeName, objectParser, objectWriter, fieldFormats);
  }

}

final class WamlCombiningObjectFormat<V, B, T> implements WamlObjectFormat<V, B, T>, WriteSource {

  @Nullable String typeName;
  final WamlObjectParser<V, B, T> objectParser;
  final WamlObjectWriter<V, T> objectWriter;
  final UniformMap<String, WamlFieldFormat<? extends V, T>> fieldFormats;

  WamlCombiningObjectFormat(@Nullable String typeName, WamlObjectParser<V, B, T> objectParser,
                            WamlObjectWriter<V, T> objectWriter,
                            UniformMap<String, WamlFieldFormat<? extends V, T>> fieldFormats) {
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
  public WamlFieldFormat<? extends V, T> getFieldFormat(@Nullable T object, String key) throws WamlException {
    final WamlFieldFormat<? extends V, T> fieldFormat = this.fieldFormats.get(key);
    if (fieldFormat == null) {
      throw new WamlException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldFormat;
  }

  @Override
  public Iterator<WamlFieldFormat<? extends V, T>> getFieldFormats(@Nullable T object) {
    return this.fieldFormats.valueIterator();
  }

  @Override
  public Iterator<WamlFieldFormat<? extends V, T>> getDeclaredFieldFormats() {
    return this.fieldFormats.valueIterator();
  }

  @Override
  public WamlParser<T> parser() {
    return this.objectParser;
  }

  @Override
  public WamlAttrsParser<?, ?, ?> attrsParser() {
    return this.objectParser.attrsParser();
  }

  @Override
  public WamlParser<T> withAttrs(@Nullable Object attrs) throws WamlException {
    return this.objectParser.withAttrs(attrs);
  }

  @Override
  public WamlIdentifierParser<T> identifierParser() throws WamlException {
    return this.objectParser.identifierParser();
  }

  @Override
  public WamlNumberParser<T> numberParser() throws WamlException {
    return this.objectParser.numberParser();
  }

  @Override
  public WamlStringParser<?, T> stringParser() throws WamlException {
    return this.objectParser.stringParser();
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this.objectParser.markupParser();
  }

  @Override
  public WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    return this.objectParser.arrayParser();
  }

  @Override
  public WamlObjectParser<?, ?, T> objectParser() throws WamlException {
    return this.objectParser.objectParser();
  }

  @Override
  public WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    return this.objectParser.tupleParser();
  }

  @Override
  public WamlParser<String> keyParser() {
    return this.objectParser.keyParser();
  }

  @Override
  public B objectBuilder(@Nullable Object attrs) throws WamlException {
    return this.objectParser.objectBuilder(attrs);
  }

  @Override
  public WamlFieldParser<? extends V, B> getFieldParser(B builder, String key) throws WamlException {
    return this.objectParser.getFieldParser(builder, key);
  }

  @Override
  public @Nullable T buildObject(@Nullable Object attrs, B builder) throws WamlException {
    return this.objectParser.buildObject(attrs, builder);
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    return this.objectParser.initializer(attrs);
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.objectParser.parse(input, options);
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.objectParser.parseBlock(input, options, parseAttrs);
  }

  @Override
  public Parse<T> parseInline(Input input, WamlParserOptions options) {
    return this.objectParser.parseInline(input, options);
  }

  @Override
  public Parse<T> parseTuple(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.objectParser.parseTuple(input, options, parseAttrs);
  }

  @Override
  public WamlWriter<T> writer() {
    return this.objectWriter;
  }

  @Override
  public WamlAttrsWriter<?, Object> attrsWriter() {
    return this.objectWriter.attrsWriter();
  }

  @Override
  public @Nullable Object getAttrs(@Nullable T value) throws WamlException {
    return this.objectWriter.getAttrs(value);
  }

  @Override
  public WamlFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws WamlException {
    return this.objectWriter.getFieldWriter(object, key);
  }

  @Override
  public Iterator<WamlFieldWriter<? extends V, T>> getFieldWriters(T object) throws WamlException {
    return this.objectWriter.getFieldWriters(object);
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws WamlException {
    return this.objectWriter.filter(value, filterMode);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable T value, WamlWriterOptions options) {
    return this.objectWriter.write(output, attrs, value, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.objectWriter.write(output, value, options);
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.objectWriter.writeBlock(output, value, options);
  }

  @Override
  public boolean isInline(@Nullable T value) {
    return this.objectWriter.isInline(value);
  }

  @Override
  public Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.objectWriter.writeInline(output, value, options);
  }

  @Override
  public Write<?> writeUnit(Output<?> output, @Nullable Object attrs, WamlWriterOptions options) {
    return this.objectWriter.writeUnit(output, attrs, options);
  }

  @Override
  public Write<?> writeTuple(Output<?> output, @Nullable Object attrs,
                             @Nullable T value, WamlWriterOptions options) {
    return this.objectWriter.writeTuple(output, attrs, value, options);
  }

  @Override
  public Write<?> writeTerm(Output<?> output, @Nullable Object attrs,
                            Term term, WamlWriterOptions options) {
    return this.objectWriter.writeTerm(output, attrs, term, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlObjectFormat", "combining")
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
