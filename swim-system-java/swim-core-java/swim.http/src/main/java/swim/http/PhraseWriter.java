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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class PhraseWriter extends Writer<Object, Object> {
  final String phrase;
  final int index;

  PhraseWriter(String phrase, int index) {
    this.phrase = phrase;
    this.index = index;
  }

  PhraseWriter(String phrase) {
    this(phrase, 0);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.phrase, this.index);
  }

  static Writer<Object, Object> write(Output<?> output, String phrase, int index) {
    final int length = phrase.length();
    while (index < length && output.isCont()) {
      final int c = phrase.codePointAt(index);
      if (Http.isPhraseChar(c)) {
        output = output.write(c);
        index = phrase.offsetByCodePoints(index, 1);
      } else {
        return error(new HttpException("invalid phrase: " + phrase));
      }
    }
    if (index >= length) {
      return done();
    } else if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new PhraseWriter(phrase, index);
  }

  static Writer<Object, Object> write(Output<?> output, String phrase) {
    return write(output, phrase, 0);
  }
}
