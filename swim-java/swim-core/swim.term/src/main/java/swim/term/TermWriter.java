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

package swim.term;

import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.Writer;

/**
 * A writer of values optionally embedded in expressions.
 *
 * @param <T> the type of values to write
 */
@Public
@Since("5.0")
public interface TermWriter<@Contravariant T> extends Writer<T> {

  Write<?> write(Output<?> output, @Nullable T value, TermWriterOptions options);

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, TermWriterOptions.readable());
  }

  Write<?> writeTerm(Output<?> output, Term term, TermWriterOptions options);

}
