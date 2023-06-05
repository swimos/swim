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
public interface JsonIdentifierWriter<@Contravariant T> extends JsonWriter<T> {

  @Nullable String intoIdentifier(@Nullable T value) throws JsonException;

  @Override
  default Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    final String identifier;
    try {
      identifier = this.intoIdentifier(value);
    } catch (JsonException cause) {
      return Write.error(cause);
    }
    if (identifier == null) {
      return this.writeNull(output);
    }
    return this.writeIdentifier(output, identifier);
  }

  default Write<?> writeIdentifier(Output<?> output, String identifier) {
    return WriteJsonIdentifier.write(output, identifier, 0);
  }

}

final class WriteJsonIdentifier extends Write<Object> {

  final String identifier;
  final int index;

  WriteJsonIdentifier(String identifier, int index) {
    this.identifier = identifier;
    this.index = index;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonIdentifier.write(output, this.identifier, this.index);
  }

  static Write<Object> write(Output<?> output, String identifier, int index) {
    int c;
    if (identifier.length() == 0) {
      return Write.error(new WriteException("blank Identifier"));
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
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonIdentifier(identifier, index);
  }

}
