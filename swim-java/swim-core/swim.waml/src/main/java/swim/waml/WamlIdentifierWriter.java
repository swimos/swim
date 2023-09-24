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

import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Term;

@Public
@Since("5.0")
public interface WamlIdentifierWriter<@Contravariant T> extends WamlWriter<T> {

  @Nullable String intoIdentifier(@Nullable T value) throws WamlException;

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T value, WamlWriterOptions options) {
    final String identifier;
    try {
      identifier = this.intoIdentifier(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (identifier == null) {
      return this.writeUnit(output, attrs, options);
    }
    return this.writeIdentifier(output, attrs, identifier, options);
  }

  default Write<?> writeIdentifier(Output<?> output, @Nullable Object attrs,
                                   String identifier, WamlWriterOptions options) {
    return WriteWamlIdentifier.write(output, this, options, attrs, identifier, null, 0, 1);
  }

}

final class WriteWamlIdentifier extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final String identifier;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteWamlIdentifier(WamlWriter<?> writer, WamlWriterOptions options, @Nullable Object attrs,
                      String identifier, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.identifier = identifier;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlIdentifier.write(output, this.writer, this.options, this.attrs,
                                     this.identifier, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer,
                             WamlWriterOptions options, @Nullable Object attrs,
                             String identifier, @Nullable Write<?> write, int index, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options, true);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2) {
      int c;
      if (identifier.length() == 0) {
        return Write.error(new WriteException("blank identifier"));
      }
      if (index == 0 && output.isCont()) {
        c = identifier.codePointAt(0);
        if (Term.isIdentifierStartChar(c)) {
          output.write(c);
          index = identifier.offsetByCodePoints(0, 1);
        }
      }
      while (index < identifier.length() && output.isCont()) {
        c = identifier.codePointAt(index);
        if (Term.isIdentifierChar(c)) {
          output.write(c);
          index = identifier.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid identifier"));
        }
      }
      if (index >= identifier.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlIdentifier(writer, options, attrs, identifier, write, index, step);
  }

}
