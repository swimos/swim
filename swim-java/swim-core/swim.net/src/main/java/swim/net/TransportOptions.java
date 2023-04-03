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

package swim.net;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * {@link TransportDriver} configuration options.
 */
@Public
@Since("5.0")
public class TransportOptions implements ToSource {

  protected final long idleInterval;
  protected final long idleTimeout;

  public TransportOptions(long idleInterval, long idleTimeout) {
    this.idleInterval = idleInterval;
    this.idleTimeout = idleTimeout;
  }

  /**
   * Returns the number of milliseconds between transport idle checks.
   */
  public final long idleInterval() {
    return this.idleInterval;
  }

  /**
   * Returns a copy of these options configured with the
   * given {@code idleInterval} for transport idle checks.
   */
  public TransportOptions idleInterval(long idleInterval) {
    return this.copy(idleInterval, this.idleTimeout);
  }

  /**
   * Returns the default number of idle milliseconds after which a transport
   * should be timed out due to inactivity.
   */
  public final long idleTimeout() {
    return this.idleTimeout;
  }

  /**
   * Returns a copy of these options configured with the
   * given {@code idleTimeout} for transport idle timeouts
   */
  public TransportOptions idleTimeout(long idleTimeout) {
    return this.copy(this.idleInterval, idleTimeout);
  }

  /**
   * Returns a copy of these options with the given transport options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating options.
   */
  protected TransportOptions copy(long idleInterval, long idleTimeout) {
    return new TransportOptions(idleInterval, idleTimeout);
  }

  /**
   * Returns {@code true} if these {@code TransportOptions} can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TransportOptions;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TransportOptions) {
      final TransportOptions that = (TransportOptions) other;
      return that.canEqual(this)
          && this.idleInterval == that.idleInterval
          && this.idleTimeout == that.idleTimeout;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(TransportOptions.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Murmur3.hash(this.idleInterval)), Murmur3.hash(this.idleTimeout)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TransportOptions", "standard").endInvoke()
            .beginInvoke("idleInterval").appendArgument(this.idleInterval).endInvoke()
            .beginInvoke("idleTimeout").appendArgument(this.idleTimeout).endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static @Nullable TransportOptions standard;

  /**
   * Returns the default {@code TransportOptions} instance.
   */
  public static TransportOptions standard() {
    if (TransportOptions.standard == null) {
      long idleInterval;
      try {
        idleInterval = Long.parseLong(System.getProperty("swim.net.transport.idle.interval"));
      } catch (NumberFormatException cause) {
        idleInterval = 30000L; // 30 seconds
      }

      long idleTimeout;
      try {
        idleTimeout = Long.parseLong(System.getProperty("swim.net.transport.idle.timeout"));
      } catch (NumberFormatException cause) {
        idleTimeout = 90000L; // 90 seconds
      }

      TransportOptions.standard = new TransportOptions(idleInterval, idleTimeout);
    }
    return TransportOptions.standard;
  }

}
