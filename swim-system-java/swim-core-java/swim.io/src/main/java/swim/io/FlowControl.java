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

import java.nio.channels.SelectionKey;
import swim.codec.Debug;
import swim.codec.Output;

/**
 * Network channel flow state, controlling <em>accept</em>, <em>connect</em>,
 * <em>read</em>, and <em>write</em> operations.
 *
 * @see FlowModifier
 * @see FlowContext
 */
public enum FlowControl implements Debug {
  /**
   * <em>accept</em>, <em>connect</em>, <em>read</em>, and <em>write</em> disabled.
   */
  WAIT(0x0),

  /**
   * <em>accept</em> enabled; <em>connect</em>, <em>read</em>, and <em>write</em> disabled.
   */
  ACCEPT(0x1),

  /**
   * <em>connect</em> enabled; <em>accept</em>, <em>read</em>, and <em>write</em> disabled.
   */
  CONNECT(0x2),

  /**
   * <em>accept</em> and <em>connect</em> enabled; <em>read</em> and <em>write</em> disabled.
   */
  ACCEPT_CONNECT(0x3),

  /**
   * <em>read</em> enabled; <em>accept</em>, <em>connect</em>, and <em>write</em> disabled.
   */
  READ(0x4),

  /**
   * <em>accept</em> and <em>read</em> enabled; <em>connect</em> and <em>write</em> disabled.
   */
  ACCEPT_READ(0x5),

  /**
   * <em>connect</em> and <em>read</em> enabled; <em>accept</em> and <em>write</em> disabled.
   */
  CONNECT_READ(0x6),

  /**
   * <em>accept</em>, <em>connect</em>, and <em>read</em> enabled; <em>write</em> disabled.
   */
  ACCEPT_CONNECT_READ(0x7),

  /**
   * <em>write</em> enabled; <em>accept</em>, <em>connect</em>, and <em>read</em> disabled.
   */
  WRITE(0x8),

  /**
   * <em>accept</em> and <em>write</em> enabled; <em>connect</em> and <em>read</em> disabled.
   */
  ACCEPT_WRITE(0x9),

  /**
   * <em>connect</em> and <em>write</em> enabled; <em>accept</em> and <em>read</em> disabled.
   */
  CONNECT_WRITE(0xa),

  /**
   * <em>accept</em>, <em>connect</em>, and <em>write</em> enabled; <em>read</em> disabled.
   */
  ACCEPT_CONNECT_WRITE(0xb),

  /**
   * <em>read</em> and <em>write</em> enabled; <em>accept</em> and <em>connect</em> disabled.
   */
  READ_WRITE(0xc),

  /**
   * <em>accept</em>, <em>read</em>, and <em>write</em> enabled; <em>connect</em> disabled.
   */
  ACCEPT_READ_WRITE(0xd),

  /**
   * <em>connect</em>, <em>read</em>, and <em>write</em> enabled; <em>accept</em> disabled.
   */
  CONNECT_READ_WRITE(0xe),

  /**
   * <em>accept</em>, <em>connect</em>, <em>read</em>, and <em>write</em> enabled.
   */
  ACCEPT_CONNECT_READ_WRITE(0xf);

  private final int flags;

  FlowControl(int flags) {
    this.flags = flags;
  }

  /**
   * Returns {@code true} if the <em>accept</em> operation is enabled.
   */
  public boolean isAcceptEnabled() {
    return (this.flags & 0x1) != 0;
  }

  /**
   * Returns {@code true} if the <em>connect</em> operation is enabled.
   */
  public boolean isConnectEnabled() {
    return (this.flags & 0x2) != 0;
  }

  /**
   * Returns {@code true} if the <em>read</em> operation is enabled.
   */
  public boolean isReadEnabled() {
    return (this.flags & 0x4) != 0;
  }

