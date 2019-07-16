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

package swim.io;

import swim.codec.Debug;
import swim.codec.Output;

/**
 * Network channel flow delta, modifying <em>read</em> and <em>write</em>
 * operations.  Represents an atomic change to a {@code FlowControl} state.
 *
 * @see FlowControl
 * @see FlowContext
 */
public enum FlowModifier implements Debug {
  /**
   * <em>read</em> and <em>write</em> operations should not be modified.
   */
  RESELECT(0x0),

  /**
   * <em>read</em> operation should be disabled; <em>write</em> operation
   * should not be modified.
   */
  DISABLE_READ(0x1),

  /**
   * <em>write</em> operation should be disabled; <em>read</em> operation
   * should not be modified.
   */
  DISABLE_WRITE(0x2),

  /**
   * <em>read</em> and <em>write</em> operations should be disabled.
   */
  DISABLE_READ_WRITE(0x3),

  /**
   * <em>read</em> operation should be enabled; <em>write</em> operation
   * should not be modified.
   */
  ENABLE_READ(0x4),

  /**
   * <em>write</em> operation should be disabled; <em>read</em> operation
   * should be enabled.
   */
  DISABLE_WRITE_ENABLE_READ(0x6),

  /**
   * <em>write</em> operation should be enabled; <em>read</em> operation
   * should not be modified.
   */
  ENABLE_WRITE(0x8),

  /**
   * <em>read</em> operation should be disabled; <em>write</em> operation
   * should be enabled.
   */
  DISABLE_READ_ENABLE_WRITE(0x9),

  /**
   * <em>read</em> and <em>write</em> operations should be enabled.
   */
  ENABLE_READ_WRITE(0xc);

  private final int flags;

  FlowModifier(int flags) {
    this.flags = flags;
  }

  /**
   * Returns {@code true} if the <em>read</em> operation should be disabled.
   */
  public boolean isReadDisabled() {
    return (this.flags & 0x1) != 0;
  }

  /**
   * Returns {@code true} if the <em>write</em> operation should be disabled.
   */
  public boolean isWriteDisabled() {
    return (this.flags & 0x2) != 0;
  }

  /**
   * Returns {@code true} if the <em>read</em> operation should be enabled.
   */
  public boolean isReadEnabled() {
    return (this.flags & 0x4) != 0;
  }

  /**
   * Returns {@code true} if the <em>write</em> operation should be enabled.
   */
  public boolean isWriteEnabled() {
    return (this.flags & 0x8) != 0;
  }

  /**
   * Returns the {@code FlowModifier} with all modifications applied in {@code
   * this} or {@code that} applied, with enable instructions taking precedence
   * over conflicting disable instructions.
   */
  public FlowModifier or(FlowModifier that) {
    return fromFlags(this.flags | that.flags);
  }

  /**
   * Returns the {@code FlowModifier} with all modifications applied in {@code
   * this} or {@code that}—but not both—applied, with enable instructions
   * taking precedence over conflicting disable instructions.
   */
  public FlowModifier xor(FlowModifier that) {
    return fromFlags(this.flags ^ that.flags);
  }

  /**
   * Returns the {@code FlowModifier} with all modifications applied in {@code
   * this} and {@code that} applied, with enable instructions taking precedence
   * over conflicting disable instructions.
   */
  public FlowModifier and(FlowModifier that) {
    return fromFlags(this.flags & that.flags);
  }

  /**
   * Returns the {@code FlowModifier} with all applied modifications in {@code
   * this} unapplied, and all unapplied operations in {@code this} applied,
   * with enable instructions taking precedence over conflicting disable
   * instructions.
   */
  public FlowModifier not() {
    return fromFlags(~this.flags & 0xf);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("FlowModifier").write('.').write(name());
  }

  private static FlowModifier fromFlags(int flags) {
    if ((flags ^ 0x5) == 0) {
      flags &= ~0x1; // ENABLE_READ takes precedence over DISABLE_READ
    }
    if ((flags ^ 0xa) == 0) {
      flags &= ~0x2; // ENABLE_WRITE takes precedence over DISABLE_WRITE
    }
    switch (flags) {
      case 0x0: return RESELECT;
      case 0x1: return DISABLE_READ;
      case 0x2: return DISABLE_WRITE;
      case 0x3: return DISABLE_READ_WRITE;
      case 0x4: return ENABLE_READ;
      case 0x6: return DISABLE_WRITE_ENABLE_READ;
      case 0x8: return ENABLE_WRITE;
      case 0x9: return DISABLE_READ_ENABLE_WRITE;
      case 0xc: return ENABLE_READ_WRITE;
      default: throw new IllegalArgumentException("0x" + Integer.toHexString(flags));
    }
  }
}
