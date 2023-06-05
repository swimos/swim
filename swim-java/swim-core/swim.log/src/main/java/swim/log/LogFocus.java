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

package swim.log;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.ToSource;

final class LogFocus implements Log, ToSource {

  final Log log;
  final String focus;

  LogFocus(Log log, String focus) {
    this.log = log;
    this.focus = focus;
  }

  @Override
  public String topic() {
    return this.log.topic();
  }

  @Override
  public String focus() {
    return this.focus;
  }

  @Override
  public Log withFocus(String focus) {
    Objects.requireNonNull(focus);
    if (this.focus.equals(focus)) {
      return this;
    }
    return this.log.withFocus(focus);
  }

  @Override
  public boolean handles(Severity level) {
    return this.log.handles(level);
  }

  @Override
  public void publish(LogEvent event) {
    this.log.publish(event);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LogFocus that) {
      return this.log.equals(that.log)
          && this.focus.equals(that.focus);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(LogFocus.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.log.hashCode()), this.focus.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append(this.log)
            .beginInvoke("withFocus")
            .appendArgument(this.focus)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
