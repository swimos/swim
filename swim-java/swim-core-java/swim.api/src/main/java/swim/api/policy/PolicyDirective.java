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

package swim.api.policy;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public abstract class PolicyDirective<T> implements Debug {
  PolicyDirective() { }

  public boolean isAllowed() {
    return false;
  }

  public boolean isDenied() {
    return false;
  }

  public boolean isForbidden() {
    return false;
  }

  public boolean isDefined() {
    return false;
  }

  public T get() {
    throw null;
  }

  public Policy policy() {
    return null;
  }

  public Object reason() {
    return null;
  }

  private static Allow<Object> allow;

  private static Allow<Object> staticAllow() {
    if (allow == null) {
      allow = new Allow<>(null);
    }
    return allow;
  }

  @SuppressWarnings("unchecked")
  public static <T> PolicyDirective<T> allow(T value) {
    if (value != null) {
      return new Allow<T>(value);
    } else {
      return (Allow<T>) staticAllow();
    }
  }

  @SuppressWarnings("unchecked")
  public static <T> PolicyDirective<T> allow() {
    return (PolicyDirective<T>) staticAllow();
  }

  public static <T> PolicyDirective<T> deny(Policy policy, Object reason) {
    return new Deny<T>(policy, reason);
  }

  public static <T> PolicyDirective<T> deny(Policy policy) {
    return new Deny<T>(policy, null);
  }

  public static <T> PolicyDirective<T> deny(Object reason) {
    return new Deny<T>(null, reason);
  }

  public static <T> PolicyDirective<T> deny() {
    return new Deny<T>(null, null);
  }

  public static <T> PolicyDirective<T> forbid(Policy policy, Object reason) {
    return new Forbid<T>(policy, reason);
  }

  public static <T> PolicyDirective<T> forbid(Policy policy) {
    return new Forbid<T>(policy, null);
  }

  public static <T> PolicyDirective<T> forbid(Object reason) {
    return new Forbid<T>(null, reason);
  }

  public static <T> PolicyDirective<T> forbid() {
    return new Forbid<T>(null, null);
  }

  static final class Allow<T> extends PolicyDirective<T> {
    final T value;

    Allow(T value) {
      this.value = value;
    }

    @Override
    public boolean isAllowed() {
      return true;
    }

    @Override
    public boolean isDefined() {
      return value != null;
    }

    @Override
    public T get() {
      return value;
    }

    @Override
    public boolean equals(Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof Allow<?>) {
        final Allow<?> that = (Allow<?>) other;
        return value == null ? that.value == null : value.equals(that.value);
      } else {
        return false;
      }
    }

    @Override
    public int hashCode() {
      if (hashSeed == 0) {
        hashSeed = Murmur3.seed(Allow.class);
      }
      return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(value)));
    }

    private static int hashSeed;

    @Override
    public void debug(Output<?> output) {
      output = output.write("PolicyDirective").write('.').write("allow")
        .write('(');
      if (value != null) {
        output = output.debug(value);
      }
      output = output.write(')');
    }

    @Override
    public String toString() {
      return Format.debug(this);
    }
  }

  static final class Deny<T> extends PolicyDirective<T> {
    final Policy policy;
    final Object reason;

    Deny(Policy policy, Object reason) {
      this.policy = policy;
      this.reason = reason;
    }

    @Override
    public boolean isDenied() {
      return true;
    }

    @Override
    public Policy policy() {
      return policy;
    }

    @Override
    public Object reason() {
      return reason;
    }

    @Override
    public boolean equals(Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof Deny<?>) {
        final Deny<?> that = (Deny<?>) other;
        return (policy == null ? that.policy == null : policy.equals(that.policy))
          && (reason == null ? that.reason == null : reason.equals(that.reason));
      } else {
        return false;
      }
    }

    @Override
    public int hashCode() {
      if (hashSeed == 0) {
        hashSeed = Murmur3.seed(Deny.class);
      }
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
          Murmur3.hash(policy)), Murmur3.hash(reason)));
    }

    private static int hashSeed;

    @Override
    public void debug(Output<?> output) {
      output = output.write("PolicyDirective").write('.')
          .write("deny").write('(').debug(policy);
      if (reason != null) {
        output = output.write(", ").debug(reason);
      }
      output = output.write(')');
    }

    @Override
    public String toString() {
      return Format.debug(this);
    }
  }

  static final class Forbid<T> extends PolicyDirective<T> {
    final Policy policy;
    final Object reason;

    Forbid(Policy policy, Object reason) {
      this.policy = policy;
      this.reason = reason;
    }

    @Override
    public boolean isForbidden() {
      return true;
    }

    @Override
    public Policy policy() {
      return policy;
    }

    @Override
    public Object reason() {
      return reason;
    }

    @Override
    public boolean equals(Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof Forbid<?>) {
        final Forbid<?> that = (Forbid<?>) other;
        return (policy == null ? that.policy == null : policy.equals(that.policy))
          && (reason == null ? that.reason == null : reason.equals(that.reason));
      } else {
        return false;
      }
    }

    @Override
    public int hashCode() {
      if (hashSeed == 0) {
        hashSeed = Murmur3.seed(Forbid.class);
      }
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
          Murmur3.hash(policy)), Murmur3.hash(reason)));
    }

    private static int hashSeed;

    @Override
    public void debug(Output<?> output) {
      output = output.write("PolicyDirective").write('.').write("forbid")
          .write('(').debug(policy);
      if (reason != null) {
        output = output.write(", ").debug(reason);
      }
      output = output.write(')');
    }

    @Override
    public String toString() {
      return Format.debug(this);
    }
  }
}
