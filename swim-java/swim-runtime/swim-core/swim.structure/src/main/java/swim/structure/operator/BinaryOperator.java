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

package swim.structure.operator;

import swim.structure.Item;
import swim.structure.Operator;

/**
 * An {@link Operator} that represents a binary operation, i.e. an operation on
 * two operands.
 */
public abstract class BinaryOperator extends Operator {

  final Item lhs;
  final Item rhs;

  public BinaryOperator(Item lhs, Item rhs) {
    this.lhs = lhs.commit();
    this.rhs = rhs.commit();
  }

  public final Item lhs() {
    return this.lhs;
  }

  /**
   * Returns the token that identifiers this {@code Operator}'s operation.
   * Used to uniquely identify the type of operation, and to aid serialization.
   */
  public abstract String operator();

  public final Item rhs() {
    return this.rhs;
  }

  @Override
  public boolean isConstant() {
    return this.lhs.isConstant() && this.rhs.isConstant();
  }

}