  /**
   * Returns {@code true} if the <em>write</em> operation is enabled.
   */
  public boolean isWriteEnabled() {
    return (this.flags & 0x8) != 0;
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>accept</em> operation disabled.
   */
  public FlowControl acceptDisabled() {
    return fromFlags(this.flags & ~0x1);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>accept</em> operation enabled.
   */
  public FlowControl acceptEnabled() {
    return fromFlags(this.flags | 0x1);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>connect</em> operation disabled.
   */
  public FlowControl connectDisabled() {
    return fromFlags(this.flags & ~0x2);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>connect</em> operation enabled.
   */
  public FlowControl connectEnabled() {
    return fromFlags(this.flags | 0x2);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>read</em> operation disabled.
   */
  public FlowControl readDisabled() {
    return fromFlags(this.flags & ~0x4);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>read</em> operation enabled.
   */
  public FlowControl readEnabled() {
    return fromFlags(this.flags | 0x4);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>write</em> operation disabled.
   */
  public FlowControl writeDisabled() {
    return fromFlags(this.flags & ~0x8);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>write</em> operation enabled.
   */
  public FlowControl writeEnabled() {
    return fromFlags(this.flags | 0x8);
  }

  /**
   * Returns an updated {@code FlowControl} with its <em>read</em> and
   * <em>write</em> operations patched by a {@code flowModifier} delta.
   */
  public FlowControl modify(FlowModifier flowModifier) {
    int flags = this.flags;
    if (flowModifier.isReadDisabled()) {
      flags &= ~0x4;
    }
    if (flowModifier.isWriteDisabled()) {
      flags &= ~0x8;
    }
    if (flowModifier.isReadEnabled()) {
      flags |= 0x4;
    }
    if (flowModifier.isWriteEnabled()) {
      flags |= 0x8;
    }
    return fromFlags(flags);
  }

  /**
   * Returns the {@code FlowControl} with all operations enabled in {@code
   * this} or {@code that} enabled.
   */
  public FlowControl or(FlowControl that) {
    return fromFlags(this.flags | that.flags);
  }

  /**
   * Returns the {@code FlowControl} with all operations enabled in {@code
   * this} or {@code that}—but not both—enabled.
   */
  public FlowControl xor(FlowControl that) {
    return fromFlags(this.flags ^ that.flags);
  }

  /**
   * Returns the {@code FlowControl} with all operations enabled in {@code
   * this} and {@code that} enabled.
   */
  public FlowControl and(FlowControl that) {
    return fromFlags(this.flags & that.flags);
  }

  /**
   * Returns the {@code FlowControl} with all operations enabled in {@code
   * this} disabled, and all operations disabled in {@code this} enabled.
   */
  public FlowControl not() {
    return fromFlags(~this.flags & 0xf);
  }

  /**
   * Returns the {@link SelectionKey} interest set corresponding to this
   * {@code FlowControl}.
   */
  public int toSelectorOps() {
    final int flags = this.flags;
    int selectorOps = 0;
    if ((flags & 0x1) != 0) {
      selectorOps |= SelectionKey.OP_ACCEPT;
    }
    if ((flags & 0x2) != 0) {
      selectorOps |= SelectionKey.OP_CONNECT;
    }
    if ((flags & 0x4) != 0) {
      selectorOps |= SelectionKey.OP_READ;
    }
    if ((flags & 0x8) != 0) {
      selectorOps |= SelectionKey.OP_WRITE;
    }
    return selectorOps;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("FlowControl").write('.').write(name());
  }

  private static FlowControl fromFlags(int flags) {
    switch (flags) {
      case 0x0: return WAIT;
      case 0x1: return ACCEPT;
      case 0x2: return CONNECT;
      case 0x3: return ACCEPT_CONNECT;
      case 0x4: return READ;
      case 0x5: return ACCEPT_READ;
      case 0x6: return CONNECT_READ;
      case 0x7: return ACCEPT_CONNECT_READ;
      case 0x8: return WRITE;
      case 0x9: return ACCEPT_WRITE;
      case 0xa: return CONNECT_WRITE;
      case 0xb: return ACCEPT_CONNECT_WRITE;
      case 0xc: return READ_WRITE;
      case 0xd: return ACCEPT_READ_WRITE;
      case 0xe: return CONNECT_READ_WRITE;
      case 0xf: return ACCEPT_CONNECT_READ_WRITE;
      default: throw new IllegalArgumentException("0x" + Integer.toHexString(flags));
    }
  }

  /**
   * Returns the {@code FlowControl} corresponding to the given {@link
   * SelectionKey} interest set.
   */
  public static FlowControl fromSelectorOps(int selectorOps) {
    int flags = 0;
    if ((selectorOps & SelectionKey.OP_ACCEPT) != 0) {
      flags |= 0x1;
    }
    if ((selectorOps & SelectionKey.OP_CONNECT) != 0) {
      flags |= 0x2;
    }
    if ((selectorOps & SelectionKey.OP_READ) != 0) {
      flags |= 0x4;
    }
    if ((selectorOps & SelectionKey.OP_WRITE) != 0) {
      flags |= 0x8;
    }
    return fromFlags(flags);
  }
}
