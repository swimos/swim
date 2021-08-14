// Copyright 2015-2021 Swim inc.
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

package swim.structure;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public class InterpreterSettings implements Debug {

  protected final int maxScopeDepth;

  public InterpreterSettings(int maxScopeDepth) {
    this.maxScopeDepth = maxScopeDepth;
  }

  public final int maxScopeDepth() {
    return this.maxScopeDepth;
  }

  public InterpreterSettings maxScopeDepth(int maxScopeDepth) {
    return this.copy(maxScopeDepth);
  }

  protected InterpreterSettings copy(int maxScopeDepth) {
    return new InterpreterSettings(maxScopeDepth);
  }

  protected boolean canEqual(Object other) {
    return other instanceof InterpreterSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof InterpreterSettings) {
      final InterpreterSettings that = (InterpreterSettings) other;
      return that.canEqual(this) && this.maxScopeDepth == that.maxScopeDepth;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (InterpreterSettings.hashSeed == 0) {
      InterpreterSettings.hashSeed = Murmur3.seed(InterpreterSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(InterpreterSettings.hashSeed, this.maxScopeDepth));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("new").write(' ').write("InterpreterSettings").write('(')
                   .debug(this.maxScopeDepth).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static final int MAX_SCOPE_DEPTH;

  private static InterpreterSettings standard;

  public static InterpreterSettings standard() {
    if (InterpreterSettings.standard == null) {
      InterpreterSettings.standard = new InterpreterSettings(InterpreterSettings.MAX_SCOPE_DEPTH);
    }
    return InterpreterSettings.standard;
  }

  static {
    int maxScopeDepth;
    try {
      maxScopeDepth = Integer.parseInt(System.getProperty("swim.structure.interpreter.max.scope.depth"));
    } catch (NumberFormatException e) {
      maxScopeDepth = 1024;
    }
    MAX_SCOPE_DEPTH = maxScopeDepth;
  }

}
