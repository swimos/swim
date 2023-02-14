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

package swim.expr;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class TrapTerm implements Term, ToSource {

  private TrapTerm() {
    // singleton
  }

  @Override
  public TermGenerator generator() {
    return TermGenerator.empty();
  }

  @Override
  public boolean isTruthy() {
    return false;
  }

  @Override
  public boolean isFalsey() {
    return true;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TrapTerm", "of").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final TrapTerm INSTANCE = new TrapTerm();

  public static TrapTerm of() {
    return INSTANCE;
  }

}
