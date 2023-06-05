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
import swim.term.Term;
import swim.term.TermFormat;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * A transcoder of values from/to WAML.
 *
 * @param <T> the type of values to transcode from/to WAML
 */
@Public
@Since("5.0")
public interface WamlFormat<T> extends TermFormat<T>, WamlParser<T>, WamlWriter<T> {

  @Override
  default MediaType mediaType() {
    return WamlMetaCodec.APPLICATION_X_WAML;
  }

  default WamlParser<T> parser() {
    return this;
  }

  default WamlWriter<T> writer() {
    return this;
  }

  default @Nullable T merged(@Nullable T newValue, @Nullable T oldValue) throws WamlException {
    return newValue;
  }

  static <T> WamlFormat<T> get(Type type) throws WamlProviderException {
    return Waml.metaCodec().getWamlFormat(type);
  }

  static <T> WamlFormat<T> get(@Nullable T value) throws WamlProviderException {
    return Waml.metaCodec().getWamlFormat(value);
  }

  static <T> WamlFormat<T> combining(@Nullable String typeName,
                                     WamlParser<? extends T> parser,
                                     WamlWriter<? super T> writer) {
    return new WamlCombiningFormat<T>(typeName, Assume.covariant(parser),
                                      Assume.contravariant(writer));
  }

}

final class WamlCombiningFormat<T> implements WamlFormat<T>, ToSource {

  @Nullable String typeName;
  final WamlParser<T> parser;
  final WamlWriter<T> writer;

  WamlCombiningFormat(@Nullable String typeName, WamlParser<T> parser, WamlWriter<T> writer) {
    this.typeName = typeName;
    this.parser = parser;
    this.writer = writer;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public WamlParser<T> parser() {
    return this.parser;
  }

  @Override
  public WamlAttrsParser<?, ?, ?> attrsParser() {
    return this.parser.attrsParser();
  }

  @Override
  public WamlParser<T> withAttrs(@Nullable Object attrs) throws WamlException {
    return this.parser.withAttrs(attrs);
  }

  @Override
  public WamlIdentifierParser<T> identifierParser() throws WamlException {
    return this.parser.identifierParser();
  }

  @Override
  public WamlNumberParser<T> numberParser() throws WamlException {
    return this.parser.numberParser();
  }

  @Override
  public WamlStringParser<?, T> stringParser() throws WamlException {
    return this.parser.stringParser();
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this.parser.markupParser();
  }

  @Override
  public WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    return this.parser.arrayParser();
  }

  @Override
  public WamlObjectParser<?, ?, T> objectParser() throws WamlException {
    return this.parser.objectParser();
  }

  @Override
  public WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    return this.parser.tupleParser();
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    return this.parser.initializer(attrs);
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parser.parse(input, options);
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseBlock(input, options, parseAttrs);
  }

  @Override
  public Parse<T> parseInline(Input input, WamlParserOptions options) {
    return this.parser.parseInline(input, options);
  }

  @Override
  public Parse<T> parseTuple(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseTuple(input, options, parseAttrs);
  }

  @Override
  public WamlWriter<T> writer() {
    return this.writer;
  }

  @Override
  public WamlAttrsWriter<?, Object> attrsWriter() {
    return this.writer.attrsWriter();
  }

  @Override
  public @Nullable Object getAttrs(@Nullable T value) throws WamlException {
    return this.writer.getAttrs(value);
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws WamlException {
    return this.writer.filter(value, filterMode);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable T value, WamlWriterOptions options) {
    return this.writer.write(output, attrs, value, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.writer.write(output, value, options);
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.writer.writeBlock(output, value, options);
  }

  @Override
  public boolean isInline(@Nullable T value) {
    return this.writer.isInline(value);
  }

  @Override
  public Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.writer.writeInline(output, value, options);
  }

  @Override
  public Write<?> writeUnit(Output<?> output, @Nullable Object attrs, WamlWriterOptions options) {
    return this.writer.writeUnit(output, attrs, options);
  }

  @Override
  public Write<?> writeTuple(Output<?> output, @Nullable Object attrs,
                             @Nullable T value, WamlWriterOptions options) {
    return this.writer.writeTuple(output, attrs, value, options);
  }

  @Override
  public Write<?> writeTerm(Output<?> output, @Nullable Object attrs,
                            Term term, WamlWriterOptions options) {
    return this.writer.writeTerm(output, attrs, term, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFormat", "combining")
            .appendArgument(this.typeName)
            .appendArgument(this.parser)
            .appendArgument(this.writer)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
