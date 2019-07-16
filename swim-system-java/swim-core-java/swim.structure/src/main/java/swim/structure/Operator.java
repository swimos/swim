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

package swim.structure;

/**
 * An {@link Expression} that identifies an operation on constants, variables,
 * or {@link Selector} expressions.
 */
public abstract class Operator extends Expression {
  @Override
  public abstract Item evaluate(Interpreter interpreter);

  @Override
  public int compareTo(Item other) {
    if (other instanceof Operator) {
      return compareTo((Operator) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  protected abstract int compareTo(Operator that);

  @Override
  public abstract boolean equals(Object other);

  @Override
  public abstract int hashCode();
}
